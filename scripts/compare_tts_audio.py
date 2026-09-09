"""
Gyan Multilingual TTS — Baseline vs GAN-Augmented Audio Comparison.

Uses:
    - Same 9 validation sentences
    - Same baseline/augmented TTS architecture
    - Same HiFi-GAN vocoder
    - Same output sample rate

Outputs:
    D:/Gyan/outputs/tts_comparison/
        baseline/
        augmented/
        comparison_metadata.json
"""

import sys
import io
import json
from pathlib import Path

import torch


# ============================================================
# Project setup
# ============================================================

PROJECT_ROOT = Path("D:/Gyan")

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer,
        encoding="utf-8"
    )
except Exception:
    pass


# ============================================================
# Project imports
# ============================================================

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import MultilingualTTSDataset
from ai.inference.hifigan_vocoder import HiFiGANVocoder


# ============================================================
# Paths
# ============================================================

BASELINE_CHECKPOINT = (
    PROJECT_ROOT
    / "checkpoints"
    / "tts_baseline"
    / "tts_best.pt"
)

AUGMENTED_CHECKPOINT = (
    PROJECT_ROOT
    / "checkpoints"
    / "tts_augmented"
    / "tts_best.pt"
)

VALIDATION_CSV = (
    PROJECT_ROOT
    / "data"
    / "splits"
    / "validation_tts.csv"
)

OUTPUT_ROOT = (
    PROJECT_ROOT
    / "outputs"
    / "tts_comparison"
)


# ============================================================
# Comparison configuration
# ============================================================

NUM_PER_LANGUAGE = 3

LANGUAGE_NAMES = {
    0: "en",
    1: "hi",
    2: "mr",
}


# ============================================================
# Model loading
# ============================================================

def load_model(
    checkpoint_path: Path,
    config: TTSConfig,
    device: torch.device,
):
    """
    Load a trained MultilingualTTS checkpoint.
    """

    if not checkpoint_path.exists():
        raise FileNotFoundError(
            f"Checkpoint not found:\n{checkpoint_path}"
        )

    model = MultilingualTTS(config).to(device)

    checkpoint = torch.load(
        checkpoint_path,
        map_location=device,
        weights_only=False,
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.eval()

    print(
        f"Loaded checkpoint: {checkpoint_path}"
    )

    print(
        f"Checkpoint epoch: "
        f"{checkpoint.get('epoch', 'unknown')}"
    )

    if "metrics" in checkpoint:
        metrics = checkpoint["metrics"]

        if isinstance(metrics, dict):
            if "val_loss" in metrics:
                print(
                    f"Checkpoint Val Loss: "
                    f"{metrics['val_loss']}"
                )

    return model


# ============================================================
# Single sample synthesis
# ============================================================

@torch.no_grad()
def synthesize_sample(
    model,
    sample,
    vocoder,
    device,
    output_path: Path,
):
    """
    Generate mel spectrogram from text and convert it
    to waveform using the same HiFi-GAN vocoder.
    """

    # --------------------------------------------------------
    # Text input
    # --------------------------------------------------------

    text_ids = sample["text_ids"].unsqueeze(0).to(device)

    text_lengths = torch.tensor(
        [int(sample["text_length"])],
        dtype=torch.long,
        device=device,
    )

    language_ids = torch.tensor(
        [int(sample["language_id"])],
        dtype=torch.long,
        device=device,
    )

    # Use the reference validation duration so that both
    # models are evaluated under the same mel length.
    mel_lengths = torch.tensor(
        [int(sample["mel_length"])],
        dtype=torch.long,
        device=device,
    )

    # --------------------------------------------------------
    # TTS inference
    # --------------------------------------------------------

    coarse_mel, refined_mel = model(
        text_ids=text_ids,
        text_lengths=text_lengths,
        language_ids=language_ids,
        mel_lengths=mel_lengths,
        )

    print(f"    coarse_mel shape:  {tuple(coarse_mel.shape)}")
    print(f"    refined_mel shape: {tuple(refined_mel.shape)}")

# Normalize model output to [80, T]
    if refined_mel.dim() == 4:
        # Expected: [B, 1, 80, T]
        if refined_mel.size(0) != 1:
            raise ValueError(
                f"Expected batch size 1, got {refined_mel.size(0)}")

        if refined_mel.size(1) == 1:
            mel = refined_mel[0, 0]
        else:
            raise ValueError(
                f"Unexpected 4D refined mel shape: "
                f"{tuple(refined_mel.shape)}")

    elif refined_mel.dim() == 3:
        # Possible: [B, 80, T]
        if refined_mel.size(0) != 1:
            raise ValueError(
            f"Expected batch size 1, got {refined_mel.size(0)}"
        )
        mel = refined_mel[0]
    elif refined_mel.dim() == 2:# Possible: [80, T]
         mel = refined_mel

    else:
        raise ValueError(
        f"Unexpected refined mel dimensions: "
        f"{tuple(refined_mel.shape)}")

    print(f"    mel passed to HiFi-GAN: {tuple(mel.shape)}")

    if mel.dim() != 2:
        raise ValueError(
        f"HiFi-GAN expects [80, T], got {tuple(mel.shape)}" )

    waveform = vocoder.mel_to_waveform(mel)

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    saved_path = vocoder.save_wav(
        waveform,
        output_path,
    )

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    num_samples = waveform.numel()

    sampling_rate = vocoder.config.sampling_rate

    duration_sec = (
        num_samples / sampling_rate
        if sampling_rate > 0
        else 0.0
    )

    peak_amplitude = (
        waveform.abs().max().item()
        if num_samples > 0
        else 0.0
    )

    is_valid = (
        num_samples > 0
        and peak_amplitude > 0
        and not torch.isnan(waveform).any()
        and not torch.isinf(waveform).any()
    )

    return {
        "output_path": str(saved_path),
        "mel_frames": int(mel.shape[-1]),
        "audio_samples": int(num_samples),
        "sampling_rate": int(sampling_rate),
        "duration_sec": round(
            duration_sec,
            4,
        ),
        "peak_amplitude": round(
            peak_amplitude,
            6,
        ),
        "valid": bool(is_valid),
    }


# ============================================================
# Select fixed validation samples
# ============================================================

def select_validation_samples(dataset):
    """
    Select exactly NUM_PER_LANGUAGE samples for each language.

    Selection is deterministic because the validation dataset
    order is fixed and no shuffling is used here.
    """

    selected = {
        "en": [],
        "hi": [],
        "mr": [],
    }

    for idx in range(len(dataset)):

        sample = dataset[idx]

        language_id = int(
            sample["language_id"]
        )

        language = LANGUAGE_NAMES.get(
            language_id
        )

        if language is None:
            continue

        if (
            len(selected[language])
            < NUM_PER_LANGUAGE
        ):
            selected[language].append(
                (idx, sample)
            )

        if all(
            len(samples) >= NUM_PER_LANGUAGE
            for samples in selected.values()
        ):
            break

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    for language in ["en", "hi", "mr"]:

        if (
            len(selected[language])
            != NUM_PER_LANGUAGE
        ):
            raise RuntimeError(
                f"Could not find "
                f"{NUM_PER_LANGUAGE} samples "
                f"for language={language}"
            )

    return selected


# ============================================================
# Main
# ============================================================

def main():

    print("=" * 85)
    print(
        "GYAN TTS — BASELINE VS GAN-AUGMENTED "
        "AUDIO COMPARISON"
    )
    print("=" * 85)

    # --------------------------------------------------------
    # Configuration
    # --------------------------------------------------------

    config = TTSConfig()

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    print(
        f"Device: {device}"
    )

    if device.type == "cuda":
        print(
            f"GPU:    "
            f"{torch.cuda.get_device_name(0)}"
        )

    # --------------------------------------------------------
    # Verify required files
    # --------------------------------------------------------

    required_files = [
        BASELINE_CHECKPOINT,
        AUGMENTED_CHECKPOINT,
        VALIDATION_CSV,
    ]

    for path in required_files:

        if not path.exists():
            raise FileNotFoundError(
                f"Required file does not exist:\n{path}"
            )

    # --------------------------------------------------------
    # Load baseline
    # --------------------------------------------------------

    print("\n" + "-" * 85)
    print("LOADING BASELINE MODEL")
    print("-" * 85)

    baseline_model = load_model(
        BASELINE_CHECKPOINT,
        config,
        device,
    )

    # --------------------------------------------------------
    # Load augmented
    # --------------------------------------------------------

    print("\n" + "-" * 85)
    print("LOADING GAN-AUGMENTED MODEL")
    print("-" * 85)

    augmented_model = load_model(
        AUGMENTED_CHECKPOINT,
        config,
        device,
    )

    # --------------------------------------------------------
    # Load the SAME HiFi-GAN vocoder
    # --------------------------------------------------------

    print("\n" + "-" * 85)
    print("LOADING HIFI-GAN VOCODER")
    print("-" * 85)

    vocoder = HiFiGANVocoder(
        device=device
    )

    print(
        f"Vocoder sampling rate: "
        f"{vocoder.config.sampling_rate} Hz"
    )

    # --------------------------------------------------------
    # Validation dataset
    # --------------------------------------------------------

    dataset = MultilingualTTSDataset(
        VALIDATION_CSV,
        config=config,
    )

    print(
        f"\nValidation samples available: "
        f"{len(dataset):,}"
    )

    # --------------------------------------------------------
    # Fixed samples
    # --------------------------------------------------------

    selected = select_validation_samples(
        dataset
    )

    # --------------------------------------------------------
    # Output directories
    # --------------------------------------------------------

    baseline_dir = (
        OUTPUT_ROOT
        / "baseline"
    )

    augmented_dir = (
        OUTPUT_ROOT
        / "augmented"
    )

    baseline_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    augmented_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Results
    # --------------------------------------------------------

    results = []

    # ========================================================
    # Synthesis loop
    # ========================================================

    for language in ["en", "hi", "mr"]:

        print("\n" + "=" * 85)
        print(
            f"LANGUAGE: "
            f"{language.upper()}"
        )
        print("=" * 85)

        for sample_number, (
            validation_index,
            sample,
        ) in enumerate(
            selected[language],
            start=1,
        ):

            text = str(
                sample["text"]
            )

            print(
                f"\nSample {sample_number}"
            )

            print(
                f"Validation index: "
                f"{validation_index}"
            )

            print(
                f"Text: "
                f"{text[:150]}"
            )

            # ------------------------------------------------
            # Output paths
            # ------------------------------------------------

            baseline_path = (
                baseline_dir
                / f"{language}_{sample_number}.wav"
            )

            augmented_path = (
                augmented_dir
                / f"{language}_{sample_number}.wav"
            )

            # ------------------------------------------------
            # Baseline synthesis
            # ------------------------------------------------

            print(
                "  Synthesizing baseline..."
            )

            baseline_result = (
                synthesize_sample(
                    model=baseline_model,
                    sample=sample,
                    vocoder=vocoder,
                    device=device,
                    output_path=baseline_path,
                )
            )

            # ------------------------------------------------
            # Augmented synthesis
            # ------------------------------------------------

            print(
                "  Synthesizing GAN-augmented..."
            )

            augmented_result = (
                synthesize_sample(
                    model=augmented_model,
                    sample=sample,
                    vocoder=vocoder,
                    device=device,
                    output_path=augmented_path,
                )
            )

            # ------------------------------------------------
            # Print metrics
            # ------------------------------------------------

            print(
                f"  Baseline duration:  "
                f"{baseline_result['duration_sec']:.3f}s"
            )

            print(
                f"  Augmented duration: "
                f"{augmented_result['duration_sec']:.3f}s"
            )

            print(
                f"  Baseline valid:     "
                f"{baseline_result['valid']}"
            )

            print(
                f"  Augmented valid:    "
                f"{augmented_result['valid']}"
            )

            # ------------------------------------------------
            # Store result
            # ------------------------------------------------

            results.append(
                {
                    "language": language,
                    "sample_number": sample_number,
                    "validation_index": validation_index,
                    "text": text,

                    "baseline": baseline_result,

                    "augmented": augmented_result,
                }
            )

    # ========================================================
    # Validate outputs
    # ========================================================

    total_expected = (
        3 * NUM_PER_LANGUAGE
    )

    if len(results) != total_expected:
        raise RuntimeError(
            f"Expected "
            f"{total_expected} comparisons "
            f"but generated "
            f"{len(results)}."
        )

    invalid = []

    for result in results:

        if not result["baseline"]["valid"]:
            invalid.append(
                (
                    result["language"],
                    result["sample_number"],
                    "baseline",
                )
            )

        if not result["augmented"]["valid"]:
            invalid.append(
                (
                    result["language"],
                    result["sample_number"],
                    "augmented",
                )
            )

    # ========================================================
    # Save metadata
    # ========================================================

    metadata_path = (
        OUTPUT_ROOT
        / "comparison_metadata.json"
    )

    with open(
        metadata_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            results,
            f,
            indent=2,
            ensure_ascii=False,
        )

    # ========================================================
    # Final report
    # ========================================================

    print("\n" + "=" * 85)
    print("AUDIO COMPARISON COMPLETE")
    print("=" * 85)

    print(
        f"Comparisons generated: "
        f"{len(results)}"
    )

    print(
        f"Invalid outputs: "
        f"{len(invalid)}"
    )

    print(
        f"\nBaseline output directory:\n"
        f"{baseline_dir}"
    )

    print(
        f"\nAugmented output directory:\n"
        f"{augmented_dir}"
    )

    print(
        f"\nMetadata:\n"
        f"{metadata_path}"
    )

    if invalid:
        print("\nWARNING: Invalid outputs detected:")

        for item in invalid:
            print(
                f"  {item}"
            )

    else:
        print(
            "\nAll generated WAV files are valid."
        )

    print(
        "\n>>> AUDIO COMPARISON "
        "FINISHED SUCCESSFULLY <<<"
    )


if __name__ == "__main__":
    main()
"""
Gyan Multilingual TTS — Demo Inference

Complete demo pipeline:

    Input Text
        ↓
    Multilingual Vocabulary
        ↓
    Multilingual Acoustic Model
        ↓
    Predicted Log-Mel Spectrogram
        ↓
    Mel Visualization
        ↓
    Griffin-Lim Reconstruction
        ↓
    WAV Audio

Usage:
    python -m ai.inference.demo_inference
"""

from pathlib import Path
from typing import Tuple

import matplotlib.pyplot as plt
import torch

from ai.configs.tts_config import TTSConfig
from ai.inference.mel_to_audio import MelToAudio
from ai.models.multilingual_tts import MultilingualTTS
from ai.utils.text_utils import MultilingualVocabulary


# ============================================================
# CONFIGURATION
# ============================================================

CHECKPOINT_PATH = Path(
    "D:/Gyan/checkpoints/demo/best_model.pt"
)

OUTPUT_DIR = Path(
    "D:/Gyan/outputs"
)


# ============================================================
# DEVICE
# ============================================================

def get_device() -> torch.device:
    """Returns CUDA device if available, otherwise CPU."""

    if torch.cuda.is_available():

        device = torch.device("cuda")

        print(
            f"Using GPU: "
            f"{torch.cuda.get_device_name(0)}"
        )

    else:

        device = torch.device("cpu")

        print(
            "CUDA not available. "
            "Using CPU."
        )

    return device


# ============================================================
# LOAD MODEL AND VOCABULARY
# ============================================================

def load_model_and_vocab(
    device: torch.device,
) -> Tuple[
    MultilingualTTS,
    MultilingualVocabulary,
    TTSConfig,
]:
    """
    Loads:

    - TTS configuration
    - multilingual vocabulary
    - trained acoustic model checkpoint
    """

    config = TTSConfig()

    # --------------------------------------------------------
    # Vocabulary
    # --------------------------------------------------------

    vocab = MultilingualVocabulary(
        config.text
    )

    if not config.data.vocab_file.exists():

        raise FileNotFoundError(
            "Vocabulary file not found: "
            f"{config.data.vocab_file}"
        )

    vocab.load(
        config.data.vocab_file
    )

    # Ensure model vocabulary size matches saved vocabulary.
    config.model.vocab_size = len(vocab)

    print(
        f"Vocabulary loaded: "
        f"{len(vocab)} tokens"
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = MultilingualTTS(
        config=config,
        vocab_size=len(vocab),
    )

    # --------------------------------------------------------
    # Checkpoint
    # --------------------------------------------------------

    if not CHECKPOINT_PATH.exists():

        raise FileNotFoundError(
            "Checkpoint not found: "
            f"{CHECKPOINT_PATH}"
        )

    # weights_only=False is required because the checkpoint
    # may contain the TTSConfig object.
    checkpoint = torch.load(
        CHECKPOINT_PATH,
        map_location=device,
        weights_only=False,
    )

    if "model_state_dict" not in checkpoint:

        raise KeyError(
            "Checkpoint does not contain "
            "'model_state_dict'."
        )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model = model.to(device)

    model.eval()

    print(
        "Checkpoint loaded: "
        f"{CHECKPOINT_PATH}"
    )

    print(
        f"Checkpoint epoch: "
        f"{checkpoint.get('epoch', 'unknown')}"
    )

    return model, vocab, config


# ============================================================
# MEL LENGTH ESTIMATION
# ============================================================

def estimate_mel_length(
    text: str,
) -> int:
    """
    Estimates output mel length.

    The current acoustic model requires mel_lengths as an
    input because the decoder is not yet autoregressive and
    does not predict a stop token or duration.

    This heuristic is used only for demonstration.
    """

    text_length = len(text)

    estimated_length = max(
        100,
        text_length * 8,
    )

    estimated_length = min(
        estimated_length,
        1500,
    )

    return estimated_length


# ============================================================
# TEXT -> MEL SYNTHESIS
# ============================================================

@torch.no_grad()
def synthesize_mel(
    model: MultilingualTTS,
    vocab: MultilingualVocabulary,
    config: TTSConfig,
    text: str,
    language: str,
    device: torch.device,
) -> torch.Tensor:
    """
    Generates a predicted log-mel spectrogram from text.

    Args:
        model:
            Loaded MultilingualTTS model.

        vocab:
            Multilingual vocabulary.

        config:
            TTS configuration.

        text:
            Input text.

        language:
            Language code:
            en / hi / mr

        device:
            CPU or CUDA device.

    Returns:
        Predicted log-mel tensor with shape:

            [n_mels, frames]
    """

    # --------------------------------------------------------
    # Validate language
    # --------------------------------------------------------

    language = language.strip().lower()

    if language not in config.language.language_map:

        raise ValueError(
            f"Unsupported language: {language}. "
            f"Choose from "
            f"{list(config.language.language_map.keys())}"
        )

    language_id = (
        config.language.language_map[language]
    )

    # --------------------------------------------------------
    # Text encoding
    # --------------------------------------------------------

    sequence = vocab.text_to_sequence(
        text,
        add_bos=config.text.add_bos,
        add_eos=config.text.add_eos,
    )

    if len(sequence) == 0:

        raise ValueError(
            "Input text produced an empty token sequence."
        )

    text_ids = torch.tensor(
        sequence,
        dtype=torch.long,
    ).unsqueeze(0).to(device)

    text_lengths = torch.tensor(
        [len(sequence)],
        dtype=torch.long,
        device=device,
    )

    language_ids = torch.tensor(
        [language_id],
        dtype=torch.long,
        device=device,
    )

    # --------------------------------------------------------
    # Estimate mel length
    # --------------------------------------------------------

    mel_length = estimate_mel_length(
        text
    )

    mel_lengths = torch.tensor(
        [mel_length],
        dtype=torch.long,
        device=device,
    )

    # --------------------------------------------------------
    # Print inference details
    # --------------------------------------------------------

    print()
    print("Inference details")
    print("-" * 50)

    print(f"Text: {text}")

    print(
        f"Language: "
        f"{language}"
    )

    print(
        f"Language ID: "
        f"{language_id}"
    )

    print(
        f"Text tokens: "
        f"{len(sequence)}"
    )

    print(
        f"Estimated mel frames: "
        f"{mel_length}"
    )

    # --------------------------------------------------------
    # Model forward pass
    # --------------------------------------------------------

    coarse_mel, refined_mel = model(
        text_ids=text_ids,
        text_lengths=text_lengths,
        language_ids=language_ids,
        mel_lengths=mel_lengths,
    )

    # Remove batch dimension.
    mel = refined_mel.squeeze(0).detach().cpu()

    # --------------------------------------------------------
    # Validate output
    # --------------------------------------------------------

    if torch.isnan(mel).any():

        raise ValueError(
            "Generated mel contains NaN values."
        )

    if torch.isinf(mel).any():

        raise ValueError(
            "Generated mel contains Inf values."
        )

    print(
        f"Generated mel shape: "
        f"{tuple(mel.shape)}"
    )

    return mel


# ============================================================
# SAVE MEL TENSOR
# ============================================================

def save_mel(
    mel: torch.Tensor,
    output_path: Path,
) -> None:
    """Saves predicted mel tensor."""

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    torch.save(
        mel,
        output_path,
    )

    print(
        f"Mel tensor saved: "
        f"{output_path}"
    )


# ============================================================
# VISUALIZE MEL
# ============================================================

def plot_mel(
    mel: torch.Tensor,
    image_path: Path,
    language: str,
) -> None:
    """Saves a visualization of the predicted mel spectrogram."""

    image_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    plt.figure(
        figsize=(12, 5)
    )

    plt.imshow(
        mel.numpy(),
        aspect="auto",
        origin="lower",
    )

    plt.colorbar(
        label="Log-Mel Value"
    )

    plt.xlabel(
        "Time Frames"
    )

    plt.ylabel(
        "Mel Channel"
    )

    plt.title(
        f"Gyan Multilingual TTS — "
        f"Predicted Mel ({language.upper()})"
    )

    plt.tight_layout()

    plt.savefig(
        image_path,
        dpi=150,
    )

    plt.close()

    print(
        f"Mel image saved: "
        f"{image_path}"
    )


# ============================================================
# MEL -> AUDIO
# ============================================================

def generate_audio(
    mel: torch.Tensor,
    config: TTSConfig,
    device: torch.device,
    output_path: Path,
) -> Path:
    """
    Converts predicted log-mel spectrogram to WAV audio.

    Pipeline:

        Predicted Log-Mel
                ↓
              exp()
                ↓
          Inverse Mel
                ↓
          Griffin-Lim
                ↓
            Waveform
                ↓
              WAV
    """

    print()
    print(
        "Reconstructing audio from predicted mel..."
    )

    # --------------------------------------------------------
    # Create converter
    # --------------------------------------------------------

    audio_converter = MelToAudio(
        config=config.audio,
        device=device,
    )

    # --------------------------------------------------------
    # Convert mel -> waveform
    #
    # IMPORTANT:
    # We call the object's method.
    # Do NOT do:
    #
    # waveform = audio_converter(mel)
    #
    # --------------------------------------------------------

    waveform = audio_converter.mel_to_waveform(
        mel
    )

    print(
        f"Generated waveform shape: "
        f"{tuple(waveform.shape)}"
    )

    # --------------------------------------------------------
    # Save waveform
    # --------------------------------------------------------

    saved_path = audio_converter.save_wav(
        waveform=waveform,
        output_path=output_path,
    )

    return saved_path


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 60)

    print(
        "GYAN MULTILINGUAL TTS — DEMO INFERENCE"
    )

    print("=" * 60)

    # --------------------------------------------------------
    # Example multilingual inputs
    # --------------------------------------------------------

    examples = [

        (
            "Hello, welcome to Gyan.",
            "en",
            "english_demo",
        ),

        (
            "नमस्ते, ज्ञान में आपका स्वागत है।",
            "hi",
            "hindi_demo",
        ),

        (
            "नमस्कार, ज्ञान मध्ये तुमचे स्वागत आहे.",
            "mr",
            "marathi_demo",
        ),

    ]

    # --------------------------------------------------------
    # Device
    # --------------------------------------------------------

    device = get_device()

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    model, vocab, config = load_model_and_vocab(
        device
    )

    # --------------------------------------------------------
    # Create output directory
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Generate for every language
    # --------------------------------------------------------

    for text, language, name in examples:

        print()
        print("=" * 60)

        print(
            f"GENERATING: "
            f"{language.upper()}"
        )

        print("=" * 60)

        # ----------------------------------------------------
        # Text -> Mel
        # ----------------------------------------------------

        mel = synthesize_mel(
            model=model,
            vocab=vocab,
            config=config,
            text=text,
            language=language,
            device=device,
        )

        # ----------------------------------------------------
        # Output paths
        # ----------------------------------------------------

        mel_path = (
            OUTPUT_DIR
            / f"{name}_mel.pt"
        )

        image_path = (
            OUTPUT_DIR
            / f"{name}_mel.png"
        )

        audio_path = (
            OUTPUT_DIR
            / f"{name}.wav"
        )

        # ----------------------------------------------------
        # Save mel tensor
        # ----------------------------------------------------

        save_mel(
            mel=mel,
            output_path=mel_path,
        )

        # ----------------------------------------------------
        # Save mel visualization
        # ----------------------------------------------------

        plot_mel(
            mel=mel,
            image_path=image_path,
            language=language,
        )

        # ----------------------------------------------------
        # Mel -> WAV
        # ----------------------------------------------------

        generate_audio(
            mel=mel,
            config=config,
            device=device,
            output_path=audio_path,
        )

        print()

        print(
            f"{language.upper()} generation complete."
        )

    # --------------------------------------------------------
    # Complete
    # --------------------------------------------------------

    print()

    print("=" * 60)

    print(
        "INFERENCE COMPLETE"
    )

    print("=" * 60)

    print()

    print(
        f"Outputs saved to: "
        f"{OUTPUT_DIR}"
    )

    print()

    print(
        "Generated files:"
    )

    for path in sorted(
        OUTPUT_DIR.iterdir()
    ):

        if path.is_file():

            print(
                f"  - {path.name}"
            )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
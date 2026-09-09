import sys
from pathlib import Path

import torch

PROJECT_ROOT = Path("D:/Gyan")

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import MultilingualTTSDataset
from ai.inference.hifigan_vocoder import HiFiGANVocoder


CHECKPOINT = (
    PROJECT_ROOT
    / "checkpoints"
    / "tts_baseline"
    / "tts_best.pt"
)

VALIDATION_CSV = (
    PROJECT_ROOT
    / "data"
    / "splits"
    / "validation_tts.csv"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "outputs"
    / "tts_diagnostic"
)


@torch.no_grad()
def main():
    config = TTSConfig()

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print("=" * 80)
    print("TTS MEL DIAGNOSTIC")
    print("=" * 80)
    print(f"Device: {device}")

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    model = MultilingualTTS(config).to(device)

    checkpoint = torch.load(
        CHECKPOINT,
        map_location=device,
        weights_only=False,
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.eval()

    print(f"Loaded: {CHECKPOINT}")

    # --------------------------------------------------------
    # Load vocoder
    # --------------------------------------------------------

    vocoder = HiFiGANVocoder(
        device=device
    )

    # --------------------------------------------------------
    # Validation sample
    # --------------------------------------------------------

    dataset = MultilingualTTSDataset(
        VALIDATION_CSV,
        config=config,
    )

    sample = dataset[0]

    print("\nText:")
    print(sample["text"])

    # --------------------------------------------------------
    # Real mel
    # --------------------------------------------------------

    real_mel = sample["mel"]

    print("\nREAL MEL")
    print(f"Shape: {tuple(real_mel.shape)}")
    print(f"Min:   {real_mel.min().item():.6f}")
    print(f"Max:   {real_mel.max().item():.6f}")
    print(f"Mean:  {real_mel.mean().item():.6f}")
    print(f"Std:   {real_mel.std().item():.6f}")

    # --------------------------------------------------------
    # TTS predicted mel
    # --------------------------------------------------------

    text_ids = (
        sample["text_ids"]
        .unsqueeze(0)
        .to(device)
    )

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

    mel_lengths = torch.tensor(
        [int(sample["mel_length"])],
        dtype=torch.long,
        device=device,
    )

    coarse_mel, refined_mel = model(
        text_ids=text_ids,
        text_lengths=text_lengths,
        language_ids=language_ids,
        mel_lengths=mel_lengths,
    )

    predicted_mel = refined_mel[0]

    print("\nPREDICTED MEL")
    print(f"Shape: {tuple(predicted_mel.shape)}")
    print(f"Min:   {predicted_mel.min().item():.6f}")
    print(f"Max:   {predicted_mel.max().item():.6f}")
    print(f"Mean:  {predicted_mel.mean().item():.6f}")
    print(f"Std:   {predicted_mel.std().item():.6f}")

    # --------------------------------------------------------
    # Direct mel comparison
    # --------------------------------------------------------

    target = real_mel.to(device)

    prediction = predicted_mel

    min_frames = min(
        target.shape[-1],
        prediction.shape[-1],
    )

    target = target[..., :min_frames]
    prediction = prediction[..., :min_frames]

    mae = (
        torch.mean(
            torch.abs(
                prediction - target
            )
        )
        .item()
    )

    mse = (
        torch.mean(
            (prediction - target) ** 2
        )
        .item()
    )

    correlation = torch.corrcoef(
        torch.stack(
            [
                target.reshape(-1),
                prediction.reshape(-1),
            ]
        )
    )[0, 1].item()

    print("\nMEL COMPARISON")
    print(f"MAE:         {mae:.6f}")
    print(f"MSE:         {mse:.6f}")
    print(f"Correlation:{correlation: .6f}")

    # --------------------------------------------------------
    # Output directory
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Real mel -> HiFi-GAN
    # --------------------------------------------------------

    print("\nGenerating audio from REAL mel...")

    real_audio = vocoder.mel_to_waveform(
        real_mel
    )

    real_path = vocoder.save_wav(
        real_audio,
        OUTPUT_DIR / "real_mel.wav",
    )

    # --------------------------------------------------------
    # Predicted mel -> HiFi-GAN
    # --------------------------------------------------------

    print("Generating audio from PREDICTED mel...")

    predicted_audio = vocoder.mel_to_waveform(
        prediction.cpu()
    )

    predicted_path = vocoder.save_wav(
        predicted_audio,
        OUTPUT_DIR / "predicted_mel.wav",
    )

    print("\n" + "=" * 80)
    print("DIAGNOSTIC COMPLETE")
    print("=" * 80)

    print(f"Real-mel audio:      {real_path}")
    print(f"Predicted-mel audio: {predicted_path}")

    print("\nReal mel statistics:")
    print(
        f"  min={real_mel.min().item():.4f}, "
        f"max={real_mel.max().item():.4f}, "
        f"mean={real_mel.mean().item():.4f}, "
        f"std={real_mel.std().item():.4f}"
    )

    print("\nPredicted mel statistics:")
    print(
        f"  min={prediction.min().item():.4f}, "
        f"max={prediction.max().item():.4f}, "
        f"mean={prediction.mean().item():.4f}, "
        f"std={prediction.std().item():.4f}"
    )


if __name__ == "__main__":
    main()
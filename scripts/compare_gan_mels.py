"""
Gyan TTS GAN — Real vs Residual Augmented Mel Comparison.

Visualizes side-by-side:
1. Real Log-Mel Spectrogram Patch
2. Residual-Augmented Log-Mel Spectrogram Patch
3. Absolute Residual Perturbation Map (|Augmented - Real|)
For English, Hindi, and Marathi.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import matplotlib.pyplot as plt
import torch

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset
from ai.models.generator import ResidualMelGenerator
from ai.models.gan_utils import normalize_mel, random_mel_crop

LANGUAGES = {
    0: "english",
    1: "hindi",
    2: "marathi",
}

CHECKPOINT_PATH = Path("D:/Gyan/checkpoints/gan/gan_smoke_test.pt")
OUTPUT_DIR = Path("D:/Gyan/outputs/gan_comparison")


def main() -> None:
    print("=" * 70)
    print("GYAN — REAL VS RESIDUAL-AUGMENTED MEL COMPARISON")
    print("=" * 70)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    if not CHECKPOINT_PATH.exists():
        raise FileNotFoundError(f"Checkpoint not found: {CHECKPOINT_PATH}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    config = TTSConfig()

    dataset = MultilingualTTSDataset(
        split_csv_path=config.data.splits_dir / "train.csv",
        config=config,
    )

    generator = ResidualMelGenerator(
        noise_dim=config.gan.noise_dim,
        num_languages=config.model.num_languages,
        language_embedding_dim=config.gan.language_embedding_dim,
        base_channels=config.gan.generator_base_channels,
        residual_alpha=config.gan.residual_alpha,
    ).to(device)

    checkpoint = torch.load(CHECKPOINT_PATH, map_location=device, weights_only=False)
    generator.load_state_dict(checkpoint["generator_state_dict"])
    generator.eval()

    print(f"Loaded checkpoint: {CHECKPOINT_PATH}")

    # Collect 1 sample per language
    real_samples = {}
    for index in range(len(dataset)):
        sample = dataset[index]
        lid = int(sample["language_id"].item())
        if lid not in LANGUAGES or lid in real_samples:
            continue

        raw_mel = sample["mel"].unsqueeze(0)  # [1, 80, T]
        length = torch.tensor([sample["mel_length"]])
        crop = random_mel_crop(raw_mel, length, target_frames=config.gan.mel_frames)
        norm_crop = normalize_mel(crop)
        real_samples[lid] = norm_crop.to(device)

        if len(real_samples) == len(LANGUAGES):
            break

    # Generate Augmented Samples
    fig, axes = plt.subplots(nrows=3, ncols=3, figsize=(18, 12))

    with torch.no_grad():
        for row, lid in enumerate(LANGUAGES):
            lname = LANGUAGES[lid]
            real_m = real_samples[lid]

            noise = torch.randn(1, config.gan.noise_dim, device=device)
            lang_tensor = torch.tensor([lid], dtype=torch.long, device=device)

            aug_m, residual = generator(real_m, noise, lang_tensor, return_residual=True)

            real_np = real_m.squeeze().cpu().numpy()
            aug_np = aug_m.squeeze().cpu().numpy()
            diff_np = torch.abs(aug_m - real_m).squeeze().cpu().numpy()

            # Column 1: Real
            im1 = axes[row, 0].imshow(real_np, aspect="auto", origin="lower", vmin=-1, vmax=1, cmap="viridis")
            axes[row, 0].set_title(f"{lname.capitalize()} — Real Mel Patch", fontsize=12)
            axes[row, 0].set_ylabel("Mel Channels (80)")
            axes[row, 0].set_xlabel("Time Frames (256)")

            # Column 2: Augmented
            im2 = axes[row, 1].imshow(aug_np, aspect="auto", origin="lower", vmin=-1, vmax=1, cmap="viridis")
            axes[row, 1].set_title(f"{lname.capitalize()} — Residual Augmented Mel", fontsize=12)
            axes[row, 1].set_xlabel("Time Frames (256)")

            # Column 3: Absolute Difference / Residual Map
            im3 = axes[row, 2].imshow(diff_np, aspect="auto", origin="lower", cmap="magma")
            axes[row, 2].set_title(f"{lname.capitalize()} — Perturbation Map (|Aug - Real|)", fontsize=12)
            axes[row, 2].set_xlabel("Time Frames (256)")

            plt.colorbar(im1, ax=axes[row, 0], fraction=0.046, pad=0.04)
            plt.colorbar(im2, ax=axes[row, 1], fraction=0.046, pad=0.04)
            plt.colorbar(im3, ax=axes[row, 2], fraction=0.046, pad=0.04)

    plt.suptitle("Gyan Multilingual TTS — Real vs Residual-Augmented Mel Spectrograms", fontsize=16)
    plt.tight_layout()

    out_path = OUTPUT_DIR / "real_vs_gan_comparison.png"
    plt.savefig(out_path, dpi=150)
    plt.close()

    print(f"\nComparison visualization saved to: {out_path}")
    print("=" * 70)


if __name__ == "__main__":
    main()

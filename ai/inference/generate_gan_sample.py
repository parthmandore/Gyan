"""
Gyan TTS GAN — Generate Residual Augmented Mel Samples.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import matplotlib.pyplot as plt
import torch

from ai.configs.tts_config import TTSConfig
from ai.models.generator import ResidualMelGenerator
from ai.models.gan_utils import normalize_mel, denormalize_mel, random_mel_crop
from ai.training.dataset import MultilingualTTSDataset

LANGUAGES = {
    0: "english",
    1: "hindi",
    2: "marathi",
}

CHECKPOINT_PATH = Path("D:/Gyan/checkpoints/gan/gan_smoke_test.pt")
OUTPUT_DIR = Path("D:/Gyan/outputs/gan_samples")


def main() -> None:
    print("=" * 60)
    print("GYAN — GENERATE RESIDUAL AUGMENTED MEL SAMPLES")
    print("=" * 60)

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

    # Generate sample for each language
    for index in range(len(dataset)):
        sample = dataset[index]
        lid = int(sample["language_id"].item())
        lname = LANGUAGES[lid]

        raw_mel = sample["mel"].unsqueeze(0)
        length = torch.tensor([sample["mel_length"]])
        crop = random_mel_crop(raw_mel, length, target_frames=config.gan.mel_frames)
        norm_real = normalize_mel(crop).to(device)

        noise = torch.randn(1, config.gan.noise_dim, device=device)
        lang_tensor = torch.tensor([lid], dtype=torch.long, device=device)

        with torch.no_grad():
            aug_mel = generator(norm_real, noise, lang_tensor)
            denorm_mel = denormalize_mel(aug_mel).squeeze().cpu()

        out_pt = OUTPUT_DIR / f"{lname}_augmented_mel.pt"
        torch.save(denorm_mel, out_pt)
        print(f"Saved {lname} augmented mel tensor: {out_pt} (Shape: {tuple(denorm_mel.shape)})")

        if len(list(OUTPUT_DIR.glob("*_augmented_mel.pt"))) >= 3:
            break

    print("=" * 60)
    print("SAMPLE GENERATION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()

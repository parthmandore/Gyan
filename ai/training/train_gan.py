"""
Gyan TTS GAN — Residual Mel Augmentation Training Module.

Trains Conditional Residual Mel GAN with Hinge Adversarial Loss,
L1 Content Loss, and Spectral Gradient Consistency Loss.
"""

import json
import random
import sys
from pathlib import Path
from typing import Dict, List, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader

from ai.configs.tts_config import TTSConfig
from ai.models.generator import ResidualMelGenerator
from ai.models.discriminator import MelDiscriminator
from ai.models.gan_utils import (
    normalize_mel,
    random_mel_crop,
    compute_spectral_gradient_loss,
)
from ai.training.dataset import MultilingualTTSDataset, TTSCollateFn


def set_deterministic_seed(seed: int = 42) -> None:
    """Sets random seeds for reproducibility across random, numpy, and torch."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def create_gan_dataloader(config: TTSConfig) -> DataLoader:
    """Creates a DataLoader using the existing MultilingualTTSDataset."""
    train_csv = config.data.splits_dir / "train.csv"
    if not train_csv.exists():
        raise FileNotFoundError(f"Training split not found: {train_csv}")

    dataset = MultilingualTTSDataset(split_csv_path=train_csv, config=config)
    mel_pad_value = float(torch.log(torch.tensor(config.audio.clamp_min)).item())

    collate_fn = TTSCollateFn(
        pad_token_id=config.text.pad_id,
        mel_pad_val=mel_pad_value,
    )

    return DataLoader(
        dataset,
        batch_size=config.gan.batch_size,
        shuffle=True,
        num_workers=config.data.num_workers,
        pin_memory=config.data.pin_memory,
        drop_last=True,
        collate_fn=collate_fn,
    )


def train_one_epoch(
    generator: nn.Module,
    discriminator: nn.Module,
    loader: DataLoader,
    g_optimizer: torch.optim.Optimizer,
    d_optimizer: torch.optim.Optimizer,
    device: torch.device,
    config: TTSConfig,
    epoch: int,
) -> Tuple[float, float, float, float]:
    """
    Trains Generator and Discriminator for one epoch using:
    - Hinge adversarial loss
    - L1 content preservation loss
    - Spectral gradient consistency loss
    """
    generator.train()
    discriminator.train()

    total_g_loss = 0.0
    total_d_loss = 0.0
    total_content_loss = 0.0
    total_spec_loss = 0.0
    batch_count = 0

    max_batches = config.gan.max_batches_per_epoch

    for batch_idx, batch in enumerate(loader):
        if batch_idx >= max_batches:
            break

        mel = batch["mel_padded"].to(device, non_blocking=True)
        mel_lengths = batch["mel_lengths"]
        language_ids = batch["language_ids"].to(device, non_blocking=True)

        # 1. Random Mel Crop and Normalization to [-1, 1]
        real_mel = random_mel_crop(mel, mel_lengths, target_frames=config.gan.mel_frames)
        real_mel = normalize_mel(real_mel)
        batch_size = real_mel.size(0)

        # ----------------------------------------------------
        # Train Discriminator (Hinge Loss)
        # ----------------------------------------------------
        d_optimizer.zero_grad(set_to_none=True)

        # Real samples
        d_real_out = discriminator(real_mel, language_ids)
        d_real_loss = torch.relu(1.0 - d_real_out).mean()

        # Augmented samples
        noise = torch.randn(batch_size, config.gan.noise_dim, device=device)
        fake_mel = generator(real_mel, noise, language_ids)

        d_fake_out = discriminator(fake_mel.detach(), language_ids)
        d_fake_loss = torch.relu(1.0 + d_fake_out).mean()

        d_loss = (d_real_loss + d_fake_loss) / 2.0
        d_loss.backward()
        d_optimizer.step()

        # ----------------------------------------------------
        # Train Generator (Adversarial + Content + Spectral Loss)
        # ----------------------------------------------------
        g_optimizer.zero_grad(set_to_none=True)

        noise = torch.randn(batch_size, config.gan.noise_dim, device=device)
        fake_mel = generator(real_mel, noise, language_ids)

        g_adv_out = discriminator(fake_mel, language_ids)
        g_adv_loss = -g_adv_out.mean()

        content_loss = F.l1_loss(fake_mel, real_mel)
        spec_loss = compute_spectral_gradient_loss(fake_mel, real_mel)

        g_loss = (
            g_adv_loss
            + config.gan.lambda_content * content_loss
            + config.gan.lambda_spectral * spec_loss
        )

        g_loss.backward()
        g_optimizer.step()

        # Metrics
        total_d_loss += d_loss.item()
        total_g_loss += g_loss.item()
        total_content_loss += content_loss.item()
        total_spec_loss += spec_loss.item()
        batch_count += 1

        # Periodic logging every 25 batches or on first/last batch
        if (batch_idx + 1) == 1 or (batch_idx + 1) % 25 == 0 or (batch_idx + 1) == max_batches:
            print(
                f"Epoch {epoch:2d}/{config.gan.num_epochs:2d} | "
                f"Batch {batch_idx + 1:3d}/{max_batches:3d} | "
                f"D: {d_loss.item():.4f} | "
                f"G: {g_loss.item():.4f} (Adv: {g_adv_loss.item():.4f}, "
                f"L1: {content_loss.item():.4f}, Spec: {spec_loss.item():.4f})"
            )

    if batch_count == 0:
        raise RuntimeError("No batches were processed.")

    return (
        total_g_loss / batch_count,
        total_d_loss / batch_count,
        total_content_loss / batch_count,
        total_spec_loss / batch_count,
    )


def main() -> None:
    print("=" * 75)
    print("GYAN — CONDITIONAL RESIDUAL MEL GAN CONTROLLED TRAINING RUN")
    print("=" * 75)

    config = TTSConfig()
    set_deterministic_seed(config.gan.seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(f"Device:                 {device}")
    if device.type == "cuda":
        gpu_name = torch.cuda.get_device_name(0)
        vram_total = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"GPU:                    {gpu_name} ({vram_total:.2f} GB Total VRAM)")

    print(f"Total Epochs:           {config.gan.num_epochs}")
    print(f"Batches per Epoch:      {config.gan.max_batches_per_epoch}")
    print(f"Batch Size:             {config.gan.batch_size}")
    print(f"Learning Rate:          {config.gan.learning_rate}")
    print(f"Residual Alpha:         {config.gan.residual_alpha}")
    print(f"Content Weight (L1):    {config.gan.lambda_content}")
    print(f"Spectral Weight (Spec): {config.gan.lambda_spectral}")
    print(f"Random Seed:            {config.gan.seed}")
    print(f"Checkpoint Directory:   {config.gan.checkpoint_dir}")
    print("=" * 75)

    loader = create_gan_dataloader(config)

    generator = ResidualMelGenerator(
        noise_dim=config.gan.noise_dim,
        num_languages=config.model.num_languages,
        language_embedding_dim=config.gan.language_embedding_dim,
        base_channels=config.gan.generator_base_channels,
        residual_alpha=config.gan.residual_alpha,
    ).to(device)

    discriminator = MelDiscriminator(
        num_languages=config.model.num_languages,
        language_embedding_dim=config.gan.language_embedding_dim,
        base_channels=config.gan.discriminator_base_channels,
    ).to(device)

    g_optimizer = torch.optim.Adam(
        generator.parameters(),
        lr=config.gan.learning_rate,
        betas=config.gan.betas,
    )

    d_optimizer = torch.optim.Adam(
        discriminator.parameters(),
        lr=config.gan.learning_rate,
        betas=config.gan.betas,
    )

    config.gan.checkpoint_dir.mkdir(parents=True, exist_ok=True)

    history: List[Dict[str, float]] = []
    best_g_loss = float("inf")

    print("\nStarting training execution...")

    for epoch in range(1, config.gan.num_epochs + 1):
        print(f"\n--- Epoch {epoch}/{config.gan.num_epochs} ---")
        g_loss, d_loss, c_loss, s_loss = train_one_epoch(
            generator=generator,
            discriminator=discriminator,
            loader=loader,
            g_optimizer=g_optimizer,
            d_optimizer=d_optimizer,
            device=device,
            config=config,
            epoch=epoch,
        )

        epoch_record = {
            "epoch": epoch,
            "g_loss": round(g_loss, 6),
            "d_loss": round(d_loss, 6),
            "content_loss_l1": round(c_loss, 6),
            "spectral_loss_l1": round(s_loss, 6),
        }
        history.append(epoch_record)

        print(
            f"\n>>> Epoch {epoch} Summary: G Loss: {g_loss:.4f} | "
            f"D Loss: {d_loss:.4f} | Content L1: {c_loss:.4f} | Spec L1: {s_loss:.4f}"
        )

        # 1. Save per-epoch checkpoint
        epoch_checkpoint_path = config.gan.checkpoint_dir / f"gan_epoch_{epoch}.pt"
        torch.save(
            {
                "generator_state_dict": generator.state_dict(),
                "discriminator_state_dict": discriminator.state_dict(),
                "generator_optimizer": g_optimizer.state_dict(),
                "discriminator_optimizer": d_optimizer.state_dict(),
                "epoch": epoch,
                "metrics": epoch_record,
                "config": config,
            },
            epoch_checkpoint_path,
        )
        print(f"Saved epoch checkpoint: {epoch_checkpoint_path.name}")

        # 2. Track & save best checkpoint based on lowest combined G loss
        if g_loss < best_g_loss:
            best_g_loss = g_loss
            best_checkpoint_path = config.gan.checkpoint_dir / "gan_best.pt"
            torch.save(
                {
                    "generator_state_dict": generator.state_dict(),
                    "discriminator_state_dict": discriminator.state_dict(),
                    "generator_optimizer": g_optimizer.state_dict(),
                    "discriminator_optimizer": d_optimizer.state_dict(),
                    "epoch": epoch,
                    "metrics": epoch_record,
                    "config": config,
                },
                best_checkpoint_path,
            )
            print(f"Saved new best checkpoint: gan_best.pt (G Loss: {best_g_loss:.4f})")

    # 3. Save latest checkpoint & history log
    latest_checkpoint_path = config.gan.checkpoint_dir / "gan_latest.pt"
    torch.save(
        {
            "generator_state_dict": generator.state_dict(),
            "discriminator_state_dict": discriminator.state_dict(),
            "generator_optimizer": g_optimizer.state_dict(),
            "discriminator_optimizer": d_optimizer.state_dict(),
            "epoch": config.gan.num_epochs,
            "metrics": history[-1],
            "config": config,
        },
        latest_checkpoint_path,
    )

    history_file = config.gan.checkpoint_dir / "training_history.json"
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print(f"\nTraining history saved to: {history_file}")

    if device.type == "cuda":
        vram_alloc = torch.cuda.memory_allocated(device) / (1024**2)
        vram_peak = torch.cuda.max_memory_allocated(device) / (1024**2)
        print(f"Final Active VRAM:     {vram_alloc:.2f} MB")
        print(f"Peak VRAM Recorded:    {vram_peak:.2f} MB (out of {vram_total*1024:.0f} MB)")

    print("=" * 75)
    print("CONTROLLED TRAINING RUN COMPLETED SUCCESSFULLY")
    print("=" * 75)


if __name__ == "__main__":
    main()

"""
Gyan Multilingual TTS — Reproducible Experiment Training Script.

Controlled comparison:
    1. baseline  -> original real training data after long-utterance filtering
    2. augmented -> same real training data + 300 GAN-augmented utterances

Dataset manifests:
    baseline:
        D:/Gyan/data/splits/train_tts.csv

    augmented:
        D:/Gyan/data/splits/train_augmented_tts.csv

    validation:
        D:/Gyan/data/splits/validation_tts.csv

Experiment design:
    - Identical model architecture
    - Identical hyperparameters
    - Identical validation dataset
    - Identical random seed
    - Only difference is the additional 300 GAN-augmented
      training samples in the augmented experiment

Training configuration:
    - MultilingualTTS
    - Adam
    - learning rate = 1e-4
    - batch size = 16 by default
    - betas = (0.9, 0.98)
    - weight decay = 1e-6
    - gradient clipping = 1.0
    - seed = 42

Each epoch saves:
    - tts_epoch_{epoch}.pt

Best checkpoint:
    - tts_best.pt

Latest checkpoint:
    - tts_latest.pt

Metrics:
    - training total loss
    - training coarse mel loss
    - training refined mel loss
    - validation total loss
    - validation coarse mel loss
    - validation refined mel loss

The existing GAN checkpoints are not modified.
"""

import sys
import io
import json
import time
import argparse
import random
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader


# ============================================================
# Project setup
# ============================================================

PROJECT_ROOT = Path("D:/Gyan")

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# Windows UTF-8 stdout
# ============================================================

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
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)
from ai.training.losses import multilingual_tts_loss


# ============================================================
# Reproducibility
# ============================================================

def set_seed(seed: int = 42):
    """
    Set random seeds for reproducible experiments.
    """

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


# ============================================================
# Training
# ============================================================

def train_one_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
    epoch: int,
    total_epochs: int,
    max_batches: int | None = None,
    log_interval: int = 25,
) -> dict:
    """
    Train the model for one epoch.
    """

    model.train()

    total_loss_accum = 0.0
    coarse_loss_accum = 0.0
    refined_loss_accum = 0.0

    num_batches = 0

    t_start = time.time()

    n_total_batches = (
        len(dataloader)
        if max_batches is None
        else min(len(dataloader), max_batches)
    )

    for batch_idx, batch in enumerate(dataloader, 1):

        if max_batches is not None and batch_idx > max_batches:
            break

        # ----------------------------------------------------
        # Move batch to device
        # ----------------------------------------------------

        text_padded = batch["text_padded"].to(device)
        text_lengths = batch["text_lengths"].to(device)

        mel_padded = batch["mel_padded"].to(device)
        mel_lengths = batch["mel_lengths"].to(device)

        language_ids = batch["language_ids"].to(device)

        # ----------------------------------------------------
        # Forward + backward
        # ----------------------------------------------------

        optimizer.zero_grad()

        coarse_mel, refined_mel = model(
            text_ids=text_padded,
            text_lengths=text_lengths,
            language_ids=language_ids,
            mel_lengths=mel_lengths,
        )

        loss_dict = multilingual_tts_loss(
            coarse_mel=coarse_mel,
            refined_mel=refined_mel,
            target_mel=mel_padded,
            mel_lengths=mel_lengths,
        )

        total_loss = loss_dict["total_loss"]

        total_loss.backward()

        # Gradient clipping for stability
        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=1.0,
        )

        optimizer.step()

        # ----------------------------------------------------
        # Accumulate metrics
        # ----------------------------------------------------

        total_loss_accum += total_loss.item()
        coarse_loss_accum += loss_dict["coarse_loss"].item()
        refined_loss_accum += loss_dict["refined_loss"].item()

        num_batches += 1

        # ----------------------------------------------------
        # Progress logging
        # ----------------------------------------------------

        if (
            batch_idx % log_interval == 0
            or batch_idx == n_total_batches
        ):
            avg_loss = total_loss_accum / num_batches

            elapsed = time.time() - t_start

            speed = (
                batch_idx * text_padded.size(0) / elapsed
                if elapsed > 0
                else 0.0
            )

            print(
                f"  Epoch {epoch:2d}/{total_epochs:2d} | "
                f"Batch {batch_idx:4d}/{n_total_batches:4d} | "
                f"Train Loss: {avg_loss:.4f} "
                f"(Coarse: "
                f"{coarse_loss_accum / num_batches:.4f}, "
                f"Refined: "
                f"{refined_loss_accum / num_batches:.4f}) | "
                f"{speed:.1f} samples/sec"
            )

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if num_batches == 0:
        raise RuntimeError(
            "No training batches were processed."
        )

    # --------------------------------------------------------
    # Return epoch metrics
    # --------------------------------------------------------

    return {
        "train_loss": total_loss_accum / num_batches,
        "train_coarse_loss": coarse_loss_accum / num_batches,
        "train_refined_loss": refined_loss_accum / num_batches,
    }


# ============================================================
# Validation
# ============================================================

@torch.no_grad()
def evaluate(
    model: nn.Module,
    dataloader: DataLoader,
    device: torch.device,
    max_batches: int | None = None,
) -> dict:
    """
    Evaluate the model on the validation dataset.
    """

    model.eval()

    total_loss_accum = 0.0
    coarse_loss_accum = 0.0
    refined_loss_accum = 0.0

    num_batches = 0

    for batch_idx, batch in enumerate(dataloader, 1):

        if max_batches is not None and batch_idx > max_batches:
            break

        # ----------------------------------------------------
        # Move batch to device
        # ----------------------------------------------------

        text_padded = batch["text_padded"].to(device)
        text_lengths = batch["text_lengths"].to(device)

        mel_padded = batch["mel_padded"].to(device)
        mel_lengths = batch["mel_lengths"].to(device)

        language_ids = batch["language_ids"].to(device)

        # ----------------------------------------------------
        # Forward pass
        # ----------------------------------------------------

        coarse_mel, refined_mel = model(
            text_ids=text_padded,
            text_lengths=text_lengths,
            language_ids=language_ids,
            mel_lengths=mel_lengths,
        )

        # ----------------------------------------------------
        # Loss
        # ----------------------------------------------------

        loss_dict = multilingual_tts_loss(
            coarse_mel=coarse_mel,
            refined_mel=refined_mel,
            target_mel=mel_padded,
            mel_lengths=mel_lengths,
        )

        # ----------------------------------------------------
        # Accumulate metrics
        # ----------------------------------------------------

        total_loss_accum += loss_dict["total_loss"].item()
        coarse_loss_accum += loss_dict["coarse_loss"].item()
        refined_loss_accum += loss_dict["refined_loss"].item()

        num_batches += 1

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if num_batches == 0:
        raise RuntimeError(
            "No validation batches were processed."
        )

    return {
        "val_loss": total_loss_accum / num_batches,
        "val_coarse_loss": coarse_loss_accum / num_batches,
        "val_refined_loss": refined_loss_accum / num_batches,
    }


# ============================================================
# Experiment execution
# ============================================================

def run_experiment(
    experiment_type: str,
    num_epochs: int = 5,
    batch_size: int = 16,
    learning_rate: float = 1e-4,
    max_train_batches: int | None = None,
    max_val_batches: int | None = None,
    seed: int = 42,
):
    """
    Run either the baseline or augmented TTS experiment.
    """

    print("=" * 85)
    print(
        "GYAN MULTILINGUAL TTS — "
        f"EXPERIMENT EXECUTION ({experiment_type.upper()})"
    )
    print("=" * 85)

    # --------------------------------------------------------
    # Seed
    # --------------------------------------------------------

    set_seed(seed)

    # --------------------------------------------------------
    # Configuration/device
    # --------------------------------------------------------

    config = TTSConfig()

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    print(f"Device:                 {device}")

    if device.type == "cuda":
        print(
            f"GPU:                    "
            f"{torch.cuda.get_device_name(0)}"
        )

        total_vram = (
            torch.cuda.get_device_properties(0).total_memory
            / (1024 ** 3)
        )

        print(
            f"GPU VRAM:               "
            f"{total_vram:.2f} GB"
        )

    # --------------------------------------------------------
    # Select experiment-specific dataset
    # --------------------------------------------------------

    if experiment_type == "baseline":

        train_csv = (
            config.data.splits_dir
            / "train_tts.csv"
        )

        checkpoint_dir = Path(
            "D:/Gyan/checkpoints/tts_baseline"
        )

    elif experiment_type == "augmented":

        train_csv = (
            config.data.splits_dir
            / "train_augmented_tts.csv"
        )

        checkpoint_dir = Path(
            "D:/Gyan/checkpoints/tts_augmented"
        )

    else:
        raise ValueError(
            f"Unknown experiment_type: "
            f"{experiment_type}"
        )

    # --------------------------------------------------------
    # Same validation dataset for both experiments
    # --------------------------------------------------------

    val_csv = (
        config.data.splits_dir
        / "validation_tts.csv"
    )

    checkpoint_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Print experiment configuration
    # --------------------------------------------------------

    print(
        f"Experiment Type:        "
        f"{experiment_type.upper()}"
    )

    print(
        f"Training Split:         "
        f"{train_csv}"
    )

    print(
        f"Validation Split:       "
        f"{val_csv}"
    )

    print(
        f"Checkpoint Directory:   "
        f"{checkpoint_dir}"
    )

    print(
        f"Batch Size:             "
        f"{batch_size}"
    )

    print(
        f"Learning Rate:          "
        f"{learning_rate}"
    )

    print(
        f"Number of Epochs:       "
        f"{num_epochs}"
    )

    print(
        f"Random Seed:            "
        f"{seed}"
    )

    print(
        f"Max Train Batches:      "
        f"{max_train_batches}"
    )

    print(
        f"Max Val Batches:        "
        f"{max_val_batches}"
    )

    # --------------------------------------------------------
    # Dataset sanity check
    # --------------------------------------------------------

    if not train_csv.exists():
        raise FileNotFoundError(
            f"Training manifest not found:\n"
            f"{train_csv}"
        )

    if not val_csv.exists():
        raise FileNotFoundError(
            f"Validation manifest not found:\n"
            f"{val_csv}"
        )

    # --------------------------------------------------------
    # Datasets
    # --------------------------------------------------------

    train_dataset = MultilingualTTSDataset(
        train_csv,
        config=config,
    )

    val_dataset = MultilingualTTSDataset(
        val_csv,
        config=config,
    )

    # --------------------------------------------------------
    # Dataset counts
    # --------------------------------------------------------

    expected_train_size = {
        "baseline": 41309,
        "augmented": 41609,
    }[experiment_type]

    expected_val_size = 2291

    if len(train_dataset) != expected_train_size:
        raise RuntimeError(
            f"Unexpected training dataset size.\n"
            f"Expected: {expected_train_size}\n"
            f"Found:    {len(train_dataset)}\n"
            f"Manifest: {train_csv}"
        )

    if len(val_dataset) != expected_val_size:
        raise RuntimeError(
            f"Unexpected validation dataset size.\n"
            f"Expected: {expected_val_size}\n"
            f"Found:    {len(val_dataset)}\n"
            f"Manifest: {val_csv}"
        )

    # --------------------------------------------------------
    # DataLoaders
    # --------------------------------------------------------

    train_loader = create_tts_dataloader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
    )

    val_loader = create_tts_dataloader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
    )

    print(
        f"\nTraining Dataset Size:   "
        f"{len(train_dataset):,} samples "
        f"({len(train_loader):,} batches/epoch)"
    )

    print(
        f"Validation Dataset Size: "
        f"{len(val_dataset):,} samples "
        f"({len(val_loader):,} batches/val)"
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = MultilingualTTS(config).to(device)

    # Parameter count
    parameter_count = sum(
        p.numel()
        for p in model.parameters()
    )

    print(
        f"Model Parameters:        "
        f"{parameter_count:,}"
    )

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=learning_rate,
        betas=(0.9, 0.98),
        eps=1e-9,
        weight_decay=1e-6,
    )

    # --------------------------------------------------------
    # History/best tracking
    # --------------------------------------------------------

    history = []

    best_val_loss = float("inf")

    print("\n" + "=" * 85)
    print("STARTING TRAINING LOOP")
    print("=" * 85)

    # ========================================================
    # Epoch loop
    # ========================================================

    for epoch in range(1, num_epochs + 1):

        t_epoch_start = time.time()

        print(
            f"\n--- Epoch {epoch}/{num_epochs} ---"
        )

        # ----------------------------------------------------
        # Training
        # ----------------------------------------------------

        train_metrics = train_one_epoch(
            model=model,
            dataloader=train_loader,
            optimizer=optimizer,
            device=device,
            epoch=epoch,
            total_epochs=num_epochs,
            max_batches=max_train_batches,
        )

        # ----------------------------------------------------
        # Validation
        # ----------------------------------------------------

        val_metrics = evaluate(
            model=model,
            dataloader=val_loader,
            device=device,
            max_batches=max_val_batches,
        )

        # ----------------------------------------------------
        # Epoch metrics
        # ----------------------------------------------------

        epoch_duration = (
            time.time()
            - t_epoch_start
        )

        val_loss = val_metrics["val_loss"]

        epoch_record = {
            "epoch": epoch,

            "train_loss": round(
                train_metrics["train_loss"],
                6,
            ),

            "train_coarse_loss": round(
                train_metrics["train_coarse_loss"],
                6,
            ),

            "train_refined_loss": round(
                train_metrics["train_refined_loss"],
                6,
            ),

            "val_loss": round(
                val_loss,
                6,
            ),

            "val_coarse_loss": round(
                val_metrics["val_coarse_loss"],
                6,
            ),

            "val_refined_loss": round(
                val_metrics["val_refined_loss"],
                6,
            ),

            "epoch_duration_sec": round(
                epoch_duration,
                2,
            ),
        }

        history.append(epoch_record)

        # ----------------------------------------------------
        # Print summary
        # ----------------------------------------------------

        print(
            f"\n>>> Epoch {epoch} Summary "
            f"({epoch_duration:.1f}s) | "
            f"Train Loss: "
            f"{train_metrics['train_loss']:.4f} | "
            f"Val Loss: "
            f"{val_loss:.4f} "
            f"(Coarse: "
            f"{val_metrics['val_coarse_loss']:.4f}, "
            f"Refined: "
            f"{val_metrics['val_refined_loss']:.4f})"
        )

        # ----------------------------------------------------
        # Save per-epoch checkpoint
        # ----------------------------------------------------

        epoch_path = (
            checkpoint_dir
            / f"tts_epoch_{epoch}.pt"
        )

        torch.save(
            {
                "model_state_dict":
                    model.state_dict(),

                "optimizer_state_dict":
                    optimizer.state_dict(),

                "epoch": epoch,

                "metrics":
                    epoch_record,

                "config":
                    config,
            },
            epoch_path,
        )

        print(
            f"  Saved epoch checkpoint: "
            f"{epoch_path.name}"
        )

        # ----------------------------------------------------
        # Best checkpoint
        # ----------------------------------------------------

        if val_loss < best_val_loss:

            best_val_loss = val_loss

            best_path = (
                checkpoint_dir
                / "tts_best.pt"
            )

            torch.save(
                {
                    "model_state_dict":
                        model.state_dict(),

                    "optimizer_state_dict":
                        optimizer.state_dict(),

                    "epoch":
                        epoch,

                    "metrics":
                        epoch_record,

                    "config":
                        config,
                },
                best_path,
            )

            print(
                f"  Saved new best model: "
                f"{best_path.name} "
                f"(Val Loss: "
                f"{best_val_loss:.4f})"
            )

        # ----------------------------------------------------
        # CUDA memory information
        # ----------------------------------------------------

        if device.type == "cuda":

            allocated = (
                torch.cuda.memory_allocated()
                / (1024 ** 3)
            )

            reserved = (
                torch.cuda.memory_reserved()
                / (1024 ** 3)
            )

            peak = (
                torch.cuda.max_memory_allocated()
                / (1024 ** 3)
            )

            print(
                f"  CUDA Memory | "
                f"Allocated: {allocated:.2f} GB | "
                f"Reserved: {reserved:.2f} GB | "
                f"Peak: {peak:.2f} GB"
            )

            torch.cuda.reset_peak_memory_stats()

    # ========================================================
    # Save latest checkpoint
    # ========================================================

    latest_path = (
        checkpoint_dir
        / "tts_latest.pt"
    )

    torch.save(
        {
            "model_state_dict":
                model.state_dict(),

            "optimizer_state_dict":
                optimizer.state_dict(),

            "epoch":
                num_epochs,

            "metrics":
                history[-1],

            "config":
                config,
        },
        latest_path,
    )

    print(
        f"\nLatest checkpoint written to: "
        f"{latest_path}"
    )

    # ========================================================
    # Save training history
    # ========================================================

    history_path = (
        checkpoint_dir
        / "training_history.json"
    )

    with open(
        history_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            history,
            f,
            indent=2,
        )

    print(
        f"Training history written to: "
        f"{history_path}"
    )

    # ========================================================
    # Final summary
    # ========================================================

    print("\n" + "=" * 85)

    print(
        f"EXPERIMENT "
        f"{experiment_type.upper()} "
        f"FINISHED SUCCESSFULLY"
    )

    print("=" * 85)

    print(
        f"Best Validation Loss: "
        f"{best_val_loss:.6f}"
    )

    print(
        f"Checkpoint Directory: "
        f"{checkpoint_dir}"
    )


# ============================================================
# Command-line interface
# ============================================================

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description=(
            "Train Multilingual TTS "
            "Baseline vs Augmented Experiments"
        )
    )

    parser.add_argument(
        "--experiment",
        type=str,
        choices=[
            "baseline",
            "augmented",
        ],
        required=True,
        help=(
            "Experiment type: "
            "baseline or augmented"
        ),
    )

    parser.add_argument(
        "--epochs",
        type=int,
        default=5,
        help="Number of epochs to train",
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        default=16,
        help="Batch size",
    )

    parser.add_argument(
        "--lr",
        type=float,
        default=1e-4,
        help="Learning rate",
    )

    parser.add_argument(
        "--max_train_batches",
        type=int,
        default=None,
        help=(
            "Limit training batches "
            "per epoch"
        ),
    )

    parser.add_argument(
        "--max_val_batches",
        type=int,
        default=None,
        help="Limit validation batches",
    )

    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed",
    )

    args = parser.parse_args()

    run_experiment(
        experiment_type=args.experiment,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        max_train_batches=args.max_train_batches,
        max_val_batches=args.max_val_batches,
        seed=args.seed,
    )
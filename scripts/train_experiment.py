"""
Gyan Multilingual TTS — Medium Scale Training Experiment

Phase 8.5:
Train on 2,000 samples and validate on 200 samples.

This experiment verifies that the complete training pipeline
works beyond the small 128-sample test.
"""

import torch
from torch.utils.data import Subset

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.trainer import TTSTrainer


def extract_loss(metrics, preferred_keys):
    """
    Extract a numeric loss value from trainer metrics.

    Handles:
    - float / int
    - tensor
    - dictionary
    - nested dictionary
    """

    if isinstance(metrics, (float, int)):
        return float(metrics)

    if isinstance(metrics, torch.Tensor):
        return float(metrics.item())

    if isinstance(metrics, dict):

        # First try expected keys
        for key in preferred_keys:
            if key in metrics:
                return extract_loss(
                    metrics[key],
                    preferred_keys=[]
                )

        # If there is only one item, recursively extract it
        if len(metrics) == 1:
            value = next(iter(metrics.values()))
            return extract_loss(
                value,
                preferred_keys=[]
            )

        # Search all values recursively
        for value in metrics.values():
            try:
                return extract_loss(
                    value,
                    preferred_keys=[]
                )
            except (TypeError, ValueError):
                continue

    raise TypeError(
        f"Could not extract numeric loss from: {metrics}"
    )


def main():

    print("=" * 65)
    print("GYAN MULTILINGUAL TTS — MEDIUM TRAINING EXPERIMENT")
    print("=" * 65)

    # --------------------------------------------------
    # DEVICE
    # --------------------------------------------------

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print(f"\nDevice: {device}")

    if torch.cuda.is_available():

        print(
            f"GPU: {torch.cuda.get_device_name(0)}"
        )

        print(
            f"VRAM: "
            f"{torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB"
        )

    # --------------------------------------------------
    # CONFIG
    # --------------------------------------------------

    config = TTSConfig()

    # Safe settings for RTX 2050 4 GB
    config.data.batch_size = 4
    config.training.num_epochs = 10

    # --------------------------------------------------
    # DATASETS
    # --------------------------------------------------

    print("\nLoading datasets...")

    train_csv = (
        config.data.splits_dir / "train.csv"
    )

    validation_csv = (
        config.data.splits_dir / "validation.csv"
    )

    full_train_dataset = MultilingualTTSDataset(
        train_csv,
        config=config,
    )

    full_validation_dataset = MultilingualTTSDataset(
        validation_csv,
        config=config,
        vocab=full_train_dataset.vocab,
    )

    print(
        f"Full train dataset: "
        f"{len(full_train_dataset)}"
    )

    print(
        f"Full validation dataset: "
        f"{len(full_validation_dataset)}"
    )

    print(
        f"Vocabulary size: "
        f"{len(full_train_dataset.vocab)}"
    )

    # --------------------------------------------------
    # SUBSETS
    # --------------------------------------------------

    train_size = min(
        2000,
        len(full_train_dataset)
    )

    validation_size = min(
        200,
        len(full_validation_dataset)
    )

    train_indices = list(
        range(train_size)
    )

    validation_indices = list(
        range(validation_size)
    )

    train_dataset = Subset(
        full_train_dataset,
        train_indices,
    )

    validation_dataset = Subset(
        full_validation_dataset,
        validation_indices,
    )

    print("\nExperiment subsets:")

    print(
        f"Training samples: "
        f"{len(train_dataset)}"
    )

    print(
        f"Validation samples: "
        f"{len(validation_dataset)}"
    )

    # --------------------------------------------------
    # DATALOADERS
    # --------------------------------------------------

    train_loader = create_tts_dataloader(
        train_dataset,
        batch_size=config.data.batch_size,
        shuffle=True,
        num_workers=0,
        pin_memory=True,
        drop_last=False,
    )

    validation_loader = create_tts_dataloader(
        validation_dataset,
        batch_size=config.data.batch_size,
        shuffle=False,
        num_workers=0,
        pin_memory=True,
        drop_last=False,
    )

    # --------------------------------------------------
    # MODEL
    # --------------------------------------------------

    print("\nCreating model...")

    model = MultilingualTTS(
        config=config,
        vocab_size=len(full_train_dataset.vocab),
    )

    print(
        f"Trainable parameters: "
        f"{model.count_parameters():,}"
    )

    # --------------------------------------------------
    # TRAINER
    # --------------------------------------------------

    trainer = TTSTrainer(
        model=model,
        config=config,
        device=device,
    )

    # --------------------------------------------------
    # TRAINING LOOP
    # --------------------------------------------------

    train_losses = []
    val_losses = []

    print(
        f"\nStarting "
        f"{config.training.num_epochs}-epoch "
        f"training experiment...\n"
    )

    for epoch in range(
        1,
        config.training.num_epochs + 1
    ):

        print("-" * 65)

        print(
            f"EPOCH "
            f"{epoch}/{config.training.num_epochs}"
        )

        print("-" * 65)

        # ----------------------------------------------
        # TRAIN
        # ----------------------------------------------

        train_metrics = trainer.train_epoch(
            train_loader
        )

        # ----------------------------------------------
        # VALIDATE
        # ----------------------------------------------

        val_metrics = trainer.validate(
            validation_loader
        )

        # ----------------------------------------------
        # DEBUG OUTPUT
        # ----------------------------------------------

        print(
            f"\nRaw train metrics: "
            f"{train_metrics}"
        )

        print(
            f"Raw validation metrics: "
            f"{val_metrics}"
        )

        # ----------------------------------------------
        # EXTRACT NUMERIC LOSSES
        # ----------------------------------------------

        train_loss = extract_loss(
            train_metrics,
            [
                "train_loss",
                "loss",
                "total_loss",
            ],
        )

        val_loss = extract_loss(
            val_metrics,
            [
                "validation_loss",
                "val_loss",
                "loss",
                "total_loss",
            ],
        )

        # Store losses
        train_losses.append(train_loss)
        val_losses.append(val_loss)

        # ----------------------------------------------
        # LEARNING RATE SCHEDULER
        # ----------------------------------------------

        trainer.scheduler.step(val_loss)

        # ----------------------------------------------
        # BEST MODEL
        # ----------------------------------------------

        is_best = (
            val_loss < trainer.best_val_loss
        )

        if is_best:
            trainer.best_val_loss = val_loss

        # ----------------------------------------------
        # SAVE CHECKPOINT
        # ----------------------------------------------

        trainer.save_checkpoint(
            epoch=epoch,
            train_loss=train_loss,
            validation_loss=val_loss,
            is_best=is_best,
        )

        # ----------------------------------------------
        # CURRENT LEARNING RATE
        # ----------------------------------------------

        current_lr = (
            trainer.optimizer.param_groups[0]["lr"]
        )

        # ----------------------------------------------
        # EPOCH RESULTS
        # ----------------------------------------------

        print()

        print(
            f"Train Loss:      "
            f"{train_loss:.6f}"
        )

        print(
            f"Validation Loss: "
            f"{val_loss:.6f}"
        )

        print(
            f"Learning Rate:   "
            f"{current_lr:.8f}"
        )

    # --------------------------------------------------
    # FINAL RESULTS
    # --------------------------------------------------

    print("\n" + "=" * 65)

    print(
        "TRAINING EXPERIMENT COMPLETE"
    )

    print("=" * 65)

    print(
        f"\nInitial Train Loss: "
        f"{train_losses[0]:.6f}"
    )

    print(
        f"Final Train Loss:   "
        f"{train_losses[-1]:.6f}"
    )

    print(
        f"\nInitial Validation Loss: "
        f"{val_losses[0]:.6f}"
    )

    print(
        f"Final Validation Loss:   "
        f"{val_losses[-1]:.6f}"
    )

    # --------------------------------------------------
    # LOSS REDUCTION
    # --------------------------------------------------

    if train_losses[-1] < train_losses[0]:

        reduction = (
            (
                train_losses[0]
                - train_losses[-1]
            )
            / train_losses[0]
            * 100
        )

        print(
            f"\nTrain Loss Reduction: "
            f"{reduction:.2f}%"
        )

        print(
            "\nTRAINING EXPERIMENT PASSED"
        )

    else:

        print(
            "\nWARNING: Training loss "
            "did not decrease."
        )

    # --------------------------------------------------
    # GPU MEMORY
    # --------------------------------------------------

    if torch.cuda.is_available():

        print(
            f"\nGPU allocated: "
            f"{torch.cuda.memory_allocated() / 1024**2:.2f} MB"
        )

        print(
            f"GPU reserved: "
            f"{torch.cuda.memory_reserved() / 1024**2:.2f} MB"
        )

    print(
        "\nExperiment finished successfully."
    )

    print("=" * 65)


if __name__ == "__main__":
    main()
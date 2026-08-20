"""
GYAN MULTILINGUAL TTS — SMALL TRAINING PIPELINE TEST

Tests:
- Real dataset loading
- DataLoader
- Forward pass
- Masked mel loss
- Backpropagation
- Optimizer
- AMP
- Validation
- Checkpoint saving
"""

import torch
from torch.utils.data import Subset

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)
from ai.training.trainer import TTSTrainer


def main():

    print("=" * 65)
    print("GYAN TTS — SMALL TRAINING PIPELINE TEST")
    print("=" * 65)

    config = TTSConfig()

    # Small controlled test
    config.training.num_epochs = 3

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print(f"\nDevice: {device}")

    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    print("\nLoading full datasets...")

    train_dataset = MultilingualTTSDataset(
        config.data.splits_dir / "train.csv",
        config=config,
    )

    validation_dataset = MultilingualTTSDataset(
        config.data.splits_dir / "validation.csv",
        config=config,
        vocab=train_dataset.vocab,
    )

    print(f"Full train dataset: {len(train_dataset)}")
    print(f"Full validation dataset: {len(validation_dataset)}")
    print(f"Vocabulary size: {len(train_dataset.vocab)}")

    # Fixed subsets for reproducible testing
    train_subset_size = 128
    validation_subset_size = 32

    train_subset = Subset(
        train_dataset,
        list(range(train_subset_size))
    )

    validation_subset = Subset(
        validation_dataset,
        list(range(validation_subset_size))
    )

    print(f"\nTraining subset: {len(train_subset)}")
    print(f"Validation subset: {len(validation_subset)}")

    # DataLoaders
    train_loader = create_tts_dataloader(
        train_subset,
        batch_size=4,
        shuffle=True,
    )

    validation_loader = create_tts_dataloader(
        validation_subset,
        batch_size=4,
        shuffle=False,
    )

    print("\nCreating model...")

    model = MultilingualTTS(
        config=config,
        vocab_size=len(train_dataset.vocab),
    )

    print(
        f"Trainable parameters: "
        f"{model.count_parameters():,}"
    )

    trainer = TTSTrainer(
        model=model,
        config=config,
        device=device,
    )

    print("\nStarting pipeline test...\n")

    initial_train_loss = None
    final_train_loss = None

    for epoch in range(1, config.training.num_epochs + 1):

        print("-" * 65)
        print(f"EPOCH {epoch}/{config.training.num_epochs}")
        print("-" * 65)

        train_metrics = trainer.train_epoch(
            train_loader
        )

        validation_metrics = trainer.validate(
            validation_loader
        )

        train_loss = train_metrics["train_loss"]
        validation_loss = validation_metrics["validation_loss"]

        trainer.scheduler.step(validation_loss)

        if initial_train_loss is None:
            initial_train_loss = train_loss

        final_train_loss = train_loss

        is_best = validation_loss < trainer.best_val_loss

        if is_best:
            trainer.best_val_loss = validation_loss

        trainer.save_checkpoint(
            epoch=epoch,
            train_loss=train_loss,
            validation_loss=validation_loss,
            is_best=is_best,
        )

        current_lr = trainer.optimizer.param_groups[0]["lr"]

        print()
        print(f"Train Loss:      {train_loss:.6f}")
        print(f"Validation Loss: {validation_loss:.6f}")
        print(f"Learning Rate:   {current_lr:.8f}")

    print("\n" + "=" * 65)
    print("PIPELINE TEST RESULTS")
    print("=" * 65)

    print(f"Initial Train Loss: {initial_train_loss:.6f}")
    print(f"Final Train Loss:   {final_train_loss:.6f}")

    if final_train_loss < initial_train_loss:
        reduction = (
            (initial_train_loss - final_train_loss)
            / initial_train_loss
            * 100
        )

        print(f"Loss Reduction:     {reduction:.2f}%")
        print("\nTRAINING PIPELINE TEST PASSED")
    else:
        print(
            "\nWARNING: Loss did not decrease. "
            "Pipeline ran successfully, but training needs investigation."
        )

    if device.type == "cuda":
        print(
            f"\nGPU allocated: "
            f"{torch.cuda.memory_allocated() / 1024**2:.2f} MB"
        )

    print("=" * 65)


if __name__ == "__main__":
    main()
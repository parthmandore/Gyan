"""
Gyan Multilingual TTS — Training Script
"""

import torch

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)
from ai.training.trainer import TTSTrainer


def main():

    print("=" * 65)
    print("GYAN MULTILINGUAL TTS — TRAINING")
    print("=" * 65)

    config = TTSConfig()

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    print(f"\nDevice: {device}")

    if device.type == "cuda":

        print(
            "GPU:",
            torch.cuda.get_device_name(0)
        )

    print("\nLoading datasets...")

    train_dataset = MultilingualTTSDataset(
        config.data.splits_dir / "train.csv",
        config=config,
    )

    validation_dataset = MultilingualTTSDataset(
        config.data.splits_dir / "validation.csv",
        config=config,
        vocab=train_dataset.vocab,
    )

    print(
        f"Train samples: "
        f"{len(train_dataset)}"
    )

    print(
        f"Validation samples: "
        f"{len(validation_dataset)}"
    )

    print(
        f"Vocabulary size: "
        f"{len(train_dataset.vocab)}"
    )

    train_loader = create_tts_dataloader(
        train_dataset,
        shuffle=True,
    )

    validation_loader = create_tts_dataloader(
        validation_dataset,
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

    print("\nStarting training...\n")

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

        train_metrics = trainer.train_epoch(
            train_loader
        )

        validation_metrics = trainer.validate(
            validation_loader
        )

        train_loss = (
            train_metrics["train_loss"]
        )

        validation_loss = (
            validation_metrics[
                "validation_loss"
            ]
        )

        trainer.scheduler.step(
            validation_loss
        )

        current_lr = (
            trainer.optimizer.param_groups[0]["lr"]
        )

        print()

        print(
            f"Train Loss: "
            f"{train_loss:.6f}"
        )

        print(
            f"Validation Loss: "
            f"{validation_loss:.6f}"
        )

        print(
            f"Learning Rate: "
            f"{current_lr:.8f}"
        )

        is_best = (
            validation_loss
            < trainer.best_val_loss
        )

        if is_best:

            trainer.best_val_loss = (
                validation_loss
            )

        trainer.save_checkpoint(
            epoch=epoch,
            train_loss=train_loss,
            validation_loss=validation_loss,
            is_best=is_best,
        )

    print("\n" + "=" * 65)
    print("TRAINING COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    main()
    
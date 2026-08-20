"""
Gyan Multilingual TTS — Demo Training

Runs a short, real training demonstration:
- Limited training batches
- Limited validation batches
- GPU training
- Gradient accumulation
- Checkpoint saving

This is for project demonstration, not final training.
"""

from itertools import islice
from pathlib import Path

import torch

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)
from ai.training.trainer import TTSTrainer
from ai.utils.text_utils import MultilingualVocabulary


TRAIN_BATCHES = 100
VALIDATION_BATCHES = 20


def get_device():
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        print("WARNING: CUDA not available. Using CPU.")

    return device


def main():

    print()
    print("=" * 60)
    print("GYAN MULTILINGUAL TTS — DEMO TRAINING")
    print("=" * 60)

    # ---------------------------------------------------------
    # Configuration
    # ---------------------------------------------------------

    config = TTSConfig()

    # Safe RTX 2050 settings
    config.data.batch_size = 4
    config.data.num_workers = 0
    config.data.pin_memory = True

    config.training.gradient_accumulation_steps = 4
    config.training.use_amp = True

    # Separate demo checkpoints from full training
    config.training.checkpoint_dir = Path(
        "D:/Gyan/checkpoints/demo"
    )

    device = get_device()

    print()
    print(f"Batch size: {config.data.batch_size}")
    print(
        "Gradient accumulation: "
        f"{config.training.gradient_accumulation_steps}"
    )
    print(
        "Effective batch size: "
        f"{config.data.batch_size * config.training.gradient_accumulation_steps}"
    )
    print(f"Training batches: {TRAIN_BATCHES}")
    print(f"Validation batches: {VALIDATION_BATCHES}")

    # ---------------------------------------------------------
    # Vocabulary
    # ---------------------------------------------------------

    vocab = MultilingualVocabulary(config.text)

    if config.data.vocab_file.exists():
        vocab.load(config.data.vocab_file)
        print(f"Vocabulary loaded: {len(vocab)} tokens")
    else:
        vocab.build_from_train_csv(
            config.data.splits_dir / "train.csv",
            save_path=config.data.vocab_file,
        )
        print(f"Vocabulary built: {len(vocab)} tokens")

    config.model.vocab_size = len(vocab)

    # ---------------------------------------------------------
    # Datasets
    # ---------------------------------------------------------

    train_dataset = MultilingualTTSDataset(
        split_csv_path=config.data.splits_dir / "train.csv",
        config=config,
        vocab=vocab,
    )

    val_dataset = MultilingualTTSDataset(
    split_csv_path=config.data.splits_dir / "validation.csv",
    config=config,
    vocab=vocab,
    )

    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    # ---------------------------------------------------------
    # DataLoaders
    # ---------------------------------------------------------

    train_loader = create_tts_dataloader(
        train_dataset,
        batch_size=config.data.batch_size,
        shuffle=True,
        num_workers=config.data.num_workers,
        pin_memory=config.data.pin_memory,
        drop_last=False,
    )

    val_loader = create_tts_dataloader(
        val_dataset,
        batch_size=config.data.batch_size,
        shuffle=False,
        num_workers=config.data.num_workers,
        pin_memory=config.data.pin_memory,
        drop_last=False,
    )

    # ---------------------------------------------------------
    # Model
    # ---------------------------------------------------------

    model = MultilingualTTS(
        config=config,
        vocab_size=len(vocab),
    )

    print(
        f"Trainable parameters: "
        f"{model.count_parameters():,}"
    )

    # ---------------------------------------------------------
    # Trainer
    # ---------------------------------------------------------

    trainer = TTSTrainer(
        model=model,
        config=config,
        device=device,
    )

    # ---------------------------------------------------------
    # Limited loaders
    # ---------------------------------------------------------

    limited_train_loader = list(
        islice(train_loader, TRAIN_BATCHES)
    )

    limited_val_loader = list(
        islice(val_loader, VALIDATION_BATCHES)
    )

    # ---------------------------------------------------------
    # Training
    # ---------------------------------------------------------

    print()
    print("=" * 60)
    print("STARTING DEMO TRAINING")
    print("=" * 60)

    train_metrics = trainer.train_epoch(
        limited_train_loader
    )

    train_loss = train_metrics["train_loss"]

    # ---------------------------------------------------------
    # Validation
    # ---------------------------------------------------------

    print()
    print("=" * 60)
    print("RUNNING VALIDATION")
    print("=" * 60)

    validation_metrics = trainer.validate(
        limited_val_loader
    )

    validation_loss = (
        validation_metrics["validation_loss"]
    )

    # ---------------------------------------------------------
    # Scheduler / best model / history
    # ---------------------------------------------------------

    trainer.step_scheduler(validation_loss)

    is_best, _ = trainer.update_early_stopping(
        validation_loss=validation_loss,
        patience=config.training.early_stopping_patience,
        min_delta=config.training.early_stopping_min_delta,
    )

    trainer.update_history(
        epoch=1,
        train_loss=train_loss,
        validation_loss=validation_loss,
    )

    trainer.save_checkpoint(
        epoch=1,
        train_loss=train_loss,
        validation_loss=validation_loss,
        is_best=is_best,
    )

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------

    print()
    print("=" * 60)
    print("DEMO TRAINING COMPLETE")
    print("=" * 60)

    print(f"Train Loss: {train_loss:.6f}")
    print(f"Validation Loss: {validation_loss:.6f}")

    print()
    print(
        "Checkpoint directory:"
    )
    print(config.training.checkpoint_dir)

    if device.type == "cuda":

        print()
        print(
            f"Peak GPU memory: "
            f"{torch.cuda.max_memory_allocated() / 1024**2:.2f} MB"
        )


if __name__ == "__main__":
    main()
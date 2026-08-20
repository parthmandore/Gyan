"""
Gyan Multilingual TTS — Full Training Script

Phase 8.7.4

Provides:
- Full train/validation pipeline
- CUDA device detection
- RTX 2050 friendly configuration
- Shared vocabulary
- Shared mel extractor
- Train and validation DataLoaders
- Model initialization
- Automatic checkpoint resume
- Learning-rate scheduling
- Training history
- Best model saving
- Latest checkpoint saving
- Early stopping
"""

import torch

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.preprocessing.audio_features import MelSpectrogramExtractor
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)
from ai.training.trainer import TTSTrainer
from ai.utils.text_utils import MultilingualVocabulary


def get_device() -> torch.device:
    """
    Select the best available training device.
    """

    if torch.cuda.is_available():

        device = torch.device("cuda")

        print("=" * 60)
        print("CUDA AVAILABLE")
        print("=" * 60)

        print(
            f"GPU: "
            f"{torch.cuda.get_device_name(0)}"
        )

        print(
            f"CUDA Version: "
            f"{torch.version.cuda}"
        )

        total_memory = (
            torch.cuda.get_device_properties(0)
            .total_memory
            / (1024 ** 3)
        )

        print(
            f"GPU Memory: "
            f"{total_memory:.2f} GB"
        )

    else:

        device = torch.device("cpu")

        print("=" * 60)
        print("CUDA NOT AVAILABLE")
        print("Training will use CPU.")
        print("=" * 60)

    return device


def create_vocabulary(
    config: TTSConfig,
) -> MultilingualVocabulary:
    """
    Load the existing vocabulary.

    If no vocabulary exists, build it from train.csv.
    """

    vocab = MultilingualVocabulary(
        config.text
    )

    vocab_path = config.data.vocab_file

    if vocab_path.exists():

        print(
            f"Loading vocabulary: "
            f"{vocab_path}"
        )

        vocab.load(
            vocab_path
        )

    else:

        train_csv = (
            config.data.splits_dir
            / "train.csv"
        )

        if not train_csv.exists():

            raise FileNotFoundError(
                f"Training split not found: "
                f"{train_csv}"
            )

        print(
            "Vocabulary not found."
        )

        print(
            f"Building vocabulary from: "
            f"{train_csv}"
        )

        vocab.build_from_train_csv(
            train_csv,
            save_path=vocab_path,
        )

    return vocab


def create_datasets(
    config: TTSConfig,
    vocab: MultilingualVocabulary,
):
    """
    Create training and validation datasets.

    The same vocabulary and mel extractor are shared
    between both datasets.
    """

    train_csv = (
        config.data.splits_dir
        / "train.csv"
    )

    val_csv = (
        config.data.splits_dir
        / "val.csv"
    )

    if not train_csv.exists():

        raise FileNotFoundError(
            f"Training split not found: "
            f"{train_csv}"
        )

    if not val_csv.exists():

        raise FileNotFoundError(
            f"Validation split not found: "
            f"{val_csv}"
        )

    print(
        f"Training split: "
        f"{train_csv}"
    )

    print(
        f"Validation split: "
        f"{val_csv}"
    )

    # Use one shared mel extractor configuration
    # for both train and validation datasets.
    mel_extractor = (
        MelSpectrogramExtractor(
            config.audio
        )
    )

    train_dataset = (
        MultilingualTTSDataset(
            split_csv_path=train_csv,
            config=config,
            vocab=vocab,
            mel_extractor=mel_extractor,
        )
    )

    val_dataset = (
        MultilingualTTSDataset(
            split_csv_path=val_csv,
            config=config,
            vocab=vocab,
            mel_extractor=mel_extractor,
        )
    )

    return (
        train_dataset,
        val_dataset,
    )


def create_dataloaders(
    train_dataset,
    val_dataset,
    config: TTSConfig,
):
    """
    Create training and validation DataLoaders.
    """

    train_loader = (
        create_tts_dataloader(
            dataset=train_dataset,
            batch_size=config.data.batch_size,
            shuffle=True,
            num_workers=config.data.num_workers,
            pin_memory=config.data.pin_memory,
            drop_last=config.data.drop_last,
        )
    )

    val_loader = (
        create_tts_dataloader(
            dataset=val_dataset,
            batch_size=config.data.batch_size,
            shuffle=False,
            num_workers=config.data.num_workers,
            pin_memory=config.data.pin_memory,
            drop_last=False,
        )
    )

    return (
        train_loader,
        val_loader,
    )


def main():

    print()
    print("=" * 60)
    print("GYAN MULTILINGUAL TTS")
    print("FULL TRAINING")
    print("=" * 60)
    print()

    # ========================================================
    # Configuration
    # ========================================================

    config = TTSConfig()

    print("Configuration loaded.")

    print(
        f"Batch size: "
        f"{config.data.batch_size}"
    )

    print(
        f"Gradient accumulation: "
        f"{config.training.gradient_accumulation_steps}"
    )

    effective_batch_size = (
        config.data.batch_size
        * config.training.gradient_accumulation_steps
    )

    print(
        f"Effective batch size: "
        f"{effective_batch_size}"
    )

    print(
        f"Maximum epochs: "
        f"{config.training.num_epochs}"
    )

    print()

    # ========================================================
    # Device
    # ========================================================

    device = get_device()

    print()

    # ========================================================
    # Vocabulary
    # ========================================================

    vocab = create_vocabulary(
        config
    )

    # Get the exact vocabulary size from the
    # MultilingualVocabulary instance.
    actual_vocab_size = len(vocab)

    # Synchronize model configuration with the
    # vocabulary that will actually be used.
    config.model.vocab_size = (
        actual_vocab_size
    )

    print(
        f"Vocabulary size: "
        f"{actual_vocab_size}"
    )

    print()

    # ========================================================
    # Datasets
    # ========================================================

    (
        train_dataset,
        val_dataset,
    ) = create_datasets(
        config=config,
        vocab=vocab,
    )

    print(
        f"Training samples: "
        f"{len(train_dataset)}"
    )

    print(
        f"Validation samples: "
        f"{len(val_dataset)}"
    )

    print()

    # ========================================================
    # DataLoaders
    # ========================================================

    (
        train_loader,
        val_loader,
    ) = create_dataloaders(
        train_dataset=train_dataset,
        val_dataset=val_dataset,
        config=config,
    )

    print(
        f"Training batches: "
        f"{len(train_loader)}"
    )

    print(
        f"Validation batches: "
        f"{len(val_loader)}"
    )

    print()

    # ========================================================
    # Model
    # ========================================================

    model = MultilingualTTS(
        config=config,
        vocab_size=actual_vocab_size,
    )

    print(
        f"Trainable parameters: "
        f"{model.count_parameters():,}"
    )

    print()

    # ========================================================
    # Trainer
    # ========================================================

    trainer = TTSTrainer(
        model=model,
        config=config,
        device=device,
    )

    # ========================================================
    # Automatic Resume
    # ========================================================

    start_epoch = 1

    latest_checkpoint = (
        config.training.checkpoint_dir
        / "latest_checkpoint.pt"
    )

    if (
        config.training.auto_resume
        and latest_checkpoint.exists()
    ):

        print("=" * 60)
        print("AUTO-RESUME ENABLED")
        print("=" * 60)

        start_epoch = (
            trainer.load_checkpoint(
                latest_checkpoint
            )
        )

    else:

        print(
            "Starting training from scratch."
        )

    print()

    # ========================================================
    # Training Loop
    # ========================================================

    print("=" * 60)
    print("STARTING TRAINING")
    print("=" * 60)

    training_cfg = config.training

    for epoch in range(
        start_epoch,
        training_cfg.num_epochs + 1,
    ):

        print()
        print("=" * 60)

        print(
            f"EPOCH "
            f"{epoch}/"
            f"{training_cfg.num_epochs}"
        )

        print("=" * 60)

        # ----------------------------------------------------
        # Training
        # ----------------------------------------------------

        train_metrics = (
            trainer.train_epoch(
                train_loader
            )
        )

        train_loss = (
            train_metrics["train_loss"]
        )

        # ----------------------------------------------------
        # Validation
        # ----------------------------------------------------

        validation_metrics = (
            trainer.validate(
                val_loader
            )
        )

        validation_loss = (
            validation_metrics[
                "validation_loss"
            ]
        )

        # ----------------------------------------------------
        # Learning Rate Scheduler
        # ----------------------------------------------------

        trainer.step_scheduler(
            validation_loss
        )

        # ----------------------------------------------------
        # Early Stopping
        # ----------------------------------------------------

        (
            is_best,
            should_stop,
        ) = trainer.update_early_stopping(
            validation_loss=validation_loss,
            patience=(
                training_cfg
                .early_stopping_patience
            ),
            min_delta=(
                training_cfg
                .early_stopping_min_delta
            ),
        )

        # ----------------------------------------------------
        # Training History
        # ----------------------------------------------------

        trainer.update_history(
            epoch=epoch,
            train_loss=train_loss,
            validation_loss=validation_loss,
        )

        # ----------------------------------------------------
        # Epoch Summary
        # ----------------------------------------------------

        print()

        print(
            f"Epoch {epoch} Summary"
        )

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
            f"{trainer.get_learning_rate():.8f}"
        )

        # ----------------------------------------------------
        # Checkpoint Saving
        # ----------------------------------------------------

        should_save_epoch = (
            epoch
            % training_cfg.save_every_epochs
            == 0
        )

        if should_save_epoch or is_best:

            trainer.save_checkpoint(
                epoch=epoch,
                train_loss=train_loss,
                validation_loss=validation_loss,
                is_best=is_best,
            )

        # ----------------------------------------------------
        # GPU Memory Cleanup
        # ----------------------------------------------------

        if device.type == "cuda":

            torch.cuda.empty_cache()

        # ----------------------------------------------------
        # Early Stopping
        # ----------------------------------------------------

        if should_stop:

            print()

            print("=" * 60)
            print("EARLY STOPPING TRIGGERED")
            print(
                f"No validation improvement for "
                f"{training_cfg.early_stopping_patience} "
                f"epochs."
            )
            print("=" * 60)

            break

    # ========================================================
    # Training Complete
    # ========================================================

    print()
    print("=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)

    print(
        f"Best validation loss: "
        f"{trainer.best_val_loss:.6f}"
    )

    print(
        f"Checkpoints directory: "
        f"{config.training.checkpoint_dir}"
    )

    print(
        f"History file: "
        f"{trainer.history_path}"
    )


if __name__ == "__main__":

    main()
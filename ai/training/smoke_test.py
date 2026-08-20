"""
Gyan Multilingual TTS — GPU Smoke Test

Phase 8.7.5

Tests one real training batch end-to-end:

- CUDA availability
- Dataset loading
- Vocabulary loading
- Mel extraction
- DataLoader collation
- Model forward pass
- Loss calculation
- Backpropagation
- Gradient clipping
- Optimizer update
- GPU memory usage
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


def main():

    print()
    print("=" * 60)
    print("GYAN MULTILINGUAL TTS — GPU SMOKE TEST")
    print("=" * 60)

    # --------------------------------------------------------
    # Configuration
    # --------------------------------------------------------

    config = TTSConfig()

    # --------------------------------------------------------
    # Device
    # --------------------------------------------------------

    if not torch.cuda.is_available():

        raise RuntimeError(
            "CUDA is not available. "
            "Smoke test should be run on the RTX 2050."
        )

    device = torch.device("cuda")

    print()
    print(f"GPU: {torch.cuda.get_device_name(0)}")

    total_memory = (
        torch.cuda.get_device_properties(0).total_memory
        / (1024 ** 3)
    )

    print(
        f"Total GPU memory: "
        f"{total_memory:.2f} GB"
    )

    # Clear old allocations before testing.

    torch.cuda.empty_cache()
    torch.cuda.reset_peak_memory_stats()

    # --------------------------------------------------------
    # Vocabulary
    # --------------------------------------------------------

    vocab = MultilingualVocabulary(
        config.text
    )

    if config.data.vocab_file.exists():

        vocab.load(
            config.data.vocab_file
        )

        print(
            f"Vocabulary loaded: "
            f"{len(vocab)} tokens"
        )

    else:

        train_csv = (
            config.data.splits_dir
            / "train.csv"
        )

        vocab.build_from_train_csv(
            train_csv,
            save_path=config.data.vocab_file,
        )

        print(
            f"Vocabulary built: "
            f"{len(vocab)} tokens"
        )

    # Synchronize model vocabulary size.

    config.model.vocab_size = len(vocab)

    # --------------------------------------------------------
    # Dataset
    # --------------------------------------------------------

    train_csv = (
        config.data.splits_dir
        / "train.csv"
    )

    mel_extractor = MelSpectrogramExtractor(
        config.audio
    )

    train_dataset = MultilingualTTSDataset(
        split_csv_path=train_csv,
        config=config,
        vocab=vocab,
        mel_extractor=mel_extractor,
    )

    print(
        f"Training samples: "
        f"{len(train_dataset)}"
    )

    # --------------------------------------------------------
    # DataLoader
    # --------------------------------------------------------

    # Use only one small batch for the smoke test.
    # Do not modify the permanent config.

    smoke_batch_size = min(
        2,
        config.data.batch_size,
    )

    train_loader = create_tts_dataloader(
        dataset=train_dataset,
        batch_size=smoke_batch_size,
        shuffle=True,
        num_workers=0,
        pin_memory=True,
        drop_last=False,
    )

    print(
        f"Smoke-test batch size: "
        f"{smoke_batch_size}"
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = MultilingualTTS(
        config=config,
        vocab_size=len(vocab),
    )

    print(
        f"Trainable parameters: "
        f"{model.count_parameters():,}"
    )

    # --------------------------------------------------------
    # Trainer
    # --------------------------------------------------------

    trainer = TTSTrainer(
        model=model,
        config=config,
        device=device,
    )

    # --------------------------------------------------------
    # Get One Real Batch
    # --------------------------------------------------------

    print()
    print("Loading one batch...")

    batch = next(
        iter(train_loader)
    )

    print(
        f"Text shape: "
        f"{tuple(batch['text_padded'].shape)}"
    )

    print(
        f"Mel shape: "
        f"{tuple(batch['mel_padded'].shape)}"
    )

    print(
        f"Text lengths: "
        f"{batch['text_lengths'].tolist()}"
    )

    print(
        f"Mel lengths: "
        f"{batch['mel_lengths'].tolist()}"
    )

    # --------------------------------------------------------
    # Move Batch To GPU
    # --------------------------------------------------------

    text_ids = batch[
        "text_padded"
    ].to(
        device,
        non_blocking=True,
    )

    text_lengths = batch[
        "text_lengths"
    ].to(
        device,
        non_blocking=True,
    )

    language_ids = batch[
        "language_ids"
    ].to(
        device,
        non_blocking=True,
    )

    target_mel = batch[
        "mel_padded"
    ].to(
        device,
        non_blocking=True,
    )

    mel_lengths = batch[
        "mel_lengths"
    ].to(
        device,
        non_blocking=True,
    )

    # --------------------------------------------------------
    # Forward + Loss
    # --------------------------------------------------------

    print()
    print("Running forward pass...")

    trainer.optimizer.zero_grad(
        set_to_none=True
    )

    with torch.amp.autocast(
        device_type="cuda",
        enabled=trainer.use_amp,
    ):

        coarse_mel, refined_mel = trainer.model(
            text_ids=text_ids,
            text_lengths=text_lengths,
            language_ids=language_ids,
            mel_lengths=mel_lengths,
        )

        loss, metrics = trainer.criterion(
            coarse_mel=coarse_mel,
            refined_mel=refined_mel,
            target_mel=target_mel,
            mel_lengths=mel_lengths,
        )

    print(
        f"Coarse mel shape: "
        f"{tuple(coarse_mel.shape)}"
    )

    print(
        f"Refined mel shape: "
        f"{tuple(refined_mel.shape)}"
    )

    print(
        f"Loss: "
        f"{loss.item():.6f}"
    )

    # --------------------------------------------------------
    # Backward Pass
    # --------------------------------------------------------

    print()
    print("Running backward pass...")

    trainer.scaler.scale(
        loss
    ).backward()

    trainer.scaler.unscale_(
        trainer.optimizer
    )

    grad_norm = torch.nn.utils.clip_grad_norm_(
        trainer.model.parameters(),
        config.training.gradient_clip_norm,
    )

    trainer.scaler.step(
        trainer.optimizer
    )

    trainer.scaler.update()

    print(
        f"Gradient norm: "
        f"{grad_norm.item():.6f}"
    )

    # --------------------------------------------------------
    # GPU Memory
    # --------------------------------------------------------

    torch.cuda.synchronize()

    allocated_memory = (
        torch.cuda.memory_allocated()
        / (1024 ** 2)
    )

    reserved_memory = (
        torch.cuda.memory_reserved()
        / (1024 ** 2)
    )

    peak_memory = (
        torch.cuda.max_memory_allocated()
        / (1024 ** 2)
    )

    print()
    print("=" * 60)
    print("GPU MEMORY")
    print("=" * 60)

    print(
        f"Allocated: "
        f"{allocated_memory:.2f} MB"
    )

    print(
        f"Reserved: "
        f"{reserved_memory:.2f} MB"
    )

    print(
        f"Peak allocated: "
        f"{peak_memory:.2f} MB"
    )

    # --------------------------------------------------------
    # Final Result
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("SMOKE TEST PASSED")
    print("=" * 60)

    print()
    print(
        "The model successfully completed:"
    )

    print("✓ Dataset loading")
    print("✓ Mel extraction")
    print("✓ Batch collation")
    print("✓ GPU transfer")
    print("✓ Forward pass")
    print("✓ Loss calculation")
    print("✓ Backward pass")
    print("✓ Gradient clipping")
    print("✓ Optimizer update")
    print("✓ GPU memory measurement")


if __name__ == "__main__":

    main()
"""
Gyan Multilingual TTS — Single Training Step Test

Tests:

Real dataset
    ↓
DataLoader
    ↓
Model
    ↓
Forward pass
    ↓
Masked loss
    ↓
Backward pass
    ↓
Gradient check
    ↓
Optimizer step
"""

import torch

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)
from ai.training.losses import multilingual_tts_loss


def main():

    print("=" * 60)
    print("GYAN TTS SINGLE TRAINING STEP TEST")
    print("=" * 60)

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print(f"\nDevice: {device}")

    if torch.cuda.is_available():
        print(
            f"GPU: {torch.cuda.get_device_name(0)}"
        )

    # --------------------------------------------------
    # Configuration
    # --------------------------------------------------

    config = TTSConfig()

    # --------------------------------------------------
    # Dataset
    # --------------------------------------------------

    train_csv = config.data.splits_dir / "train.csv"

    dataset = MultilingualTTSDataset(
        split_csv_path=train_csv,
        config=config,
    )

    print(f"\nDataset size: {len(dataset)}")
    print(f"Vocabulary size: {len(dataset.vocab)}")

    dataloader = create_tts_dataloader(
        dataset,
        batch_size=2,
        shuffle=True,
    )

    batch = next(iter(dataloader))

    # --------------------------------------------------
    # Move batch to device
    # --------------------------------------------------

    text_ids = batch["text_padded"].to(device)
    text_lengths = batch["text_lengths"].to(device)

    mel_target = batch["mel_padded"].to(device)
    mel_lengths = batch["mel_lengths"].to(device)

    language_ids = batch["language_ids"].to(device)

    print("\nINPUT SHAPES")

    print(
        f"Text IDs: {text_ids.shape}"
    )

    print(
        f"Target Mel: {mel_target.shape}"
    )

    print(
        f"Mel Lengths: {mel_lengths.tolist()}"
    )

    print(
        f"Language IDs: {language_ids.tolist()}"
    )

    # --------------------------------------------------
    # Model
    # --------------------------------------------------

    model = MultilingualTTS(
        config=config,
        vocab_size=len(dataset.vocab),
    ).to(device)

    print("\nMODEL")

    print(
        f"Trainable parameters: "
        f"{model.count_parameters():,}"
    )

    # --------------------------------------------------
    # Optimizer
    # --------------------------------------------------

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=1e-4,
    )

    # --------------------------------------------------
    # Training step
    # --------------------------------------------------

    print("\nRUNNING TRAINING STEP...")

    model.train()

    optimizer.zero_grad()

    coarse_mel, refined_mel = model(
        text_ids=text_ids,
        text_lengths=text_lengths,
        language_ids=language_ids,
        mel_lengths=mel_lengths,
    )

    losses = multilingual_tts_loss(
        coarse_mel=coarse_mel,
        refined_mel=refined_mel,
        target_mel=mel_target,
        mel_lengths=mel_lengths,
    )

    total_loss = losses["total_loss"]

    print("\nLOSSES")

    print(
        f"Coarse loss: "
        f"{losses['coarse_loss'].item():.6f}"
    )

    print(
        f"Refined loss: "
        f"{losses['refined_loss'].item():.6f}"
    )

    print(
        f"Total loss: "
        f"{total_loss.item():.6f}"
    )

    # --------------------------------------------------
    # Backward pass
    # --------------------------------------------------

    total_loss.backward()

    print("\nBACKWARD PASS")

    total_grad_norm = 0.0
    gradient_parameters = 0

    for parameter in model.parameters():

        if parameter.grad is not None:

            gradient_norm = (
                parameter.grad.data.norm(2).item()
            )

            total_grad_norm += gradient_norm ** 2

            gradient_parameters += 1

    total_grad_norm = total_grad_norm ** 0.5

    print(
        f"Parameters with gradients: "
        f"{gradient_parameters}"
    )

    print(
        f"Gradient norm before clipping: "
        f"{total_grad_norm:.6f}"
    )

    # --------------------------------------------------
    # Gradient clipping
    # --------------------------------------------------

    torch.nn.utils.clip_grad_norm_(
        model.parameters(),
        max_norm=1.0,
    )

    # --------------------------------------------------
    # Optimizer step
    # --------------------------------------------------

    optimizer.step()

    print("\nOPTIMIZER STEP: OK")

    # --------------------------------------------------
    # Validation
    # --------------------------------------------------

    finite_loss = torch.isfinite(total_loss).item()

    print("\nVALIDATION")

    print(
        f"Loss is finite: {finite_loss}"
    )

    print(
        f"Coarse NaN: "
        f"{torch.isnan(coarse_mel).any().item()}"
    )

    print(
        f"Refined NaN: "
        f"{torch.isnan(refined_mel).any().item()}"
    )

    if torch.cuda.is_available():

        print(
            f"\nGPU allocated: "
            f"{torch.cuda.memory_allocated() / 1024**2:.2f} MB"
        )

        print(
            f"GPU reserved: "
            f"{torch.cuda.memory_reserved() / 1024**2:.2f} MB"
        )

    assert finite_loss, "Loss is not finite!"

    assert gradient_parameters > 0, (
        "No gradients were found!"
    )

    print("\n" + "=" * 60)
    print("TRAINING STEP TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":
    main()
    
"""
Gyan Multilingual TTS — Overfitting Test

Trains on a tiny fixed subset of 32 samples.

Purpose:
Verify that the model, loss function, gradients, and optimizer
can actually learn before starting full multilingual training.
"""

import random

import torch
from torch.utils.data import DataLoader, Subset

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import (
    MultilingualTTSDataset,
    TTSCollateFn,
)
from ai.training.losses import multilingual_tts_loss


def main():

    print("=" * 65)
    print("GYAN MULTILINGUAL TTS — 32 SAMPLE OVERFITTING TEST")
    print("=" * 65)

    # --------------------------------------------------
    # Device
    # --------------------------------------------------

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
    # Load dataset
    # --------------------------------------------------

    train_csv = config.data.splits_dir / "train.csv"

    dataset = MultilingualTTSDataset(
        split_csv_path=train_csv,
        config=config,
    )

    print(f"\nFull training dataset: {len(dataset)} samples")
    print(f"Vocabulary size: {len(dataset.vocab)}")

    # --------------------------------------------------
    # Fixed 32-sample subset
    # --------------------------------------------------

    random.seed(42)

    subset_size = 32

    indices = random.sample(
        range(len(dataset)),
        subset_size,
    )

    subset = Subset(dataset, indices)

    print(f"Overfitting subset: {len(subset)} samples")

    # --------------------------------------------------
    # DataLoader
    # --------------------------------------------------

    collate_fn = TTSCollateFn(
        pad_token_id=config.text.pad_id,
        mel_pad_val=float(
            torch.log(
                torch.tensor(config.audio.clamp_min)
            ).item()
        ),
    )

    dataloader = DataLoader(
        subset,
        batch_size=2,
        shuffle=True,
        num_workers=0,
        collate_fn=collate_fn,
    )

    # --------------------------------------------------
    # Model
    # --------------------------------------------------

    model = MultilingualTTS(
        config=config,
        vocab_size=len(dataset.vocab),
    ).to(device)

    print(
        f"\nTrainable parameters: "
        f"{model.count_parameters():,}"
    )

    # --------------------------------------------------
    # Optimizer
    # --------------------------------------------------

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=3e-4,
    )

    # --------------------------------------------------
    # Training
    # --------------------------------------------------

    num_epochs = 30

    print("\nStarting overfitting test...\n")

    initial_loss = None
    final_loss = None

    for epoch in range(1, num_epochs + 1):

        model.train()

        epoch_loss = 0.0
        num_batches = 0

        for batch in dataloader:

            text_ids = batch["text_padded"].to(device)

            text_lengths = (
                batch["text_lengths"]
                .to(device)
            )

            mel_target = (
                batch["mel_padded"]
                .to(device)
            )

            mel_lengths = (
                batch["mel_lengths"]
                .to(device)
            )

            language_ids = (
                batch["language_ids"]
                .to(device)
            )

            # Forward
            optimizer.zero_grad()

            coarse_mel, refined_mel = model(
                text_ids=text_ids,
                text_lengths=text_lengths,
                language_ids=language_ids,
                mel_lengths=mel_lengths,
            )

            # Loss
            losses = multilingual_tts_loss(
                coarse_mel=coarse_mel,
                refined_mel=refined_mel,
                target_mel=mel_target,
                mel_lengths=mel_lengths,
            )

            loss = losses["total_loss"]

            # Backward
            loss.backward()

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                max_norm=1.0,
            )

            optimizer.step()

            epoch_loss += loss.item()

            num_batches += 1

        average_loss = epoch_loss / num_batches

        if initial_loss is None:
            initial_loss = average_loss

        final_loss = average_loss

        print(
            f"Epoch {epoch:02d}/{num_epochs} | "
            f"Loss: {average_loss:.6f}"
        )

    # --------------------------------------------------
    # Results
    # --------------------------------------------------

    print("\n" + "=" * 65)
    print("OVERFITTING TEST RESULTS")
    print("=" * 65)

    print(f"\nInitial loss: {initial_loss:.6f}")
    print(f"Final loss:   {final_loss:.6f}")

    reduction = (
        (initial_loss - final_loss)
        / initial_loss
    ) * 100

    print(f"Loss reduction: {reduction:.2f}%")

    print(
        f"\nGPU allocated: "
        f"{torch.cuda.memory_allocated() / 1024**2:.2f} MB"
        if torch.cuda.is_available()
        else ""
    )

    if final_loss < initial_loss:
        print("\nOVERFITTING TEST PASSED")
        print("The model successfully learned from the tiny dataset.")

    else:
        print("\nOVERFITTING TEST FAILED")
        print("Loss did not decrease.")


if __name__ == "__main__":
    main()
    
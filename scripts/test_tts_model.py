"""
Smoke test for the Gyan multilingual TTS model.
"""

import torch

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)


def check_tensor(name, tensor):
    print(f"\n{name}")
    print(f"Shape: {tuple(tensor.shape)}")
    print(f"NaN: {torch.isnan(tensor).any().item()}")
    print(f"Inf: {torch.isinf(tensor).any().item()}")


def main():

    config = TTSConfig()

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print("=" * 60)
    print("GYAN MULTILINGUAL TTS MODEL SMOKE TEST")
    print("=" * 60)

    print(f"Device: {device}")

    if torch.cuda.is_available():
        print(
            f"GPU: {torch.cuda.get_device_name(0)}"
        )
        torch.cuda.empty_cache()

    # ---------------------------------------------------------
    # Dataset
    # ---------------------------------------------------------

    train_csv = config.data.splits_dir / "train.csv"

    dataset = MultilingualTTSDataset(
        split_csv_path=train_csv,
        config=config,
    )

    dataloader = create_tts_dataloader(
        dataset=dataset,
        batch_size=2,
        shuffle=False,
        num_workers=0,
        pin_memory=torch.cuda.is_available(),
    )

    batch = next(iter(dataloader))

    # ---------------------------------------------------------
    # Print input information
    # ---------------------------------------------------------

    print("\nINPUTS")

    print(
        "Text padded:",
        batch["text_padded"].shape,
    )

    print(
        "Text lengths:",
        batch["text_lengths"].tolist(),
    )

    print(
        "Mel target:",
        batch["mel_padded"].shape,
    )

    print(
        "Mel lengths:",
        batch["mel_lengths"].tolist(),
    )

    print(
        "Language IDs:",
        batch["language_ids"].tolist(),
    )

    # ---------------------------------------------------------
    # Model
    # ---------------------------------------------------------

    vocab_size = len(dataset.vocab)

    model = MultilingualTTS(
        config=config,
        vocab_size=vocab_size,
    ).to(device)

    print("\nMODEL")

    print(
        f"Vocabulary size: {vocab_size}"
    )

    print(
        f"Trainable parameters: "
        f"{model.count_parameters():,}"
    )

    # ---------------------------------------------------------
    # Move tensors
    # ---------------------------------------------------------

    text_ids = batch["text_padded"].to(device)
    text_lengths = batch["text_lengths"].to(device)

    language_ids = batch["language_ids"].to(device)

    mel_lengths = batch["mel_lengths"].to(device)

    # ---------------------------------------------------------
    # Forward pass
    # ---------------------------------------------------------

    model.eval()

    with torch.no_grad():

        coarse_mel, refined_mel = model(
            text_ids=text_ids,
            text_lengths=text_lengths,
            language_ids=language_ids,
            mel_lengths=mel_lengths,
        )

    check_tensor(
        "Coarse mel output",
        coarse_mel,
    )

    check_tensor(
        "Refined mel output",
        refined_mel,
    )

    # ---------------------------------------------------------
    # Shape validation
    # ---------------------------------------------------------

    assert coarse_mel.size(0) == text_ids.size(0)

    assert coarse_mel.size(1) == config.audio.n_mels

    assert refined_mel.shape == coarse_mel.shape

    assert not torch.isnan(refined_mel).any()

    assert not torch.isinf(refined_mel).any()

    print("\n" + "=" * 60)
    print("MODEL SMOKE TEST PASSED")
    print("=" * 60)

    if torch.cuda.is_available():

        allocated = (
            torch.cuda.memory_allocated()
            / 1024 ** 2
        )

        reserved = (
            torch.cuda.memory_reserved()
            / 1024 ** 2
        )

        print(
            f"\nGPU allocated: {allocated:.2f} MB"
        )

        print(
            f"GPU reserved: {reserved:.2f} MB"
        )


if __name__ == "__main__":
    main()
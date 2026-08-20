import torch

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import (
    MultilingualTTSDataset,
    create_tts_dataloader,
)

print("=" * 60)
print("GYAN TTS REAL DATASET BATCH TEST")
print("=" * 60)

config = TTSConfig()

# Use the combined training split
train_csv = config.data.splits_dir / "train.csv"

print(f"\nLoading dataset from:\n{train_csv}")

dataset = MultilingualTTSDataset(
    split_csv_path=train_csv,
    config=config,
)

print(f"\nDataset size: {len(dataset)}")
print(f"Vocabulary size: {len(dataset.vocab)}")

loader = create_tts_dataloader(
    dataset,
    batch_size=2,
    shuffle=True,
    num_workers=0,
)

print("\nLoading one real batch...")

batch = next(iter(loader))

print("\nBATCH INFORMATION")
print(f"Text padded shape: {batch['text_padded'].shape}")
print(f"Text lengths: {batch['text_lengths'].tolist()}")
print(f"Mel padded shape: {batch['mel_padded'].shape}")
print(f"Mel lengths: {batch['mel_lengths'].tolist()}")
print(f"Language IDs: {batch['language_ids'].tolist()}")

print("\nSAMPLES")

for i in range(len(batch["texts"])):
    print("-" * 50)
    print(f"Language ID: {batch['language_ids'][i].item()}")
    print(f"Audio file: {batch['audio_files'][i]}")
    print(f"Text: {batch['texts'][i][:150]}")

print("\nVALIDATION")

assert batch["text_padded"].dim() == 2
assert batch["mel_padded"].dim() == 3
assert batch["mel_padded"].shape[1] == config.audio.n_mels
assert torch.isfinite(batch["mel_padded"]).all()

print("Text tensor: OK")
print("Mel tensor: OK")
print("80 mel channels: OK")
print("No NaN/Inf: OK")

print("\n" + "=" * 60)
print("REAL DATASET BATCH TEST PASSED")
print("=" * 60)
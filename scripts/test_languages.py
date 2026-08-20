import torch

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset


print("=" * 60)
print("GYAN TTS MULTILINGUAL DATA TEST")
print("=" * 60)

config = TTSConfig()

dataset = MultilingualTTSDataset(
    split_csv_path=config.data.splits_dir / "train.csv",
    config=config,
)

print(f"\nDataset size: {len(dataset)}")

# Language code -> expected language ID
target_languages = {
    "en": 0,
    "hi": 1,
    "mr": 2,
}

found = {}

print("\nSearching for samples from all 3 languages...")

for idx in range(len(dataset)):

    sample = dataset[idx]

    language_id = sample["language_id"].item()

    if language_id not in found:
        found[language_id] = sample

        print(
            f"Found language ID {language_id} "
            f"at dataset index {idx}"
        )

    if len(found) == 3:
        break


for language, expected_id in target_languages.items():

    print("\n" + "-" * 60)
    print(f"LANGUAGE: {language}")

    if expected_id not in found:
        raise RuntimeError(
            f"No sample found for language: {language}"
        )

    sample = found[expected_id]

    print(f"Language ID: {sample['language_id'].item()}")
    print(f"Audio file: {sample['audio_file']}")
    print(f"Text: {sample['text'][:150]}")
    print(f"Text shape: {sample['text_ids'].shape}")
    print(f"Mel shape: {sample['mel'].shape}")
    print(f"Mel length: {sample['mel_length']}")

    # Validation checks
    assert sample["language_id"].item() == expected_id
    assert sample["mel"].dim() == 2
    assert sample["mel"].shape[0] == config.audio.n_mels
    assert torch.isfinite(sample["mel"]).all()

    print("Status: PASSED")


print("\n" + "=" * 60)
print("ALL 3 LANGUAGES VERIFIED SUCCESSFULLY")
print("=" * 60)
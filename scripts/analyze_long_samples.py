from collections import Counter

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset


def analyze(name, csv_path):
    config = TTSConfig()
    dataset = MultilingualTTSDataset(csv_path, config=config)

    languages = Counter()
    lengths = []

    print(f"\n{name}")
    print("=" * 70)

    for idx in range(len(dataset)):
        sample = dataset[idx]
        mel_length = int(sample["mel_length"])

        if mel_length > config.model.max_mel_frames:
            language = str(sample.get("language", "unknown"))
            languages[language] += 1
            lengths.append(mel_length)

    print("Over-limit samples by language:")
    for language, count in languages.items():
        print(f"  {language}: {count}")

    if lengths:
        print(f"Shortest over-limit mel: {min(lengths)}")
        print(f"Longest over-limit mel:  {max(lengths)}")
        print(f"Total over-limit:        {len(lengths)}")


def main():
    config = TTSConfig()

    analyze(
        "TRAIN",
        config.data.splits_dir / "train.csv"
    )

    analyze(
        "VALIDATION",
        config.data.splits_dir / "validation.csv"
    )


if __name__ == "__main__":
    main()
from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset


def inspect(name, csv_path):
    config = TTSConfig()
    dataset = MultilingualTTSDataset(csv_path, config=config)

    print(f"\n{name}")
    print("=" * 80)

    count = 0

    for idx in range(len(dataset)):
        sample = dataset[idx]
        mel_length = int(sample["mel_length"])

        if mel_length > config.model.max_mel_frames:
            count += 1
            text = str(sample.get("text", ""))

            print(
                f"index={idx:5d} | "
                f"mel={mel_length:4d} | "
                f"duration≈{mel_length * config.audio.hop_length / config.audio.sample_rate:6.2f}s | "
                f"text_len={len(text):4d} | "
                f"text={text[:100]}"
            )

    print(f"\nTotal over-limit: {count}")


def main():
    config = TTSConfig()

    inspect(
        "BASELINE TRAIN",
        config.data.splits_dir / "train.csv"
    )

    inspect(
        "VALIDATION",
        config.data.splits_dir / "validation.csv"
    )


if __name__ == "__main__":
    main()
from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset
from tqdm import tqdm


def inspect_split(name, csv_path, config):
    dataset = MultilingualTTSDataset(csv_path, config=config)

    max_length = 0
    max_index = -1
    over_limit = 0

    print(f"\n{name}")
    print("=" * 60)
    print(f"Samples: {len(dataset):,}")
    print(f"Configured max_mel_frames: {config.model.max_mel_frames}")

    for idx in tqdm(range(len(dataset))):
        sample = dataset[idx]
        mel_length = int(sample["mel_length"])

        if mel_length > max_length:
            max_length = mel_length
            max_index = idx

        if mel_length > config.model.max_mel_frames:
            over_limit += 1

    print(f"Maximum mel length: {max_length}")
    print(f"Maximum-length sample index: {max_index}")
    print(f"Samples over limit: {over_limit}")


def main():
    config = TTSConfig()

    inspect_split(
        "BASELINE TRAIN",
        config.data.splits_dir / "train.csv",
        config
    )

    inspect_split(
        "AUGMENTED TRAIN",
        config.data.splits_dir / "train_augmented.csv",
        config
    )

    inspect_split(
        "VALIDATION",
        config.data.splits_dir / "validation.csv",
        config
    )


if __name__ == "__main__":
    main()
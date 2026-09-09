import pandas as pd

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset


MAX_MEL_FRAMES = 2048


def get_valid_indices(csv_path, config):
    dataset = MultilingualTTSDataset(csv_path, config=config)

    valid_indices = []

    for idx in range(len(dataset)):
        mel_length = int(dataset[idx]["mel_length"])

        if mel_length <= MAX_MEL_FRAMES:
            valid_indices.append(idx)

    return valid_indices


def main():
    config = TTSConfig()
    splits_dir = config.data.splits_dir

    train_path = splits_dir / "train.csv"
    val_path = splits_dir / "validation.csv"
    augmented_path = splits_dir / "train_augmented.csv"

    # ---------------------------------------------------------
    # 1. Find valid original training/validation rows
    # ---------------------------------------------------------
    print("Scanning training set...")
    train_valid_indices = get_valid_indices(train_path, config)

    print("Scanning validation set...")
    val_valid_indices = get_valid_indices(val_path, config)

    # ---------------------------------------------------------
    # 2. Load manifests
    # ---------------------------------------------------------
    print("Loading CSV files...")

    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    augmented_df = pd.read_csv(augmented_path)

    # ---------------------------------------------------------
    # 3. Create filtered baseline + validation manifests
    # ---------------------------------------------------------
    train_tts = train_df.iloc[train_valid_indices].copy()
    validation_tts = val_df.iloc[val_valid_indices].copy()

    # The invalid original training rows are identified by their
    # original DataFrame indices.
    invalid_train_indices = set(train_df.index) - set(train_valid_indices)

    # ---------------------------------------------------------
    # 4. Filter augmented manifest
    #
    # Keep:
    #   - every GAN row
    #   - every real row except the 29 over-limit originals
    #
    # Because train_augmented.csv was constructed from the
    # original training set + GAN rows, the first len(train_df)
    # rows correspond to the original training manifest.
    # ---------------------------------------------------------
    is_gan = (
        augmented_df["source_type"]
        .astype(str)
        .str.strip()
        .str.lower()
        .eq("gan_augmented")
    )

    is_real = (
        augmented_df["source_type"]
        .astype(str)
        .str.strip()
        .str.lower()
        .eq("real")
    )

    original_positions = augmented_df.index < len(train_df)

    invalid_original = (
        original_positions
        & is_real
        & augmented_df.index.isin(invalid_train_indices)
    )

    augmented_tts = augmented_df[~invalid_original].copy()

    # ---------------------------------------------------------
    # 5. Write manifests
    # ---------------------------------------------------------
    train_out = splits_dir / "train_tts.csv"
    val_out = splits_dir / "validation_tts.csv"
    augmented_out = splits_dir / "train_augmented_tts.csv"

    train_tts.to_csv(train_out, index=False)
    validation_tts.to_csv(val_out, index=False)
    augmented_tts.to_csv(augmented_out, index=False)

    # ---------------------------------------------------------
    # 6. Verification
    # ---------------------------------------------------------
    gan_count = is_gan.sum()
    real_count = is_real.sum()
    removed_count = invalid_original.sum()

    print("\nCreated manifests")
    print("=" * 60)

    print(f"train_tts.csv:            {len(train_tts):,}")
    print(f"validation_tts.csv:       {len(validation_tts):,}")
    print(f"train_augmented_tts.csv:  {len(augmented_tts):,}")

    print("\nSource composition of augmented manifest:")
    print(augmented_tts["source_type"].value_counts())

    print("\nExpected:")
    print("  Baseline:    41,309")
    print("  GAN:            300")
    print("  Augmented:   41,609")

    print("\nActual:")
    print(f"  Baseline valid:  {len(train_tts):,}")
    print(f"  GAN rows:        {gan_count:,}")
    print(f"  Removed:         {removed_count:,}")
    print(f"  Augmented total: {len(augmented_tts):,}")

    print("\nLanguage counts — baseline:")
    print(train_tts["language"].value_counts().sort_index())

    print("\nLanguage counts — augmented:")
    print(augmented_tts["language"].value_counts().sort_index())

    print("\nLanguage counts — validation:")
    print(validation_tts["language"].value_counts().sort_index())

    # Hard checks so we cannot accidentally train on a bad manifest.
    assert len(train_tts) == 41309
    assert len(validation_tts) == 2291
    assert gan_count == 300
    assert len(augmented_tts) == 41609

    print("\nAll manifest checks PASSED.")


if __name__ == "__main__":
    main()
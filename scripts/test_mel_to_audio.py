"""
Test Gyan log-mel -> WAV reconstruction.

Uses a real dataset sample first.
"""

from pathlib import Path

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset
from ai.inference.mel_to_audio import MelToAudio


def main():

    print("=" * 60)
    print("GYAN — MEL TO AUDIO TEST")
    print("=" * 60)

    config = TTSConfig()

    train_csv = (
        config.data.splits_dir
        / "train.csv"
    )

    dataset = MultilingualTTSDataset(
        split_csv_path=train_csv,
        config=config,
    )

    print(
        f"Dataset samples: {len(dataset)}"
    )

    sample = dataset[0]

    print(
        f"Language ID: "
        f"{sample['language_id'].item()}"
    )

    print(
        f"Text: "
        f"{sample['text']}"
    )

    print(
        f"Mel shape: "
        f"{tuple(sample['mel'].shape)}"
    )

    device = "cuda"

    converter = MelToAudio(
        config=config.audio,
        device=device,
    )

    output_path = Path(
        "outputs/test_real_mel.wav"
    )

    converter.convert_and_save(
        log_mel=sample["mel"],
        output_path=output_path,
    )

    print()
    print("=" * 60)
    print("MEL TO AUDIO TEST COMPLETE")
    print("=" * 60)

    print(
        f"Output: {output_path.resolve()}"
    )


if __name__ == "__main__":
    main()
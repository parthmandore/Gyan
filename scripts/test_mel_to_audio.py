"""
Generate real mel-to-audio reconstruction samples
for English, Hindi, and Marathi.
"""

from pathlib import Path

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset
from ai.inference.mel_to_audio import MelToAudio


LANGUAGES = {
    0: "english",
    1: "hindi",
    2: "marathi",
}


def main():

    print("=" * 60)
    print("GYAN — MULTILINGUAL MEL TO AUDIO TEST")
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

    converter = MelToAudio(
        config=config.audio,
        device="cuda",
    )

    output_dir = Path("outputs")
    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Track whether we found one sample
    # for each language.
    found_languages = set()

    for index in range(len(dataset)):

        sample = dataset[index]

        language_id = (
            sample["language_id"].item()
        )

        if language_id not in LANGUAGES:
            continue

        if language_id in found_languages:
            continue

        language_name = LANGUAGES[
            language_id
        ]

        print()
        print("=" * 60)
        print(
            f"PROCESSING: "
            f"{language_name.upper()}"
        )
        print("=" * 60)

        print(
            f"Dataset index: {index}"
        )

        print(
            f"Language ID: {language_id}"
        )

        print(
            f"Text: {sample['text']}"
        )

        print(
            f"Mel shape: "
            f"{tuple(sample['mel'].shape)}"
        )

        output_path = (
            output_dir
            / f"{language_name}_real_mel.wav"
        )

        converter.convert_and_save(
            log_mel=sample["mel"],
            output_path=output_path,
        )

        print(
            f"Audio saved: "
            f"{output_path.resolve()}"
        )

        found_languages.add(
            language_id
        )

        # Stop once all three languages
        # have been processed.
        if len(found_languages) == len(LANGUAGES):
            break

    print()
    print("=" * 60)
    print("MULTILINGUAL MEL TO AUDIO TEST COMPLETE")
    print("=" * 60)

    print()

    for language_name in LANGUAGES.values():

        output_path = (
            output_dir
            / f"{language_name}_real_mel.wav"
        )

        if output_path.exists():

            print(
                f"Generated: "
                f"{output_path.resolve()}"
            )


if __name__ == "__main__":
    main()
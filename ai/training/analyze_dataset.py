"""
Gyan Multilingual TTS — Dataset Analysis

Analyzes text and mel-spectrogram lengths before full training.
"""

from collections import defaultdict

import numpy as np
import torch

from ai.configs.tts_config import TTSConfig
from ai.preprocessing.audio_features import MelSpectrogramExtractor
from ai.training.dataset import MultilingualTTSDataset
from ai.utils.text_utils import MultilingualVocabulary


def main():

    print()
    print("=" * 60)
    print("GYAN MULTILINGUAL TTS — DATASET ANALYSIS")
    print("=" * 60)

    config = TTSConfig()

    # --------------------------------------------------------
    # Vocabulary
    # --------------------------------------------------------

    vocab = MultilingualVocabulary(
        config.text
    )

    if config.data.vocab_file.exists():

        vocab.load(
            config.data.vocab_file
        )

    else:

        vocab.build_from_train_csv(
            config.data.splits_dir / "train.csv",
            save_path=config.data.vocab_file,
        )

    config.model.vocab_size = len(vocab)

    # --------------------------------------------------------
    # Dataset
    # --------------------------------------------------------

    dataset = MultilingualTTSDataset(
        split_csv_path=(
            config.data.splits_dir
            / "train.csv"
        ),
        config=config,
        vocab=vocab,
        mel_extractor=MelSpectrogramExtractor(
            config.audio
        ),
    )

    print()
    print(f"Total training samples: {len(dataset)}")

    mel_lengths = []
    text_lengths = []
    language_stats = defaultdict(list)

    # --------------------------------------------------------
    # Analyze samples
    # --------------------------------------------------------

    for index in range(len(dataset)):

        sample = dataset[index]

        mel_length = sample["mel_length"]
        text_length = sample["text_length"]

        mel_lengths.append(
            mel_length
        )

        text_lengths.append(
            text_length
        )

        language_id = int(
            sample["language_id"]
        )

        language_stats[
            language_id
        ].append(
            mel_length
        )

        if (index + 1) % 1000 == 0:

            print(
                f"Processed "
                f"{index + 1}/{len(dataset)}"
            )

    # --------------------------------------------------------
    # Overall statistics
    # --------------------------------------------------------

    mel_lengths = np.array(
        mel_lengths
    )

    text_lengths = np.array(
        text_lengths
    )

    print()
    print("=" * 60)
    print("MEL LENGTH STATISTICS")
    print("=" * 60)

    print(f"Minimum: {mel_lengths.min()}")
    print(f"Maximum: {mel_lengths.max()}")
    print(f"Mean:    {mel_lengths.mean():.2f}")
    print(f"Median:  {np.median(mel_lengths):.2f}")

    for percentile in [90, 95, 99]:

        value = np.percentile(
            mel_lengths,
            percentile,
        )

        print(
            f"P{percentile}: "
            f"{value:.2f}"
        )

    print()
    print("=" * 60)
    print("TEXT LENGTH STATISTICS")
    print("=" * 60)

    print(f"Minimum: {text_lengths.min()}")
    print(f"Maximum: {text_lengths.max()}")
    print(f"Mean:    {text_lengths.mean():.2f}")
    print(f"Median:  {np.median(text_lengths):.2f}")

    # --------------------------------------------------------
    # Long sample counts
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("LONG MEL SAMPLE COUNTS")
    print("=" * 60)

    thresholds = [
        500,
        750,
        1000,
        1500,
        2000,
        2500,
        3000,
        3200,
    ]

    for threshold in thresholds:

        count = int(
            (mel_lengths > threshold).sum()
        )

        percentage = (
            count
            / len(mel_lengths)
            * 100
        )

        print(
            f">{threshold:4d} frames: "
            f"{count:6d} samples "
            f"({percentage:.2f}%)"
        )

    # --------------------------------------------------------
    # Language-wise statistics
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("LANGUAGE-WISE MEL LENGTHS")
    print("=" * 60)

    for language_id, lengths in sorted(
        language_stats.items()
    ):

        lengths = np.array(lengths)

        language_name = (
            config.language.id_to_language[
                language_id
            ]
        )

        print()
        print(
            f"Language: {language_name}"
        )

        print(
            f"Samples: {len(lengths)}"
        )

        print(
            f"Mean mel length: "
            f"{lengths.mean():.2f}"
        )

        print(
            f"Max mel length: "
            f"{lengths.max()}"
        )

    # --------------------------------------------------------
    # Final recommendation
    # --------------------------------------------------------

    p99 = np.percentile(
        mel_lengths,
        99
    )

    print()
    print("=" * 60)
    print("RECOMMENDATION")
    print("=" * 60)

    print(
        f"99th percentile mel length: "
        f"{p99:.0f}"
    )

    print(
        f"Current max_mel_frames: "
        f"{config.model.max_mel_frames}"
    )

    if p99 < 1500:

        print(
            "Dataset looks suitable for batch size 4 "
            "with gradient accumulation."
        )

    else:

        print(
            "Long sequences are significant. "
            "We should add length-aware filtering "
            "or bucketing before full training."
        )


if __name__ == "__main__":
    main()
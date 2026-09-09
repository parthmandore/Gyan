from pathlib import Path

import pandas as pd

from ai.configs.tts_config import TTSConfig
from ai.inference.gan_pipeline import GANPipeline


def main():
    config = TTSConfig()

    pipeline = GANPipeline(
        checkpoint_path="D:/Gyan/checkpoints/gan/gan_best.pt"
    )

    df = pd.read_csv(
        "D:/Gyan/data/splits/train.csv"
    )

    output_dir = Path(
        "D:/Gyan/outputs/gan_pipeline"
    )
    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # One deterministic sample from each language
    samples = (
        df[df["language"].isin(["hi", "mr"])]
        .groupby("language", sort=True)
        .head(1)
    )

    for _, row in samples.iterrows():
        language = str(row["language"]).strip()
        audio_file = str(row["audio_file"]).strip()

        language_dir = (
            config.language.language_dir_map[language]
        )

        input_path = (
            config.data.preprocessed_dir
            / language_dir
            / "wavs"
            / audio_file
        )

        output_path = (
            output_dir
            / f"{language}_augmented.wav"
        )

        print()
        print("=" * 70)
        print(f"Language: {language}")
        print(f"Input:    {input_path}")
        print(f"Output:   {output_path}")
        print("=" * 70)

        result = pipeline.augment_wav(
            audio_path=input_path,
            language=language,
            output_path=output_path,
            seed=42,
        )

        print(f"Created: {result}")

    print()
    print("=" * 70)
    print("MULTILINGUAL GAN PIPELINE TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()
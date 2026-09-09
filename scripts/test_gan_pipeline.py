from pathlib import Path

from ai.inference.gan_pipeline import GANPipeline


INPUT_AUDIO = Path(
    "D:/Gyan/data/preprocessed/english/wavs/001267.wav"
)

OUTPUT_AUDIO = Path(
    "D:/Gyan/outputs/gan_pipeline/english_augmented.wav"
)


def main():
    pipeline = GANPipeline(
        checkpoint_path=(
            "D:/Gyan/checkpoints/gan/gan_best.pt"
        )
    )

    output = pipeline.augment_wav(
        audio_path=INPUT_AUDIO,
        language="en",
        output_path=OUTPUT_AUDIO,
        seed=42,
    )

    print("=" * 70)
    print("GAN PIPELINE TEST SUCCESSFUL")
    print("=" * 70)
    print(f"Input : {INPUT_AUDIO}")
    print(f"Output: {output}")


if __name__ == "__main__":
    main()
from pathlib import Path
import kagglehub


PROJECT_ROOT = Path(__file__).resolve().parents[1]

OUTPUT_DIR = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "english"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print("Downloading LJSpeech...")
print(f"Destination: {OUTPUT_DIR}")


path = kagglehub.dataset_download(
    "mathurinache/the-lj-speech-dataset",
    output_dir=str(OUTPUT_DIR),
)


print("\nDownload complete.")
print("Dataset location:")
print(path)
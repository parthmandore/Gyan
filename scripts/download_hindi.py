from pathlib import Path
from datasets import load_dataset
import soundfile as sf
from tqdm import tqdm

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PROJECT_ROOT / "data" / "raw" / "hindi"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("Downloading Hindi dataset...")

dataset = load_dataset(
    "SayantanJoker/SYSPIN_Hindi_Female_TTS",
    split="train"
)

for item in tqdm(dataset):
    audio = item["audio"]
    sf.write(
        OUTPUT_DIR / f"{item['file_name']}.wav",
        audio["array"],
        audio["sampling_rate"]
    )

print("Hindi download complete.")
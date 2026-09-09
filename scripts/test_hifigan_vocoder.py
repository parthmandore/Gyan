"""
Gyan Multilingual TTS — HiFi-GAN Vocoder Inference Test Script.

Tests:
1. Loads HiFi-GAN Universal V1 vocoder.
2. Extracts ONE real mel sample from train.csv (English).
3. Converts log-mel to WAV audio.
4. Saves audio to D:\Gyan\outputs\vocoder_test\english_hifigan.wav.
5. Prints waveform shape, sample rate, duration, and peak amplitude.
"""

import sys
import io
from pathlib import Path
import torch

PROJECT_ROOT = Path("D:/Gyan")
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from ai.configs.tts_config import TTSConfig
from ai.training.dataset import MultilingualTTSDataset
from ai.inference.hifigan_vocoder import HiFiGANVocoder

OUTPUT_WAV = Path("D:/Gyan/outputs/vocoder_test/english_hifigan.wav")


def test_vocoder():
    print("=" * 75)
    print("GYAN TTS — HIFIGAN UNIVERSAL V1 VOCODER INFERENCE TEST")
    print("=" * 75)

    config = TTSConfig()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    if device.type == "cuda":
        print(f"GPU:    {torch.cuda.get_device_name(0)}")

    # 1. Initialize Vocoder
    vocoder = HiFiGANVocoder(device=device)

    # 2. Load ONE real sample (English) from train.csv
    dataset = MultilingualTTSDataset(config.data.splits_dir / "train.csv", config=config)
    sample = None
    for idx in range(len(dataset)):
        s = dataset[idx]
        if s["language_id"].item() == 0:  # English
            sample = s
            break

    if sample is None:
        raise RuntimeError("No English sample found in train.csv")

    real_mel = sample["mel"]  # [80, T] in natural log scale
    audio_fname = sample["audio_file"]
    text_snippet = sample["text"][:50]

    print(f"Extracted Real Sample: {audio_fname}")
    print(f"Text:                  {text_snippet}...")
    print(f"Mel Spectrogram Shape: {tuple(real_mel.shape)} [n_mels, frames]")
    print(f"Mel Min / Max:         {real_mel.min().item():.4f} / {real_mel.max().item():.4f}")

    # 3. Synthesize Waveform with HiFi-GAN
    waveform = vocoder.mel_to_waveform(real_mel)

    # 4. Save to Output WAV
    out_path = vocoder.save_wav(waveform, OUTPUT_WAV)

    # 5. Measure and report metrics
    num_samples = waveform.numel()
    sr = vocoder.config.sampling_rate
    duration_sec = num_samples / sr
    peak_amp = waveform.abs().max().item()

    print(" " + "-" * 50)
    print("SYNTHESIZED WAVEFORM METRICS")
    print("-" * 50)
    print(f"Output File:     {out_path}")
    print(f"Waveform Shape:  {tuple(waveform.shape)} ({num_samples:,} samples)")
    print(f"Sampling Rate:   {sr} Hz")
    print(f"Audio Duration:  {duration_sec:.3f} seconds")
    print(f"Peak Amplitude:  {peak_amp:.4f} (Max possible: 1.0000)")
    print(f"Is Audio Valid:  {num_samples > 0 and peak_amp > 0 and not torch.isnan(waveform).any()}")

    print(" " + "=" * 75)
    print(">>> HIFIGAN VOCODER INFERENCE TEST COMPLETED SUCCESSFULLY <<<")
    print("=" * 75)


if __name__ == "__main__":
    test_vocoder()

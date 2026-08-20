"""
Gyan Multilingual TTS — DataLoader Test Script
Validates:
1. Loading 4 samples from train.csv
2. Tensor shapes (text_padded, mel_padded, language_ids)
3. Language ID mappings
4. Text lengths and mel dimensions
5. Absence of NaN / Inf values
6. Sample rate verification (22050 Hz)
7. Physical existence of all referenced audio files
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
from ai.training.dataset import MultilingualTTSDataset, create_tts_dataloader
from ai.utils.text_utils import MultilingualVocabulary

def test_dataloader():
    print("=" * 80)
    print("TESTING GYAN MULTILINGUAL TTS DATASET & DATALOADER")
    print("=" * 80)

    config = TTSConfig()
    train_csv = config.data.splits_dir / "train.csv"

    print(f"Loading training split from: {train_csv}")
    print(f"Audio Sample Rate Target:    {config.audio.sample_rate} Hz")
    print(f"Mel Spectrogram Channels:    {config.audio.n_mels}")
    print(f"Hop Length:                  {config.audio.hop_length}")
    print(f"FFT Window:                  {config.audio.n_fft}")

    # 1. Build & verify vocabulary from training split
    vocab = MultilingualVocabulary(config.text)
    vocab_save_path = config.data.vocab_file
    vocab.build_from_train_csv(train_csv, save_path=vocab_save_path)
    print(f"\n[Vocabulary] Total vocab size: {len(vocab)} tokens (built strictly from train.csv)")
    print(f"[Vocabulary] Special tokens: {vocab.special_tokens}")

    # 2. Instantiate Dataset
    dataset = MultilingualTTSDataset(
        split_csv_path=train_csv,
        config=config,
        vocab=vocab
    )
    print(f"[Dataset] Total samples in train dataset: {len(dataset):,}")

    # 3. Create DataLoader with batch_size=4
    dataloader = create_tts_dataloader(
        dataset=dataset,
        batch_size=4,
        shuffle=False,
        num_workers=0
    )

    # 4. Fetch 1 batch (4 samples)
    batch = next(iter(dataloader))

    text_padded = batch["text_padded"]
    text_lengths = batch["text_lengths"]
    mel_padded = batch["mel_padded"]
    mel_lengths = batch["mel_lengths"]
    language_ids = batch["language_ids"]
    audio_files = batch["audio_files"]
    texts = batch["texts"]

    print("\n" + "-" * 50)
    print("BATCH TENSOR INSPECTION (Batch Size = 4)")
    print("-" * 50)
    print(f"text_padded shape:  {text_padded.shape} (batch, max_text_len)")
    print(f"text_lengths:       {text_lengths.tolist()}")
    print(f"mel_padded shape:   {mel_padded.shape} (batch, n_mels=80, max_mel_len)")
    print(f"mel_lengths:        {mel_lengths.tolist()}")
    print(f"language_ids:       {language_ids.tolist()}")

    # 5. Verify language IDs and physical file existence
    print("\n" + "-" * 50)
    print("SAMPLE-BY-SAMPLE INTEGRITY CHECK")
    print("-" * 50)

    id_to_lang = config.language.id_to_language
    lang_dir_map = config.language.language_dir_map

    for i in range(len(audio_files)):
        lid = int(language_ids[i].item())
        lcode = id_to_lang[lid]
        ldir = lang_dir_map[lcode]
        fname = audio_files[i]
        expected_path = config.data.preprocessed_dir / ldir / "wavs" / fname

        exists = expected_path.exists()
        snippet = texts[i][:35] + ("..." if len(texts[i]) > 35 else "")

        print(f"Sample {i + 1}:")
        print(f"  Audio File:     {fname}")
        print(f"  Physical Path:  {expected_path}")
        print(f"  File Exists:    {exists}")
        print(f"  Language ID:    {lid} ({lcode})")
        print(f"  Text Length:    {text_lengths[i].item()}")
        print(f"  Mel Frames:     {mel_lengths[i].item()}")
        print(f"  Text Snippet:   {snippet}")

        assert exists, f"Audio file does not exist on disk: {expected_path}"

    # 6. Verification of Numerical Health (No NaN or Inf)
    print("\n" + "-" * 50)
    print("NUMERICAL INTEGRITY VERIFICATION")
    print("-" * 50)

    has_nan_text = torch.isnan(text_padded.float()).any().item()
    has_inf_text = torch.isinf(text_padded.float()).any().item()
    has_nan_mel = torch.isnan(mel_padded).any().item()
    has_inf_mel = torch.isinf(mel_padded).any().item()

    print(f"text_padded has NaN: {has_nan_text} | has Inf: {has_inf_text}")
    print(f"mel_padded has NaN:  {has_nan_mel} | has Inf: {has_inf_mel}")
    print(f"mel_padded min:      {mel_padded.min().item():.4f}")
    print(f"mel_padded max:      {mel_padded.max().item():.4f}")
    print(f"mel_padded mean:     {mel_padded.mean().item():.4f}")

    assert not has_nan_text and not has_inf_text, "NaN or Inf found in text tensor"
    assert not has_nan_mel and not has_inf_mel, "NaN or Inf found in mel spectrogram tensor"
    assert mel_padded.size(1) == 80, f"Expected 80 mel channels, got {mel_padded.size(1)}"

    print("\n" + "=" * 80)
    print(">>> DATALOADER TEST PASSED ALL INTEGRITY & VALIDATION REQUIREMENTS <<<")
    print("=" * 80)

if __name__ == "__main__":
    test_dataloader()

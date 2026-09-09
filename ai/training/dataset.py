"""
Gyan Multilingual TTS — Dataset and DataLoader Module
Implements PyTorch Dataset with lazy audio loading and collation for multilingual TTS.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import pandas as pd
import torch
from torch.utils.data import DataLoader, Dataset

from ai.configs.tts_config import TTSConfig
from ai.preprocessing.audio_features import MelSpectrogramExtractor, load_audio
from ai.utils.text_utils import MultilingualVocabulary


class MultilingualTTSDataset(Dataset):
    """
    Production-quality PyTorch Dataset for Multilingual TTS.
    
    Features:
    - Lazy audio loading from disk (RAM efficient).
    - Resolves audio paths: data/preprocessed/<language>/wavs/<audio_file>.
    - Deterministic language mapping: en -> 0, hi -> 1, mr -> 2.
    - Extracts 80-channel log-mel spectrograms.
    - Encodes text into token sequences.
    """

    def __init__(
        self,
        split_csv_path: Union[str, Path],
        config: Optional[TTSConfig] = None,
        vocab: Optional[MultilingualVocabulary] = None,
        mel_extractor: Optional[MelSpectrogramExtractor] = None
    ):
        super().__init__()
        self.config = config or TTSConfig()
        self.split_csv_path = Path(split_csv_path)

        if not self.split_csv_path.exists():
            raise FileNotFoundError(f"Split CSV not found: {self.split_csv_path}")

        self.df = pd.read_csv(self.split_csv_path, encoding="utf-8")

        # Setup Vocabulary
        if vocab is not None:
            self.vocab = vocab
        else:
            self.vocab = MultilingualVocabulary(self.config.text)
            if self.config.data.vocab_file.exists():
                self.vocab.load(self.config.data.vocab_file)
            else:
                train_csv = self.config.data.splits_dir / "train.csv"
                self.vocab.build_from_train_csv(train_csv, save_path=self.config.data.vocab_file)

        # Setup Mel Extractor
        self.mel_extractor = mel_extractor or MelSpectrogramExtractor(self.config.audio)

        # Language mapping & preprocessed directories
        self.lang_map = self.config.language.language_map
        self.lang_dir_map = self.config.language.language_dir_map
        self.preprocessed_dir = self.config.data.preprocessed_dir

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        row = self.df.iloc[idx]

        lang_code = str(row["language"]).strip()
        lang_id = self.lang_map[lang_code]
        lang_dir_name = self.lang_dir_map[lang_code]

        audio_file = str(row["audio_file"]).strip()
        audio_path = self.preprocessed_dir / lang_dir_name / "wavs" / audio_file
        if not audio_path.exists():
            aug_path = self.config.data.data_root / "gan_augmented_full" / lang_dir_name / "wavs" / audio_file
            if aug_path.exists():
                audio_path = aug_path

        # 1. Lazy Audio Load & Sample Rate Check
        waveform, sr = load_audio(audio_path, target_sr=self.config.audio.sample_rate)

        # 2. Extract Log-Mel Spectrogram (Shape: [n_mels, T_frames])
        with torch.no_grad():
            mel = self.mel_extractor(waveform)

        # 3. Tokenize Text
        text_raw = str(row["text"])
        text_seq = self.vocab.text_to_sequence(
            text_raw,
            add_bos=self.config.text.add_bos,
            add_eos=self.config.text.add_eos
        )
        text_tensor = torch.tensor(text_seq, dtype=torch.long)

        return {
            "text_ids": text_tensor,
            "text_length": text_tensor.size(0),
            "mel": mel,
            "mel_length": mel.size(1),
            "language_id": torch.tensor(lang_id, dtype=torch.long),
            "audio_file": audio_file,
            "text": text_raw,
            "speaker": str(row.get("speaker", "unknown"))
        }


class TTSCollateFn:
    """
    Collate function to pad variable-length text sequences and mel spectrograms.
    """

    def __init__(self, pad_token_id: int = 0, mel_pad_val: float = -11.5129):
        # mel_pad_val is ln(1e-5) approx -11.5129 corresponding to clamp floor
        self.pad_token_id = pad_token_id
        self.mel_pad_val = mel_pad_val

    def __call__(self, batch: List[Dict[str, Any]]) -> Dict[str, Any]:
        batch_size = len(batch)

        # Extract text lengths and mel lengths
        text_lengths = torch.tensor([item["text_length"] for item in batch], dtype=torch.long)
        mel_lengths = torch.tensor([item["mel_length"] for item in batch], dtype=torch.long)
        language_ids = torch.tensor([item["language_id"] for item in batch], dtype=torch.long)

        max_text_len = int(torch.max(text_lengths).item())
        max_mel_len = int(torch.max(mel_lengths).item())
        n_mels = batch[0]["mel"].size(0)

        # Allocate padded tensors
        text_padded = torch.full(
            (batch_size, max_text_len),
            fill_value=self.pad_token_id,
            dtype=torch.long
        )
        mel_padded = torch.full(
            (batch_size, n_mels, max_mel_len),
            fill_value=self.mel_pad_val,
            dtype=torch.float32
        )

        audio_files = []
        raw_texts = []
        speakers = []

        for i, item in enumerate(batch):
            cur_text_len = item["text_length"]
            cur_mel_len = item["mel_length"]

            text_padded[i, :cur_text_len] = item["text_ids"]
            mel_padded[i, :, :cur_mel_len] = item["mel"]

            audio_files.append(item["audio_file"])
            raw_texts.append(item["text"])
            speakers.append(item["speaker"])

        return {
            "text_padded": text_padded,
            "text_lengths": text_lengths,
            "mel_padded": mel_padded,
            "mel_lengths": mel_lengths,
            "language_ids": language_ids,
            "audio_files": audio_files,
            "texts": raw_texts,
            "speakers": speakers
        }


def create_tts_dataloader(
    dataset,
    batch_size: Optional[int] = None,
    shuffle: bool = True,
    num_workers: Optional[int] = None,
    pin_memory: Optional[bool] = None,
    drop_last: Optional[bool] = None
) -> DataLoader:
    """
    Creates a DataLoader for MultilingualTTSDataset or a torch.utils.data.Subset.
    """

    # Support both the original dataset and torch.utils.data.Subset
    if hasattr(dataset, "config"):
        config = dataset.config
    elif hasattr(dataset, "dataset") and hasattr(dataset.dataset, "config"):
        config = dataset.dataset.config
    else:
        raise AttributeError(
            "Dataset must provide a TTSConfig through '.config' "
            "or be a Subset wrapping a dataset with '.config'."
        )

    bs = batch_size if batch_size is not None else config.data.batch_size
    nw = num_workers if num_workers is not None else config.data.num_workers
    pin = pin_memory if pin_memory is not None else config.data.pin_memory
    dl = drop_last if drop_last is not None else config.data.drop_last

    collate_fn = TTSCollateFn(
        pad_token_id=config.text.pad_id,
        mel_pad_val=float(
            torch.log(
                torch.tensor(config.audio.clamp_min)
            ).item()
        )
    )

    return DataLoader(
        dataset,
        batch_size=bs,
        shuffle=shuffle,
        num_workers=nw,
        pin_memory=pin,
        drop_last=dl,
        collate_fn=collate_fn
    )
"""
Gyan Multilingual TTS — Configuration Module

Defines all audio, text, language, data loader,
and training configurations.
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict


# ============================================================
# Model Configuration
# ============================================================

@dataclass
class ModelConfig:
    """Configuration for the multilingual acoustic TTS model."""

    # Vocabulary is filled from the actual saved vocabulary.
    vocab_size: int = 195

    # Model dimensions
    embedding_dim: int = 192
    hidden_dim: int = 192
    num_languages: int = 3
    language_embedding_dim: int = 32

    # Encoder
    encoder_layers: int = 3
    encoder_heads: int = 4

    # Decoder
    decoder_layers: int = 3
    decoder_heads: int = 4

    # Output
    n_mels: int = 80

    # Regularization
    dropout: float = 0.1

    # Decoder behavior
    max_mel_frames: int = 3200


# ============================================================
# Audio Configuration
# ============================================================

@dataclass
class AudioConfig:
    """Audio and Mel-Spectrogram feature extraction configuration."""

    sample_rate: int = 22050
    n_fft: int = 1024
    hop_length: int = 256
    win_length: int = 1024
    n_mels: int = 80
    f_min: float = 0.0
    f_max: float = 8000.0
    mel_power: float = 1.0
    clamp_min: float = 1e-5
    target_peak_db: float = -3.0


# ============================================================
# Text Configuration
# ============================================================

@dataclass
class TextConfig:
    """Text tokenization and vocabulary configuration."""

    pad_token: str = "<pad>"
    unk_token: str = "<unk>"
    bos_token: str = "<bos>"
    eos_token: str = "<eos>"

    pad_id: int = 0
    unk_id: int = 1
    bos_id: int = 2
    eos_id: int = 3

    add_bos: bool = True
    add_eos: bool = True


# ============================================================
# Language Configuration
# ============================================================

@dataclass
class LanguageConfig:
    """Multilingual mapping and directory routing configuration."""

    language_map: Dict[str, int] = field(
        default_factory=lambda: {
            "en": 0,
            "hi": 1,
            "mr": 2,
        }
    )

    id_to_language: Dict[int, str] = field(
        default_factory=lambda: {
            0: "en",
            1: "hi",
            2: "mr",
        }
    )

    language_dir_map: Dict[str, str] = field(
        default_factory=lambda: {
            "en": "english",
            "hi": "hindi",
            "mr": "marathi",
        }
    )


# ============================================================
# Data Configuration
# ============================================================

@dataclass
class DataConfig:
    """Dataset paths and DataLoader runtime configuration."""

    data_root: Path = field(
        default_factory=lambda: Path(
            "D:/Gyan/data"
        )
    )

    splits_dir: Path = field(
        default_factory=lambda: Path(
            "D:/Gyan/data/splits"
        )
    )

    preprocessed_dir: Path = field(
        default_factory=lambda: Path(
            "D:/Gyan/data/preprocessed"
        )
    )

    vocab_file: Path = field(
        default_factory=lambda: Path(
            "D:/Gyan/data/vocab.json"
        )
    )

    # Conservative starting batch size
    # for RTX 2050 (4 GB VRAM)
    batch_size: int = 4

    # Start with 0 for Windows stability.
    # Can increase later after testing.
    num_workers: int = 0

    # Enable when CUDA training is confirmed stable.
    pin_memory: bool = True

    drop_last: bool = False


# ============================================================
# Training Configuration
# ============================================================

@dataclass
class TrainingConfig:
    """
    Training runtime configuration.

    Includes:
    - Optimizer settings
    - Gradient accumulation
    - Mixed precision
    - Checkpointing
    - Resume support
    - Early stopping
    """

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    learning_rate: float = 1e-3
    weight_decay: float = 1e-6

    # --------------------------------------------------------
    # Training Duration
    # --------------------------------------------------------

    num_epochs: int = 20

    # --------------------------------------------------------
    # Gradient Handling
    # --------------------------------------------------------

    gradient_clip_norm: float = 1.0

    # With batch_size=4 and accumulation_steps=4,
    # effective batch size is approximately 16.
    gradient_accumulation_steps: int = 4

    # --------------------------------------------------------
    # Mixed Precision
    # --------------------------------------------------------

    use_amp: bool = True

    # --------------------------------------------------------
    # Checkpointing
    # --------------------------------------------------------

    checkpoint_dir: Path = field(
        default_factory=lambda: Path(
            "D:/Gyan/checkpoints"
        )
    )

    # Save epoch checkpoint every N epochs.
    save_every_epochs: int = 1

    # Automatically resume from
    # latest_checkpoint.pt when available.
    auto_resume: bool = True

    # --------------------------------------------------------
    # Early Stopping
    # --------------------------------------------------------

    early_stopping_patience: int = 10

    # Minimum validation-loss improvement
    # required to reset patience.
    early_stopping_min_delta: float = 1e-4


# ============================================================
# Master Configuration
# ============================================================

@dataclass
class TTSConfig:
    """Master configuration aggregating all sub-configurations."""

    audio: AudioConfig = field(
        default_factory=AudioConfig
    )

    text: TextConfig = field(
        default_factory=TextConfig
    )

    language: LanguageConfig = field(
        default_factory=LanguageConfig
    )

    data: DataConfig = field(
        default_factory=DataConfig
    )

    model: ModelConfig = field(
        default_factory=ModelConfig
    )

    training: TrainingConfig = field(
        default_factory=TrainingConfig
    )
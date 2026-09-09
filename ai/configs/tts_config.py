"""
Gyan Multilingual TTS — Configuration Module
Defines all audio, text, language, model, GAN, and data loader configurations.
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Tuple


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


@dataclass
class LanguageConfig:
    """Multilingual mapping and directory routing configuration."""
    num_languages: int = 3
    language_map: Dict[str, int] = field(
        default_factory=lambda: {"en": 0, "hi": 1, "mr": 2}
    )
    id_to_language: Dict[int, str] = field(
        default_factory=lambda: {0: "en", 1: "hi", 2: "mr"}
    )
    language_dir_map: Dict[str, str] = field(
        default_factory=lambda: {"en": "english", "hi": "hindi", "mr": "marathi"}
    )


@dataclass
class ModelConfig:
    """Multilingual non-autoregressive TTS Model Configuration."""
    vocab_size: int = 195
    num_languages: int = 3
    embedding_dim: int = 256
    language_embedding_dim: int = 64
    hidden_dim: int = 256
    encoder_layers: int = 4
    encoder_heads: int = 4
    encoder_kernel_size: int = 5
    decoder_layers: int = 4
    decoder_heads: int = 4
    decoder_kernel_size: int = 5
    max_mel_frames: int = 2048
    postnet_layers: int = 5
    postnet_channels: int = 256
    postnet_kernel_size: int = 5
    n_mels: int = 80
    dropout: float = 0.1


@dataclass
class GANConfig:
    """Configuration for Conditional Residual Mel GAN Augmentation."""
    noise_dim: int = 64
    mel_frames: int = 256
    residual_alpha: float = 0.3
    generator_base_channels: int = 64
    discriminator_base_channels: int = 64
    language_embedding_dim: int = 16
    batch_size: int = 4
    learning_rate: float = 2e-4
    betas: Tuple[float, float] = (0.5, 0.999)
    lambda_content: float = 10.0
    lambda_spectral: float = 5.0
    max_batches_per_epoch: int = 200
    num_epochs: int = 5
    seed: int = 42
    checkpoint_dir: Path = field(
        default_factory=lambda: Path("D:/Gyan/checkpoints/gan")
    )


@dataclass
class DataConfig:
    """Dataset paths and DataLoader runtime configuration."""
    data_root: Path = field(default_factory=lambda: Path("D:/Gyan/data"))
    splits_dir: Path = field(default_factory=lambda: Path("D:/Gyan/data/splits"))
    preprocessed_dir: Path = field(default_factory=lambda: Path("D:/Gyan/data/preprocessed"))
    vocab_file: Path = field(default_factory=lambda: Path("D:/Gyan/data/vocab.json"))
    batch_size: int = 16
    num_workers: int = 0
    pin_memory: bool = False
    drop_last: bool = False


@dataclass
class TTSConfig:
    """Master configuration aggregating all sub-configurations for Gyan TTS."""
    audio: AudioConfig = field(default_factory=AudioConfig)
    text: TextConfig = field(default_factory=TextConfig)
    language: LanguageConfig = field(default_factory=LanguageConfig)
    model: ModelConfig = field(default_factory=ModelConfig)
    gan: GANConfig = field(default_factory=GANConfig)
    data: DataConfig = field(default_factory=DataConfig)

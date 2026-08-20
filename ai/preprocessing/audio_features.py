"""
Gyan Multilingual TTS — Audio Features Module
Extracts log-mel spectrograms from audio waveforms.
"""

from pathlib import Path
from typing import Tuple, Union, Optional
import numpy as np
import soundfile as sf
import torch
import torch.nn as nn
import torchaudio.transforms as T

from ai.configs.tts_config import AudioConfig


def load_audio(
    file_path: Union[str, Path],
    target_sr: int = 22050
) -> Tuple[torch.Tensor, int]:
    """
    Loads a WAV audio file, verifies sample rate, ensures mono,
    and returns a float32 PyTorch tensor.

    Args:
        file_path: Path to the audio file.
        target_sr: Expected sample rate.

    Returns:
        Tuple of (waveform tensor of shape [num_samples], sample_rate).

    Raises:
        FileNotFoundError: If audio file does not exist.
        ValueError: If sample rate does not match target_sr or file is empty.
    """
    p = Path(file_path)
    if not p.exists():
        raise FileNotFoundError(f"Audio file not found: {p}")

    waveform, sr = sf.read(p, dtype="float32")

    if sr != target_sr:
        raise ValueError(
            f"Sample rate mismatch for {p.name}: expected {target_sr} Hz, got {sr} Hz"
        )

    if waveform.size == 0:
        raise ValueError(f"Empty audio file: {p.name}")

    # Convert multi-channel to mono
    if waveform.ndim == 2:
        waveform = np.mean(waveform, axis=0)

    tensor_wave = torch.from_numpy(waveform.astype(np.float32))

    # Check for NaN / Inf
    if torch.isnan(tensor_wave).any() or torch.isinf(tensor_wave).any():
        raise ValueError(f"Corrupted audio containing NaN/Inf: {p.name}")

    return tensor_wave, sr


class MelSpectrogramExtractor(nn.Module):
    """
    Computes log-mel spectrograms using PyTorch/Torchaudio.
    
    Transforms 1D waveform [T] -> Log-Mel Spectrogram [n_mels, T_frames].
    """

    def __init__(self, config: Optional[AudioConfig] = None):
        super().__init__()
        self.config = config or AudioConfig()

        self.mel_transform = T.MelSpectrogram(
            sample_rate=self.config.sample_rate,
            n_fft=self.config.n_fft,
            win_length=self.config.win_length,
            hop_length=self.config.hop_length,
            f_min=self.config.f_min,
            f_max=self.config.f_max,
            n_mels=self.config.n_mels,
            power=self.config.mel_power,
            center=True,
            pad_mode="reflect",
            norm="slaney",
            mel_scale="slaney"
        )

    def forward(self, waveform: torch.Tensor) -> torch.Tensor:
        """
        Converts a 1D or 2D waveform into a log-mel spectrogram.

        Args:
            waveform: Tensor of shape [time] or [batch, time].

        Returns:
            Log-mel spectrogram tensor of shape [n_mels, frames] or [batch, n_mels, frames].
        """
        if waveform.dim() == 1:
            # Shape: [1, time]
            waveform = waveform.unsqueeze(0)
            squeeze_output = True
        else:
            squeeze_output = False

        # Compute Mel Spectrogram (Linear power/magnitude)
        mel_spec = self.mel_transform(waveform)

        # Dynamic range compression: natural log with clamp floor
        log_mel_spec = torch.log(torch.clamp(mel_spec, min=self.config.clamp_min))

        if squeeze_output:
            log_mel_spec = log_mel_spec.squeeze(0)

        # Verify no NaN or Inf
        if torch.isnan(log_mel_spec).any() or torch.isinf(log_mel_spec).any():
            raise ValueError("Log-Mel Spectrogram computation produced NaN or Inf values")

        return log_mel_spec

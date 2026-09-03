"""
Gyan Multilingual TTS — Mel to Audio

Converts Gyan log-mel spectrograms into waveform audio using:

    Log-Mel Spectrogram
            ↓
        exp()
            ↓
    Inverse Mel Scale
            ↓
       Griffin-Lim
            ↓
        Waveform
            ↓
          WAV

This is a baseline vocoder-free reconstruction method for demo purposes.
"""

from pathlib import Path
from typing import Optional, Union

import soundfile as sf
import torch
import torchaudio.transforms as T

from ai.configs.tts_config import AudioConfig


class MelToAudio:
    """
    Converts Gyan log-mel spectrograms back into waveform audio.

    Expected mel representation:

    - sample_rate = 22050
    - n_fft = 1024
    - win_length = 1024
    - hop_length = 256
    - n_mels = 80
    - f_min = 0
    - f_max = 8000
    - power = 1.0
    - norm = "slaney"
    - mel_scale = "slaney"
    - natural logarithm compression
    """

    def __init__(
        self,
        config: Optional[AudioConfig] = None,
        device: Optional[torch.device] = None,
    ):
        """
        Initialize inverse mel and Griffin-Lim transforms.
        """

        self.config = config or AudioConfig()

        if device is not None:
            self.device = device
        else:
            self.device = torch.device(
                "cuda"
                if torch.cuda.is_available()
                else "cpu"
            )

        # Number of frequency bins in STFT
        n_stft = (self.config.n_fft // 2) + 1

        # --------------------------------------------------
        # Inverse Mel Scale
        # --------------------------------------------------

        self.inverse_mel = T.InverseMelScale(
            n_stft=n_stft,
            n_mels=self.config.n_mels,
            sample_rate=self.config.sample_rate,
            f_min=self.config.f_min,
            f_max=self.config.f_max,
            norm="slaney",
            mel_scale="slaney",
        ).to(self.device)

        # --------------------------------------------------
        # Griffin-Lim
        # --------------------------------------------------

        self.griffin_lim = T.GriffinLim(
            n_fft=self.config.n_fft,
            n_iter=64,
            win_length=self.config.win_length,
            hop_length=self.config.hop_length,
            power=self.config.mel_power,
        ).to(self.device)

    @torch.no_grad()
    def mel_to_waveform(
        self,
        log_mel: torch.Tensor,
    ) -> torch.Tensor:
        """
        Convert a log-mel spectrogram into waveform audio.

        Args:
            log_mel:
                Tensor with shape:

                [n_mels, frames]

                OR

                [1, n_mels, frames]

        Returns:
            waveform:
                Tensor with shape [samples].
        """

        # --------------------------------------------------
        # Handle batch dimension
        # --------------------------------------------------

        if log_mel.dim() == 3:

            if log_mel.size(0) != 1:
                raise ValueError(
                    "mel_to_waveform expects a single "
                    "mel spectrogram with batch size 1."
                )

            log_mel = log_mel.squeeze(0)

        # --------------------------------------------------
        # Validate dimensions
        # --------------------------------------------------

        if log_mel.dim() != 2:
            raise ValueError(
                "Expected log_mel with shape "
                "[n_mels, frames]. "
                f"Got shape: {tuple(log_mel.shape)}"
            )

        if log_mel.size(0) != self.config.n_mels:
            raise ValueError(
                f"Expected {self.config.n_mels} mel channels, "
                f"but got {log_mel.size(0)}."
            )

        # --------------------------------------------------
        # Move to correct device
        # --------------------------------------------------

        log_mel = log_mel.to(
            self.device,
            dtype=torch.float32,
        )

        # --------------------------------------------------
        # Check numerical validity
        # --------------------------------------------------

        if torch.isnan(log_mel).any():
            raise ValueError(
                "Input log-mel contains NaN values."
            )

        if torch.isinf(log_mel).any():
            raise ValueError(
                "Input log-mel contains Inf values."
            )

        # --------------------------------------------------
        # Reverse log compression
        #
        # Original preprocessing:
        #
        # log_mel = log(clamp(mel, min=clamp_min))
        #
        # Therefore:
        #
        # mel = exp(log_mel)
        # --------------------------------------------------

        mel = torch.exp(log_mel)

        mel = torch.clamp(
            mel,
            min=self.config.clamp_min,
        )

        # --------------------------------------------------
        # Convert mel -> linear-frequency spectrogram
        # --------------------------------------------------

        linear_spec = self.inverse_mel(
            mel
        )

        # InverseMelScale may produce tiny negative values.
        linear_spec = torch.clamp(
            linear_spec,
            min=0.0,
        )

        # --------------------------------------------------
        # Griffin-Lim reconstruction
        # --------------------------------------------------

        waveform = self.griffin_lim(
            linear_spec
        )

        # --------------------------------------------------
        # Validate waveform
        # --------------------------------------------------

        if torch.isnan(waveform).any():
            raise ValueError(
                "Waveform reconstruction produced NaN values."
            )

        if torch.isinf(waveform).any():
            raise ValueError(
                "Waveform reconstruction produced Inf values."
            )

        # --------------------------------------------------
        # Normalize audio safely
        # --------------------------------------------------

        peak = waveform.abs().max()

        if peak.item() > 0:
            waveform = (
                waveform / peak * 0.95
            )

        # Return CPU tensor
        return waveform.detach().cpu()

    def save_wav(
        self,
        waveform: torch.Tensor,
        output_path: Union[str, Path],
    ) -> Path:
        """
        Save waveform as a WAV file.

        Args:
            waveform:
                Tensor with shape [samples].

            output_path:
                Destination WAV file.

        Returns:
            Path to saved WAV file.
        """

        output_path = Path(output_path)

        # Create output directory
        output_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        # Ensure CPU
        waveform = waveform.detach().cpu()

        # Remove unnecessary dimensions
        waveform = waveform.squeeze()

        if waveform.dim() != 1:
            raise ValueError(
                "Waveform must have shape [samples]. "
                f"Got shape: {tuple(waveform.shape)}"
            )

        # Convert to NumPy
        waveform_np = waveform.numpy()

        # Save audio
        sf.write(
            str(output_path),
            waveform_np,
            self.config.sample_rate,
        )

        print(
            f"Audio saved: {output_path}"
        )

        return output_path

    @torch.no_grad()
    def convert_and_save(
        self,
        log_mel: torch.Tensor,
        output_path: Union[str, Path],
    ) -> Path:
        """
        Complete conversion pipeline:

            log-mel
                ↓
            waveform
                ↓
             WAV file

        Args:
            log_mel:
                Log-mel spectrogram.

            output_path:
                Path where WAV should be saved.

        Returns:
            Path to generated WAV file.
        """

        waveform = self.mel_to_waveform(
            log_mel
        )

        return self.save_wav(
            waveform,
            output_path,
        )
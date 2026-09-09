"""
Gyan Multilingual TTS — HiFi-GAN Neural Vocoder Wrapper.

Converts Gyan 80-bin natural log-mel spectrograms into high-fidelity WAV audio.
"""

import json
from pathlib import Path
from typing import Optional, Union
import soundfile as sf
import torch

from ai.models.hifigan import HiFiGANConfig, HiFiGANGenerator


DEFAULT_CHECKPOINT_DIR = Path("D:/Gyan/checkpoints/vocoder/hifigan_universal_v1")
DEFAULT_REPO_ID = "csdc-atl/hifigan-universal_v1"


class HiFiGANVocoder:
    """
    Production Neural Vocoder inference wrapper for HiFi-GAN Universal V1.
    """

    def __init__(
        self,
        checkpoint_path: Optional[Union[str, Path]] = None,
        config_path: Optional[Union[str, Path]] = None,
        device: Optional[torch.device] = None,
    ):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # 1. Resolve or Download Checkpoint & Config
        ckpt_path, cfg_path = self._resolve_model_files(checkpoint_path, config_path)

        # 2. Load Configuration
        with open(cfg_path, "r", encoding="utf-8") as f:
            cfg_dict = json.load(f)

        self.config = HiFiGANConfig(
            resblock=cfg_dict.get("resblock", "1"),
            upsample_rates=cfg_dict.get("upsample_rates", [8, 8, 2, 2]),
            upsample_kernel_sizes=cfg_dict.get("upsample_kernel_sizes", [16, 16, 4, 4]),
            upsample_initial_channel=cfg_dict.get("upsample_initial_channel", 512),
            resblock_kernel_sizes=cfg_dict.get("resblock_kernel_sizes", [3, 7, 11]),
            resblock_dilation_sizes=cfg_dict.get("resblock_dilation_sizes", [[1, 3, 5], [1, 3, 5], [1, 3, 5]]),
            num_mels=cfg_dict.get("num_mels", 80),
            sampling_rate=cfg_dict.get("sampling_rate", 22050),
            n_fft=cfg_dict.get("n_fft", 1024),
            hop_size=cfg_dict.get("hop_size", 256),
            win_size=cfg_dict.get("win_size", 1024),
            fmin=cfg_dict.get("fmin", 0.0),
            fmax=cfg_dict.get("fmax", 8000.0),
        )

        # 3. Instantiate Generator & Load State Dict
        self.model = HiFiGANGenerator(self.config).to(self.device)

        print(f"Loading HiFi-GAN checkpoint: {ckpt_path}")
        checkpoint = torch.load(ckpt_path, map_location=self.device, weights_only=False)
        state_dict = checkpoint.get("generator", checkpoint)
        self.model.load_state_dict(state_dict)

        # 4. Remove Weight Norm for fast evaluation
        self.model.eval()
        self.model.remove_weight_norm()
        print(f"HiFi-GAN Vocoder ready on device: {self.device}")

    def _resolve_model_files(
        self,
        checkpoint_path: Optional[Union[str, Path]],
        config_path: Optional[Union[str, Path]],
    ) -> tuple[Path, Path]:
        """Ensures checkpoint and config exist, downloading from HF Hub if needed."""
        ckpt_p = Path(checkpoint_path) if checkpoint_path else DEFAULT_CHECKPOINT_DIR / "g_02500000"
        cfg_p = Path(config_path) if config_path else DEFAULT_CHECKPOINT_DIR / "config.json"

        if not ckpt_p.exists() or not cfg_p.exists():
            print(f"Vocoder files not found locally in {DEFAULT_CHECKPOINT_DIR}. Downloading from HF Hub ({DEFAULT_REPO_ID})...")
            DEFAULT_CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
            from huggingface_hub import hf_hub_download
            downloaded_ckpt = hf_hub_download(repo_id=DEFAULT_REPO_ID, filename="g_02500000", local_dir=DEFAULT_CHECKPOINT_DIR)
            downloaded_cfg = hf_hub_download(repo_id=DEFAULT_REPO_ID, filename="config.json", local_dir=DEFAULT_CHECKPOINT_DIR)
            ckpt_p = Path(downloaded_ckpt)
            cfg_p = Path(downloaded_cfg)

        return ckpt_p, cfg_p

    @torch.no_grad()
    def mel_to_waveform(self, log_mel: torch.Tensor) -> torch.Tensor:
        """
        Converts a natural log-mel spectrogram into high-fidelity audio waveform.

        Args:
            log_mel: Tensor of shape [80, T] or [1, 80, T] or [B, 80, T].

        Returns:
            waveform: Float32 tensor of shape [samples] (or [B, samples] if B > 1).
        """
        squeeze_batch = False
        if log_mel.dim() == 2:
            log_mel = log_mel.unsqueeze(0)  # [1, 80, T]
            squeeze_batch = True
        elif log_mel.dim() == 3 and log_mel.size(0) == 1:
            squeeze_batch = True

        if log_mel.size(1) != self.config.num_mels:
            raise ValueError(f"Expected {self.config.num_mels} mel channels, got {log_mel.size(1)}")

        if torch.isnan(log_mel).any() or torch.isinf(log_mel).any():
            raise ValueError("Input log-mel contains NaN or Inf values")

        log_mel = log_mel.to(self.device, dtype=torch.float32)

        # Forward pass through HiFi-GAN generator
        waveform = self.model(log_mel)  # [B, 1, samples]

        # Clamp and move to CPU
        waveform = torch.clamp(waveform, min=-1.0, max=1.0)
        waveform = waveform.squeeze(1).cpu()  # [B, samples]

        if squeeze_batch:
            waveform = waveform.squeeze(0)  # [samples]

        return waveform

    def save_wav(
        self,
        waveform: torch.Tensor,
        output_path: Union[str, Path],
        sample_rate: Optional[int] = None,
    ) -> Path:
        """Saves waveform tensor as a 16-bit PCM WAV file."""
        sr = sample_rate or self.config.sampling_rate
        out_p = Path(output_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)

        wf_np = waveform.detach().cpu().squeeze().numpy()
        sf.write(str(out_p), wf_np, sr, subtype="PCM_16")
        return out_p

    @torch.no_grad()
    def convert_and_save(
        self,
        log_mel: torch.Tensor,
        output_path: Union[str, Path],
    ) -> Path:
        """End-to-end conversion: log-mel -> waveform -> WAV file."""
        waveform = self.mel_to_waveform(log_mel)
        return self.save_wav(waveform, output_path)

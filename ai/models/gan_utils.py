"""
Gyan TTS GAN — Utilities Module
Provides centralized normalization, cropping, and spectral loss calculations.
"""

from typing import Tuple
import torch
import torch.nn.functional as F

MEL_MIN = -11.512925148010254  # ln(1e-5)
MEL_MAX = 1.0


def normalize_mel(mel: torch.Tensor) -> torch.Tensor:
    """
    Normalizes log-mel spectrogram from [MEL_MIN, MEL_MAX] to approximately [-1.0, 1.0].
    """
    clamped = torch.clamp(mel, min=MEL_MIN, max=MEL_MAX)
    return 2.0 * (clamped - MEL_MIN) / (MEL_MAX - MEL_MIN) - 1.0


def denormalize_mel(mel_normalized: torch.Tensor) -> torch.Tensor:
    """
    Converts normalized spectrogram [-1.0, 1.0] back to natural log-mel scale [MEL_MIN, MEL_MAX].
    """
    return ((mel_normalized + 1.0) / 2.0) * (MEL_MAX - MEL_MIN) + MEL_MIN


def compute_spectral_gradient_loss(
    pred_mel: torch.Tensor,
    target_mel: torch.Tensor
) -> torch.Tensor:
    """
    Calculates L1 loss between the first-order temporal and frequency gradients
    of predicted and target mel spectrograms.
    
    Args:
        pred_mel: [B, 1, n_mels, T] or [B, n_mels, T]
        target_mel: [B, 1, n_mels, T] or [B, n_mels, T]
        
    Returns:
        Scalar spectral gradient consistency loss.
    """
    # Temporal differences (along time axis)
    dt_pred = pred_mel[..., 1:] - pred_mel[..., :-1]
    dt_target = target_mel[..., 1:] - target_mel[..., :-1]
    loss_dt = F.l1_loss(dt_pred, dt_target)

    # Frequency differences (along mel frequency axis)
    df_pred = pred_mel[..., 1:, :] - pred_mel[..., :-1, :]
    df_target = target_mel[..., 1:, :] - target_mel[..., :-1, :]
    loss_df = F.l1_loss(df_pred, df_target)

    return loss_dt + loss_df


def random_mel_crop(
    mel_batch: torch.Tensor,
    mel_lengths: torch.Tensor,
    target_frames: int = 256,
    pad_value: float = -11.5129
) -> torch.Tensor:
    """
    Extracts a fixed-size crop from each mel spectrogram in the batch.
    Pads shorter utterances with pad_value.

    Args:
        mel_batch: Tensor [B, n_mels, T]
        mel_lengths: Valid mel lengths [B]
        target_frames: Required frame count
        pad_value: Constant pad value for short audio

    Returns:
        Tensor [B, 1, n_mels, target_frames]
    """
    batch_size, n_mels, _ = mel_batch.shape
    crops = []

    for i in range(batch_size):
        valid_frames = int(mel_lengths[i].item())

        if valid_frames < target_frames:
            pad_amount = target_frames - valid_frames
            sample = mel_batch[i, :, :valid_frames]
            sample = F.pad(sample, (0, pad_amount), mode="constant", value=pad_value)
        else:
            max_start = valid_frames - target_frames
            start = torch.randint(0, max_start + 1, (1,)).item() if max_start > 0 else 0
            sample = mel_batch[i, :, start : start + target_frames]

        crops.append(sample)

    crops = torch.stack(crops, dim=0)
    return crops.unsqueeze(1)

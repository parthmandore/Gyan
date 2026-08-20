"""
Gyan Multilingual TTS — Loss Functions

Masked mel-spectrogram losses for variable-length TTS batches.
"""

import torch
import torch.nn.functional as F


def create_mel_mask(
    mel_lengths: torch.Tensor,
    max_mel_length: int | None = None,
) -> torch.Tensor:
    """
    Creates a boolean mask for valid mel frames.

    Args:
        mel_lengths: [B]
        max_mel_length: Maximum mel length in the batch.

    Returns:
        mask: [B, 1, T]
              True for valid frames.
              False for padded frames.
    """

    if max_mel_length is None:
        max_mel_length = int(mel_lengths.max().item())

    positions = torch.arange(
        max_mel_length,
        device=mel_lengths.device,
    ).unsqueeze(0)

    mask = positions < mel_lengths.unsqueeze(1)

    return mask.unsqueeze(1)


def masked_l1_loss(
    prediction: torch.Tensor,
    target: torch.Tensor,
    mel_lengths: torch.Tensor,
) -> torch.Tensor:
    """
    Computes L1 loss only over valid mel frames.

    Args:
        prediction: [B, n_mels, T]
        target:     [B, n_mels, T]
        mel_lengths:[B]

    Returns:
        Scalar masked L1 loss.
    """

    if prediction.shape != target.shape:
        raise ValueError(
            f"Prediction shape {prediction.shape} does not match "
            f"target shape {target.shape}"
        )

    mask = create_mel_mask(
        mel_lengths,
        max_mel_length=prediction.size(2),
    )

    # Expand from [B, 1, T] to [B, n_mels, T]
    mask = mask.expand_as(prediction)

    loss = torch.abs(prediction - target)

    loss = loss * mask

    valid_elements = mask.sum().clamp(min=1)

    return loss.sum() / valid_elements


def multilingual_tts_loss(
    coarse_mel: torch.Tensor,
    refined_mel: torch.Tensor,
    target_mel: torch.Tensor,
    mel_lengths: torch.Tensor,
) -> dict:
    """
    Computes total acoustic model loss.

    Total Loss =
        coarse L1 loss + refined L1 loss
    """

    coarse_loss = masked_l1_loss(
        coarse_mel,
        target_mel,
        mel_lengths,
    )

    refined_loss = masked_l1_loss(
        refined_mel,
        target_mel,
        mel_lengths,
    )

    total_loss = coarse_loss + refined_loss

    return {
        "total_loss": total_loss,
        "coarse_loss": coarse_loss,
        "refined_loss": refined_loss,
    }

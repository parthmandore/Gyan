"""
Gyan TTS GAN — Conditional Mel Spectrogram Discriminator.

Evaluates realism of mel-spectrogram patches conditioned on language identity.
"""

from typing import Tuple, Union
import torch
import torch.nn as nn


class MelDiscriminator(nn.Module):
    """
    Conditional discriminator for 80x256 mel-spectrogram patches.

    Input:
        mel: [B, 1, 80, 256]
        language_id: [B]

    Output:
        logits: [B, 1]
    """

    def __init__(
        self,
        num_languages: int = 3,
        language_embedding_dim: int = 16,
        base_channels: int = 64,
    ):
        super().__init__()

        self.language_embedding = nn.Embedding(
            num_languages,
            language_embedding_dim,
        )

        self.features = nn.Sequential(
            # Stage 1: [B, 1, 80, 256] -> [B, 64, 40, 128]
            nn.Conv2d(1, base_channels, kernel_size=4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),

            # Stage 2: [B, 64, 40, 128] -> [B, 128, 20, 64]
            nn.Conv2d(base_channels, base_channels * 2, kernel_size=4, stride=2, padding=1),
            nn.GroupNorm(8, base_channels * 2),
            nn.LeakyReLU(0.2, inplace=True),

            # Stage 3: [B, 128, 20, 64] -> [B, 256, 10, 32]
            nn.Conv2d(base_channels * 2, base_channels * 4, kernel_size=4, stride=2, padding=1),
            nn.GroupNorm(8, base_channels * 4),
            nn.LeakyReLU(0.2, inplace=True),

            # Stage 4: [B, 256, 10, 32] -> [B, 512, 5, 16]
            nn.Conv2d(base_channels * 4, base_channels * 8, kernel_size=4, stride=2, padding=1),
            nn.GroupNorm(8, base_channels * 8),
            nn.LeakyReLU(0.2, inplace=True),
        )

        feature_size = base_channels * 8 * 5 * 16

        self.classifier = nn.Sequential(
            nn.Linear(feature_size + language_embedding_dim, 256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(256, 1),
        )

    def forward(
        self,
        mel: torch.Tensor,
        language_id: torch.Tensor,
    ) -> torch.Tensor:
        if mel.dim() == 3:
            mel = mel.unsqueeze(1)

        feats = self.features(mel)
        feats_flat = feats.flatten(start_dim=1)

        lang_emb = self.language_embedding(language_id)
        combined = torch.cat([feats_flat, lang_emb], dim=1)

        return self.classifier(combined)

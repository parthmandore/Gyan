"""
Gyan TTS GAN — Conditional Residual Mel Spectrogram Generator.

Transforms a real mel-spectrogram patch into an augmented variation:
real_mel + noise + language_id -> augmented_mel
"""

from typing import Tuple, Union
import torch
import torch.nn as nn
import torch.nn.functional as F


class ResBlock2d(nn.Module):
    """2D Residual Convolutional Block with GroupNorm and GELU."""

    def __init__(self, channels: int, kernel_size: int = 3):
        super().__init__()
        padding = (kernel_size - 1) // 2
        num_groups = 8 if channels % 8 == 0 else 1
        self.conv1 = nn.Conv2d(channels, channels, kernel_size, padding=padding)
        self.norm1 = nn.GroupNorm(num_groups, channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size, padding=padding)
        self.norm2 = nn.GroupNorm(num_groups, channels)
        self.act = nn.GELU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        out = self.act(self.norm1(self.conv1(x)))
        out = self.norm2(self.conv2(out))
        return self.act(res + out)


class ResidualMelGenerator(nn.Module):
    """
    Conditional Residual Generator for Mel-Spectrogram Augmentation.

    Input:
        real_mel: [B, 1, 80, 256] in range [-1.0, 1.0]
        noise: [B, noise_dim]
        language_id: [B]

    Output:
        augmented_mel: [B, 1, 80, 256] in range [-1.0, 1.0]
    """

    def __init__(
        self,
        noise_dim: int = 64,
        num_languages: int = 3,
        language_embedding_dim: int = 16,
        base_channels: int = 64,
        residual_alpha: float = 0.3,
    ):
        super().__init__()
        self.noise_dim = noise_dim
        self.residual_alpha = residual_alpha

        # 1. Conditioning Embeddings
        self.language_embedding = nn.Embedding(num_languages, language_embedding_dim)
        cond_dim = 32
        self.cond_proj = nn.Sequential(
            nn.Linear(noise_dim + language_embedding_dim, cond_dim),
            nn.GELU(),
            nn.Linear(cond_dim, cond_dim),
        )

        # 2. Encoder
        in_channels = 1 + cond_dim
        self.enc_conv1 = nn.Sequential(
            nn.Conv2d(in_channels, base_channels, kernel_size=3, padding=1),
            nn.GroupNorm(8, base_channels),
            nn.GELU(),
        )  # [B, 64, 80, 256]

        self.down1 = nn.Sequential(
            nn.Conv2d(base_channels, base_channels * 2, kernel_size=4, stride=2, padding=1),
            nn.GroupNorm(8, base_channels * 2),
            nn.GELU(),
        )  # [B, 128, 40, 128]

        self.down2 = nn.Sequential(
            nn.Conv2d(base_channels * 2, base_channels * 4, kernel_size=4, stride=2, padding=1),
            nn.GroupNorm(8, base_channels * 4),
            nn.GELU(),
        )  # [B, 256, 20, 64]

        # 3. Bottleneck Residual Blocks
        self.bottleneck = nn.Sequential(
            ResBlock2d(base_channels * 4),
            ResBlock2d(base_channels * 4),
        )  # [B, 256, 20, 64]

        # 4. Decoder with Skip Connections
        self.up2 = nn.Sequential(
            nn.ConvTranspose2d(base_channels * 4, base_channels * 2, kernel_size=4, stride=2, padding=1),
            nn.GroupNorm(8, base_channels * 2),
            nn.GELU(),
        )  # [B, 128, 40, 128]

        self.dec_conv2 = nn.Sequential(
            nn.Conv2d(base_channels * 4, base_channels * 2, kernel_size=3, padding=1),
            nn.GroupNorm(8, base_channels * 2),
            nn.GELU(),
        )

        self.up1 = nn.Sequential(
            nn.ConvTranspose2d(base_channels * 2, base_channels, kernel_size=4, stride=2, padding=1),
            nn.GroupNorm(8, base_channels),
            nn.GELU(),
        )  # [B, 64, 80, 256]

        self.dec_conv1 = nn.Sequential(
            nn.Conv2d(base_channels * 2, base_channels, kernel_size=3, padding=1),
            nn.GroupNorm(8, base_channels),
            nn.GELU(),
        )

        # 5. Output Residual Projection
        self.out_conv = nn.Sequential(
            nn.Conv2d(base_channels, 1, kernel_size=3, padding=1),
            nn.Tanh(),
        )

    def forward(
        self,
        real_mel: torch.Tensor,
        noise: torch.Tensor,
        language_id: torch.Tensor,
        return_residual: bool = False,
    ) -> Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]]:
        """
        Forward pass for residual mel augmentation.

        Args:
            real_mel: [B, 1, 80, 256] or [B, 80, 256] in range [-1, 1]
            noise: [B, noise_dim]
            language_id: [B]
            return_residual: If True, returns (augmented_mel, residual)

        Returns:
            augmented_mel: [B, 1, 80, 256] in range [-1, 1]
        """
        if real_mel.dim() == 3:
            real_mel = real_mel.unsqueeze(1)

        B, _, H, W = real_mel.shape

        # 1. Conditioning Map
        lang_emb = self.language_embedding(language_id)
        cond = self.cond_proj(torch.cat([noise, lang_emb], dim=1))
        cond_map = cond.unsqueeze(-1).unsqueeze(-1).expand(B, -1, H, W)

        # 2. Encoder
        x_in = torch.cat([real_mel, cond_map], dim=1)
        e1 = self.enc_conv1(x_in)  # [B, 64, 80, 256]
        e2 = self.down1(e1)        # [B, 128, 40, 128]
        e3 = self.down2(e2)        # [B, 256, 20, 64]

        # 3. Bottleneck
        b = self.bottleneck(e3)    # [B, 256, 20, 64]

        # 4. Decoder with Skips
        d2 = self.up2(b)           # [B, 128, 40, 128]
        d2 = self.dec_conv2(torch.cat([d2, e2], dim=1))

        d1 = self.up1(d2)          # [B, 64, 80, 256]
        d1 = self.dec_conv1(torch.cat([d1, e1], dim=1))

        # 5. Residual Delta Calculation
        residual = self.out_conv(d1)  # [B, 1, 80, 256] bounded in [-1, 1]

        # 6. Residual Addition & Clamping
        augmented_mel = torch.clamp(
            real_mel + self.residual_alpha * residual,
            min=-1.0,
            max=1.0,
        )

        if return_residual:
            return augmented_mel, residual

        return augmented_mel


# Backward compatibility alias
MelGenerator = ResidualMelGenerator

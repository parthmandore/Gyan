"""
Gyan Multilingual TTS — HiFi-GAN Generator Architecture.

Standalone PyTorch implementation of official HiFi-GAN (Universal V1).
NeurIPS 2020: "HiFi-GAN: Generative Adversarial Networks for Efficient
and High Fidelity Speech Synthesis" (Kong et al.)
"""

from dataclasses import dataclass, field
from typing import List, Optional, Union
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.nn.utils import remove_weight_norm, weight_norm

LRELU_SLOPE = 0.1


@dataclass
class HiFiGANConfig:
    """HiFi-GAN V1 Architecture Configuration."""
    resblock: str = "1"
    upsample_rates: List[int] = field(default_factory=lambda: [8, 8, 2, 2])
    upsample_kernel_sizes: List[int] = field(default_factory=lambda: [16, 16, 4, 4])
    upsample_initial_channel: int = 512
    resblock_kernel_sizes: List[int] = field(default_factory=lambda: [3, 7, 11])
    resblock_dilation_sizes: List[List[int]] = field(
        default_factory=lambda: [[1, 3, 5], [1, 3, 5], [1, 3, 5]]
    )
    num_mels: int = 80
    sampling_rate: int = 22050
    n_fft: int = 1024
    hop_size: int = 256
    win_size: int = 1024
    fmin: float = 0.0
    fmax: float = 8000.0


def init_weights(m, mean=0.0, std=0.01):
    classname = m.__class__.__name__
    if classname.find("Conv") != -1:
        m.weight.data.normal_(mean, std)


def get_padding(kernel_size: int, dilation: int = 1) -> int:
    return int((kernel_size * dilation - dilation) / 2)


class ResBlock1(nn.Module):
    """Residual Block Type 1 with Multi-Receptive Field Dilation."""

    def __init__(self, channels: int, kernel_size: int = 3, dilation: List[int] = (1, 3, 5)):
        super().__init__()
        self.convs1 = nn.ModuleList([
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=dilation[0], padding=get_padding(kernel_size, dilation[0])
            )),
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=dilation[1], padding=get_padding(kernel_size, dilation[1])
            )),
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=dilation[2], padding=get_padding(kernel_size, dilation[2])
            )),
        ])
        self.convs1.apply(init_weights)

        self.convs2 = nn.ModuleList([
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=1, padding=get_padding(kernel_size, 1)
            )),
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=1, padding=get_padding(kernel_size, 1)
            )),
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=1, padding=get_padding(kernel_size, 1)
            )),
        ])
        self.convs2.apply(init_weights)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for c1, c2 in zip(self.convs1, self.convs2):
            xt = F.leaky_relu(x, LRELU_SLOPE)
            xt = c1(xt)
            xt = F.leaky_relu(xt, LRELU_SLOPE)
            xt = c2(xt)
            x = xt + x
        return x

    def remove_weight_norm(self):
        for layer in self.convs1:
            remove_weight_norm(layer)
        for layer in self.convs2:
            remove_weight_norm(layer)


class ResBlock2(nn.Module):
    """Residual Block Type 2 variant."""

    def __init__(self, channels: int, kernel_size: int = 3, dilation: List[int] = (1, 3)):
        super().__init__()
        self.convs = nn.ModuleList([
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=dilation[0], padding=get_padding(kernel_size, dilation[0])
            )),
            weight_norm(nn.Conv1d(
                channels, channels, kernel_size, 1,
                dilation=dilation[1], padding=get_padding(kernel_size, dilation[1])
            )),
        ])
        self.convs.apply(init_weights)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for c in self.convs:
            xt = F.leaky_relu(x, LRELU_SLOPE)
            xt = c(xt)
            x = xt + x
        return x

    def remove_weight_norm(self):
        for layer in self.convs:
            remove_weight_norm(layer)


class HiFiGANGenerator(nn.Module):
    """
    HiFi-GAN Neural Vocoder Generator.

    Converts [B, 80, T] log-mel spectrogram into [B, 1, T * 256] waveform.
    """

    def __init__(self, config: Optional[HiFiGANConfig] = None):
        super().__init__()
        self.config = config or HiFiGANConfig()
        self.num_kernels = len(self.config.resblock_kernel_sizes)
        self.num_upsamples = len(self.config.upsample_rates)

        self.conv_pre = weight_norm(
            nn.Conv1d(self.config.num_mels, self.config.upsample_initial_channel, 7, 1, padding=3)
        )

        resblock_cls = ResBlock1 if self.config.resblock == "1" else ResBlock2

        self.ups = nn.ModuleList()
        for i, (u, k) in enumerate(zip(self.config.upsample_rates, self.config.upsample_kernel_sizes)):
            in_ch = self.config.upsample_initial_channel // (2 ** i)
            out_ch = self.config.upsample_initial_channel // (2 ** (i + 1))
            self.ups.append(
                weight_norm(nn.ConvTranspose1d(
                    in_ch, out_ch, k, u, padding=(k - u) // 2
                ))
            )

        self.resblocks = nn.ModuleList()
        for i in range(len(self.ups)):
            ch = self.config.upsample_initial_channel // (2 ** (i + 1))
            for j, (k, d) in enumerate(zip(self.config.resblock_kernel_sizes, self.config.resblock_dilation_sizes)):
                self.resblocks.append(resblock_cls(ch, k, d))

        final_ch = self.config.upsample_initial_channel // (2 ** len(self.ups))
        self.conv_post = weight_norm(nn.Conv1d(final_ch, 1, 7, 1, padding=3))
        self.conv_post.apply(init_weights)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Log-mel spectrogram tensor of shape [B, 80, T].

        Returns:
            Raw audio waveform tensor of shape [B, 1, T * 256].
        """
        x = self.conv_pre(x)
        for i in range(self.num_upsamples):
            x = F.leaky_relu(x, LRELU_SLOPE)
            x = self.ups[i](x)
            xs = None
            for j in range(self.num_kernels):
                if xs is None:
                    xs = self.resblocks[i * self.num_kernels + j](x)
                else:
                    xs = xs + self.resblocks[i * self.num_kernels + j](x)
            x = xs / self.num_kernels

        x = F.leaky_relu(x)
        x = self.conv_post(x)
        x = torch.tanh(x)
        return x

    def remove_weight_norm(self):
        print("Removing weight normalization for HiFi-GAN inference...")
        remove_weight_norm(self.conv_pre)
        for layer in self.ups:
            remove_weight_norm(layer)
        for layer in self.resblocks:
            layer.remove_weight_norm()
        remove_weight_norm(self.conv_post)

"""
Gyan Multilingual TTS — Acoustic Model

Phase 8.2:
Character tokens + language ID -> mel spectrogram.

This is a lightweight encoder-decoder baseline designed to work with
the existing multilingual DataLoader and a 4 GB RTX 2050.
"""

from typing import Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F

from ai.configs.tts_config import TTSConfig


class PositionalEncoding(nn.Module):
    """Standard sinusoidal positional encoding."""

    def __init__(self, d_model: int, max_len: int = 2048):
        super().__init__()

        position = torch.arange(max_len).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2)
            * (-torch.log(torch.tensor(10000.0)) / d_model)
        )

        pe = torch.zeros(max_len, d_model)
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)

        self.register_buffer("pe", pe.unsqueeze(0))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: [B, T, D]
        """
        return x + self.pe[:, :x.size(1)]


class TextEncoder(nn.Module):
    """
    Transformer text encoder with explicit language conditioning.
    """

    def __init__(self, config: TTSConfig):
        super().__init__()

        model_cfg = config.model

        self.token_embedding = nn.Embedding(
            model_cfg.vocab_size,
            model_cfg.embedding_dim,
            padding_idx=config.text.pad_id,
        )

        self.language_embedding = nn.Embedding(
            model_cfg.num_languages,
            model_cfg.language_embedding_dim,
        )

        self.language_projection = nn.Linear(
            model_cfg.language_embedding_dim,
            model_cfg.embedding_dim,
        )

        self.position_encoding = PositionalEncoding(
            model_cfg.embedding_dim
        )

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=model_cfg.embedding_dim,
            nhead=model_cfg.encoder_heads,
            dim_feedforward=model_cfg.hidden_dim * 4,
            dropout=model_cfg.dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )

        self.encoder = nn.TransformerEncoder(
            encoder_layer,
            num_layers=model_cfg.encoder_layers,
        )

        self.output_projection = nn.Linear(
            model_cfg.embedding_dim,
            model_cfg.hidden_dim,
        )

    def forward(
        self,
        text_ids: torch.Tensor,
        text_lengths: torch.Tensor,
        language_ids: torch.Tensor,
    ) -> torch.Tensor:
        """
        Args:
            text_ids:      [B, T_text]
            text_lengths:  [B]
            language_ids:  [B]

        Returns:
            encoded_text: [B, T_text, hidden_dim]
        """

        x = self.token_embedding(text_ids)

        lang_embedding = self.language_embedding(language_ids)
        lang_embedding = self.language_projection(lang_embedding)

        # Apply language conditioning to every text position.
        x = x + lang_embedding.unsqueeze(1)

        x = self.position_encoding(x)

        max_len = text_ids.size(1)

        positions = torch.arange(
            max_len,
            device=text_ids.device
        ).unsqueeze(0)

        padding_mask = positions >= text_lengths.unsqueeze(1)

        x = self.encoder(
            x,
            src_key_padding_mask=padding_mask,
        )

        return self.output_projection(x)


class MelDecoder(nn.Module):
    """
    Cross-attention decoder.

    Mel positions query the encoded text representation.
    """

    def __init__(self, config: TTSConfig):
        super().__init__()

        model_cfg = config.model

        self.hidden_dim = model_cfg.hidden_dim
        self.max_mel_frames = model_cfg.max_mel_frames

        self.mel_position_embedding = nn.Embedding(
            model_cfg.max_mel_frames,
            model_cfg.hidden_dim,
        )

        decoder_layer = nn.TransformerDecoderLayer(
            d_model=model_cfg.hidden_dim,
            nhead=model_cfg.decoder_heads,
            dim_feedforward=model_cfg.hidden_dim * 4,
            dropout=model_cfg.dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )

        self.decoder = nn.TransformerDecoder(
            decoder_layer,
            num_layers=model_cfg.decoder_layers,
        )

        self.mel_projection = nn.Linear(
            model_cfg.hidden_dim,
            model_cfg.n_mels,
        )

    def forward(
        self,
        encoded_text: torch.Tensor,
        text_lengths: torch.Tensor,
        mel_lengths: torch.Tensor,
    ) -> torch.Tensor:
        """
        Args:
            encoded_text: [B, T_text, hidden_dim]
            text_lengths: [B]
            mel_lengths:  [B]

        Returns:
            mel: [B, n_mels, T_mel]
        """

        batch_size = encoded_text.size(0)

        max_mel_len = int(mel_lengths.max().item())

        if max_mel_len > self.max_mel_frames:
            raise ValueError(
                f"Mel length {max_mel_len} exceeds "
                f"max_mel_frames={self.max_mel_frames}"
            )

        positions = torch.arange(
            max_mel_len,
            device=encoded_text.device,
        )

        target = self.mel_position_embedding(positions)

        target = target.unsqueeze(0).expand(
            batch_size,
            -1,
            -1,
        )

        max_text_len = encoded_text.size(1)

        text_positions = torch.arange(
            max_text_len,
            device=encoded_text.device,
        ).unsqueeze(0)

        memory_padding_mask = (
            text_positions >= text_lengths.unsqueeze(1)
        )

        decoded = self.decoder(
            tgt=target,
            memory=encoded_text,
            memory_key_padding_mask=memory_padding_mask,
        )

        mel = self.mel_projection(decoded)

        return mel.transpose(1, 2)


class PostNet(nn.Module):
    """
    Lightweight convolutional mel refinement network.
    """

    def __init__(
        self,
        n_mels: int,
        hidden_dim: int,
        dropout: float,
    ):
        super().__init__()

        self.net = nn.Sequential(
            nn.Conv1d(n_mels, hidden_dim, kernel_size=5, padding=2),
            nn.BatchNorm1d(hidden_dim),
            nn.Tanh(),
            nn.Dropout(dropout),

            nn.Conv1d(hidden_dim, hidden_dim, kernel_size=5, padding=2),
            nn.BatchNorm1d(hidden_dim),
            nn.Tanh(),
            nn.Dropout(dropout),

            nn.Conv1d(hidden_dim, n_mels, kernel_size=5, padding=2),
        )

    def forward(self, mel: torch.Tensor) -> torch.Tensor:
        return self.net(mel)


class MultilingualTTS(nn.Module):
    """
    Lightweight multilingual acoustic TTS model.

    Input:
        text_ids
        text_lengths
        language_ids
        mel_lengths

    Output:
        coarse_mel
        refined_mel
    """

    def __init__(
        self,
        config: Optional[TTSConfig] = None,
        vocab_size: Optional[int] = None,
    ):
        super().__init__()

        self.config = config or TTSConfig()

        if vocab_size is not None:
            self.config.model.vocab_size = vocab_size

        self.text_encoder = TextEncoder(self.config)

        self.mel_decoder = MelDecoder(self.config)

        self.postnet = PostNet(
            n_mels=self.config.model.n_mels,
            hidden_dim=self.config.model.hidden_dim,
            dropout=self.config.model.dropout,
        )

    def forward(
        self,
        text_ids: torch.Tensor,
        text_lengths: torch.Tensor,
        language_ids: torch.Tensor,
        mel_lengths: torch.Tensor,
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward pass.

        Returns:
            coarse_mel:  [B, 80, T]
            refined_mel: [B, 80, T]
        """

        encoded_text = self.text_encoder(
            text_ids=text_ids,
            text_lengths=text_lengths,
            language_ids=language_ids,
        )

        coarse_mel = self.mel_decoder(
            encoded_text=encoded_text,
            text_lengths=text_lengths,
            mel_lengths=mel_lengths,
        )

        refined_mel = coarse_mel + self.postnet(coarse_mel)

        return coarse_mel, refined_mel

    def count_parameters(self) -> int:
        """Returns number of trainable parameters."""
        return sum(
            parameter.numel()
            for parameter in self.parameters()
            if parameter.requires_grad
        )
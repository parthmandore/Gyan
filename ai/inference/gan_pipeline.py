"""
Gyan TTS — Integrated Conditional Residual Mel GAN Pipeline.

Input:
    Real WAV audio + language

Output:
    GAN-augmented mel and optional synthesized WAV

Pipeline:
    WAV
      -> log-mel
      -> normalization
      -> overlapping 256-frame GAN inference
      -> Bartlett overlap-add
      -> denormalization
      -> HiFi-GAN
      -> WAV
"""

from pathlib import Path
from typing import Union, Optional

import torch
import torch.nn.functional as F

from ai.configs.tts_config import TTSConfig
from ai.models.generator import ResidualMelGenerator
from ai.models.gan_utils import (
    normalize_mel,
    denormalize_mel,
)
from ai.preprocessing.audio_features import (
    load_audio,
    MelSpectrogramExtractor,
)
from ai.inference.hifigan_vocoder import HiFiGANVocoder


LANGUAGE_MAP = {
    "en": 0,
    "hi": 1,
    "mr": 2,
}


class GANPipeline:
    """
    Production inference wrapper for the trained
    Conditional Residual Mel GAN.
    """

    def __init__(
        self,
        checkpoint_path: Union[str, Path] = (
            "D:/Gyan/checkpoints/gan/gan_best.pt"
        ),
        device: Optional[torch.device] = None,
        config: Optional[TTSConfig] = None,
    ):
        self.config = config or TTSConfig()

        self.device = (
            device
            or torch.device(
                "cuda"
                if torch.cuda.is_available()
                else "cpu"
            )
        )

        self.checkpoint_path = Path(checkpoint_path)

        if not self.checkpoint_path.exists():
            raise FileNotFoundError(
                f"GAN checkpoint not found:\n"
                f"{self.checkpoint_path}"
            )

        print(
            f"GAN device: {self.device}"
        )

        # ----------------------------------------------------
        # Generator
        # ----------------------------------------------------

        self.generator = ResidualMelGenerator(
            noise_dim=self.config.gan.noise_dim,
            num_languages=self.config.model.num_languages,
            language_embedding_dim=(
                self.config.gan.language_embedding_dim
            ),
            base_channels=(
                self.config.gan.generator_base_channels
            ),
            residual_alpha=(
                self.config.gan.residual_alpha
            ),
        ).to(self.device)

        checkpoint = torch.load(
            self.checkpoint_path,
            map_location=self.device,
            weights_only=False,
        )

        if "generator_state_dict" not in checkpoint:
            raise KeyError(
                "Checkpoint does not contain "
                "'generator_state_dict'."
            )

        self.generator.load_state_dict(
            checkpoint["generator_state_dict"]
        )

        self.generator.eval()

        self.checkpoint_epoch = checkpoint.get(
            "epoch",
            None,
        )

        # ----------------------------------------------------
        # Mel extractor
        # ----------------------------------------------------

        self.mel_extractor = (
            MelSpectrogramExtractor(
                self.config.audio
            ).to(self.device)
        )

        self.mel_extractor.eval()

        # ----------------------------------------------------
        # HiFi-GAN
        # ----------------------------------------------------

        self.vocoder = HiFiGANVocoder(
            device=self.device
        )

        print(
            f"Loaded GAN checkpoint: "
            f"{self.checkpoint_path}"
        )

        print(
            f"GAN checkpoint epoch: "
            f"{self.checkpoint_epoch}"
        )

    # ========================================================
    # Language
    # ========================================================

    def language_id(
        self,
        language: Union[str, int],
    ) -> int:
        if isinstance(language, int):
            if language not in (0, 1, 2):
                raise ValueError(
                    "language_id must be 0, 1, or 2."
                )
            return language

        language = (
            str(language)
            .strip()
            .lower()
        )

        if language not in LANGUAGE_MAP:
            raise ValueError(
                "Unsupported language. "
                "Use 'en', 'hi', or 'mr'."
            )

        return LANGUAGE_MAP[language]

    # ========================================================
    # Full-utterance GAN augmentation
    # ========================================================

    @torch.no_grad()
    def augment_mel(
        self,
        mel: torch.Tensor,
        language: Union[str, int],
        seed: Optional[int] = None,
        stride: Optional[int] = None,
    ) -> torch.Tensor:
        """
        Augment an arbitrary-length log-mel spectrogram.

        Args:
            mel:
                [80, T] natural-log mel spectrogram.

            language:
                'en', 'hi', 'mr' or integer ID.

            seed:
                Optional random seed for reproducibility.

            stride:
                Chunk stride. Default = half the GAN window.

        Returns:
            Augmented log-mel [80, T].
        """

        if mel.dim() != 2:
            raise ValueError(
                f"Expected mel shape [80, T], "
                f"got {tuple(mel.shape)}"
            )

        if mel.size(0) != self.config.audio.n_mels:
            raise ValueError(
                f"Expected "
                f"{self.config.audio.n_mels} mel bins, "
                f"got {mel.size(0)}"
            )

        if mel.size(1) <= 0:
            raise ValueError(
                "Mel spectrogram is empty."
            )

        if seed is not None:
            generator = torch.Generator(device=self.device)
            generator.manual_seed(seed)
        else:
            generator = None

        device = self.device

        mel = mel.to(
            device,
            dtype=torch.float32,
        )

        original_frames = mel.size(1)

        target_frames = (
            self.config.gan.mel_frames
        )

        if stride is None:
            stride = target_frames // 2

        if stride <= 0:
            raise ValueError(
                "stride must be greater than zero."
            )

        if stride > target_frames:
            raise ValueError(
                "stride cannot exceed "
                "target_frames."
            )

        # ----------------------------------------------------
        # Normalize entire source mel
        # ----------------------------------------------------

        normalized = normalize_mel(
            mel
        )

        # ----------------------------------------------------
        # Short utterance
        # ----------------------------------------------------

        if original_frames <= target_frames:

            if original_frames < target_frames:
                pad_amount = (
                    target_frames
                    - original_frames
                )

                chunk = F.pad(
                    normalized,
                    (0, pad_amount),
                    value=-1.0,
                )
            else:
                chunk = normalized

            chunk = chunk.unsqueeze(0)

            if seed is not None:
                noise = torch.randn(
                    1,
                    self.config.gan.noise_dim,
                    device=device,
                    generator=generator,
                )
            else:
                noise = torch.randn(
                    1,
                    self.config.gan.noise_dim,
                    device=device,
                )

            lang_tensor = torch.tensor(
                [self.language_id(language)],
                dtype=torch.long,
                device=device,
            )

            augmented = self.generator(
                chunk.unsqueeze(1),
                noise,
                lang_tensor,
            )

            augmented = augmented.squeeze(0).squeeze(0)

            augmented = augmented[
                :, :original_frames
            ]

            return denormalize_mel(
                augmented
            ).cpu()

        # ----------------------------------------------------
        # Long utterance
        # ----------------------------------------------------

        starts = list(
            range(
                0,
                original_frames
                - target_frames
                + 1,
                stride,
            )
        )

        final_start = (
            original_frames
            - target_frames
        )

        if starts[-1] != final_start:
            starts.append(final_start)

        # ----------------------------------------------------
        # Bartlett window
        # ----------------------------------------------------

        window = torch.bartlett_window(
            target_frames,
            periodic=False,
            device=device,
            dtype=torch.float32,
        )

        window = window.clamp_min(1e-3)

        output = torch.zeros_like(
            normalized
        )

        weights = torch.zeros(
            1,
            original_frames,
            device=device,
            dtype=torch.float32,
        )

        lang_tensor = torch.tensor(
            [self.language_id(language)],
            dtype=torch.long,
            device=device,
        )

        # ----------------------------------------------------
        # Process each chunk
        # ----------------------------------------------------

        for start in starts:

            end = start + target_frames

            chunk = normalized[
                :, start:end
            ]

            chunk = chunk.unsqueeze(0).unsqueeze(1)

            if seed is not None:
                noise = torch.randn(
                    1,
                    self.config.gan.noise_dim,
                    device=device,
                    generator=generator,
                )
            else:
                noise = torch.randn(
                    1,
                    self.config.gan.noise_dim,
                    device=device,
                )

            augmented = self.generator(
                chunk,
                noise,
                lang_tensor,
            )

            augmented = augmented[
                0, 0
            ]

            output[
                :, start:end
            ] += augmented * window

            weights[
                :, start:end
            ] += window

        # ----------------------------------------------------
        # Normalize overlap-add
        # ----------------------------------------------------

        output = (
            output
            / weights.clamp_min(1e-6)
        )

        # Restore exact original length
        output = output[
            :, :original_frames
        ]

        # ----------------------------------------------------
        # Denormalize
        # ----------------------------------------------------

        augmented_log_mel = (
            denormalize_mel(
                output
            )
        )

        return augmented_log_mel.cpu()

    # ========================================================
    # WAV -> augmented mel
    # ========================================================

    @torch.no_grad()
    def augment_wav_to_mel(
        self,
        audio_path: Union[str, Path],
        language: Union[str, int],
        seed: Optional[int] = None,
    ) -> torch.Tensor:

        waveform, _ = load_audio(
            audio_path,
            target_sr=self.config.audio.sample_rate,
        )

        mel = self.mel_extractor(
            waveform.to(self.device)
        )

        return self.augment_mel(
            mel=mel.cpu(),
            language=language,
            seed=seed,
        )

    # ========================================================
    # WAV -> augmented WAV
    # ========================================================

    @torch.no_grad()
    def augment_wav(
        self,
        audio_path: Union[str, Path],
        language: Union[str, int],
        output_path: Union[str, Path],
        seed: Optional[int] = None,
    ) -> Path:

        augmented_mel = (
            self.augment_wav_to_mel(
                audio_path=audio_path,
                language=language,
                seed=seed,
            )
        )

        waveform = (
            self.vocoder.mel_to_waveform(
                augmented_mel
            )
        )

        return self.vocoder.save_wav(
            waveform,
            output_path,
        )
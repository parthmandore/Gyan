"""
Gyan Multilingual TTS — Residual Mel GAN Unit & Smoke Test Suite.
"""

import sys
import io
import time
from pathlib import Path
import torch
import torch.nn.functional as F

PROJECT_ROOT = Path("D:/Gyan")
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from ai.configs.tts_config import TTSConfig
from ai.models.generator import ResidualMelGenerator
from ai.models.discriminator import MelDiscriminator
from ai.models.gan_utils import (
    normalize_mel,
    denormalize_mel,
    random_mel_crop,
    compute_spectral_gradient_loss,
)
from ai.training.dataset import MultilingualTTSDataset, create_tts_dataloader

def run_unit_tests():
    print("=" * 80)
    print("RESIDUAL MEL AUGMENTATION GAN — UNIT & SHAPE TESTS")
    print("=" * 80)

    config = TTSConfig()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    if device.type == "cuda":
        torch.cuda.reset_peak_memory_stats(device)
        gpu_name = torch.cuda.get_device_name(0)
        vram_total = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"GPU:    {gpu_name} ({vram_total:.2f} GB Total VRAM)")

    # 1. Parameter Count & Model Creation
    print("\n--- 1. Parameter Count & Model Creation ---")
    generator = ResidualMelGenerator(
        noise_dim=config.gan.noise_dim,
        num_languages=config.model.num_languages,
        language_embedding_dim=config.gan.language_embedding_dim,
        base_channels=config.gan.generator_base_channels,
        residual_alpha=config.gan.residual_alpha,
    ).to(device)

    discriminator = MelDiscriminator(
        num_languages=config.model.num_languages,
        language_embedding_dim=config.gan.language_embedding_dim,
        base_channels=config.gan.discriminator_base_channels,
    ).to(device)

    g_params = sum(p.numel() for p in generator.parameters())
    d_params = sum(p.numel() for p in discriminator.parameters())
    print(f"Generator Parameters:     {g_params:,} ({g_params / 1e6:.2f} M)")
    print(f"Discriminator Parameters: {d_params:,} ({d_params / 1e6:.2f} M)")
    print(f"Total GAN Parameters:     {g_params + d_params:,} ({(g_params + d_params) / 1e6:.2f} M)")

    # 2. Forward Pass Shape & Range Verification
    print("\n--- 2. Forward Pass Shape & Range Verification ---")
    B = 4
    dummy_real_mel = torch.rand(B, 1, 80, 256, device=device) * 2.0 - 1.0
    dummy_noise = torch.randn(B, config.gan.noise_dim, device=device)
    dummy_lang = torch.tensor([0, 1, 2, 0], dtype=torch.long, device=device)

    augmented_mel, residual = generator(
        dummy_real_mel,
        dummy_noise,
        dummy_lang,
        return_residual=True,
    )

    print(f"Input Real Mel Shape:     {tuple(dummy_real_mel.shape)}")
    print(f"Output Augmented Shape:   {tuple(augmented_mel.shape)}")
    print(f"Residual Delta Shape:     {tuple(residual.shape)}")
    print(f"Augmented Mel Min / Max:  {augmented_mel.min().item():.4f} / {augmented_mel.max().item():.4f}")
    print(f"Residual Delta Min / Max: {residual.min().item():.4f} / {residual.max().item():.4f}")

    assert augmented_mel.shape == (B, 1, 80, 256), f"Unexpected shape: {augmented_mel.shape}"
    assert residual.shape == (B, 1, 80, 256), f"Unexpected residual shape: {residual.shape}"
    assert augmented_mel.min() >= -1.0 and augmented_mel.max() <= 1.0, "Augmented mel out of [-1, 1] bounds"
    assert not torch.isnan(augmented_mel).any(), "NaN in augmented mel"
    assert not torch.isinf(augmented_mel).any(), "Inf in augmented mel"

    # 3. Discriminator Evaluation
    print("\n--- 3. Discriminator Evaluation ---")
    d_real = discriminator(dummy_real_mel, dummy_lang)
    d_fake = discriminator(augmented_mel, dummy_lang)
    print(f"Discriminator Real Output: {[round(x, 4) for x in d_real.squeeze(-1).tolist()]}")
    print(f"Discriminator Fake Output: {[round(x, 4) for x in d_fake.squeeze(-1).tolist()]}")
    assert d_real.shape == (B, 1) and d_fake.shape == (B, 1), "Discriminator output shape mismatch"

    # 4. Sensitivity & Variation Test
    print("\n--- 4. Sensitivity & Variation Test ---")
    diff_noise = torch.randn(B, config.gan.noise_dim, device=device)
    aug_diff_noise = generator(dummy_real_mel, diff_noise, dummy_lang)
    noise_diff = torch.abs(augmented_mel - aug_diff_noise).mean().item()

    diff_lang = torch.tensor([1, 2, 0, 1], dtype=torch.long, device=device)
    aug_diff_lang = generator(dummy_real_mel, dummy_noise, diff_lang)
    lang_diff = torch.abs(augmented_mel - aug_diff_lang).mean().item()

    print(f"Mean Difference under New Noise:    {noise_diff:.6f} (Sensitive: {noise_diff > 1e-4})")
    print(f"Mean Difference under New Language: {lang_diff:.6f} (Sensitive: {lang_diff > 1e-4})")
    assert noise_diff > 1e-4, "Generator failed noise sensitivity test"
    assert lang_diff > 1e-4, "Generator failed language conditioning sensitivity test"

    # 5. Gradient Flow & Backward Pass Test
    print("\n--- 5. Gradient Flow & Backward Pass Test ---")
    generator.zero_grad()
    discriminator.zero_grad()

    d_loss = (F.relu(1.0 - d_real).mean() + F.relu(1.0 + d_fake).mean()) / 2.0
    d_loss.backward(retain_graph=True)
    d_has_grads = all(p.grad is not None for p in discriminator.parameters())
    print(f"Discriminator Backward Pass: OK (Has Gradients: {d_has_grads})")

    adv_loss = -discriminator(augmented_mel, dummy_lang).mean()
    content_loss = F.l1_loss(augmented_mel, dummy_real_mel)
    spec_loss = compute_spectral_gradient_loss(augmented_mel, dummy_real_mel)
    g_loss = adv_loss + 10.0 * content_loss + 5.0 * spec_loss
    g_loss.backward()
    g_has_grads = all(p.grad is not None for p in generator.parameters())
    print(f"Generator Backward Pass:     OK (Has Gradients: {g_has_grads})")

    assert d_has_grads and g_has_grads, "Zero gradient detected in backward pass"

    # 6. Real Data Loader Batch Test
    print("\n--- 6. Real Dataset Batch Pipeline Test ---")
    train_csv = config.data.splits_dir / "train.csv"
    dataset = MultilingualTTSDataset(train_csv, config=config)
    dataloader = create_tts_dataloader(dataset, batch_size=B, shuffle=False, num_workers=0)
    batch = next(iter(dataloader))

    mel_raw = batch["mel_padded"].to(device)
    lengths = batch["mel_lengths"]
    lang_ids = batch["language_ids"].to(device)

    cropped_mel = random_mel_crop(mel_raw, lengths, target_frames=256)
    norm_mel = normalize_mel(cropped_mel)
    aug_real = generator(norm_mel, dummy_noise, lang_ids)
    denorm_aug = denormalize_mel(aug_real)

    print(f"Raw Mel Shape:           {tuple(mel_raw.shape)}")
    print(f"Cropped Normalized Mel:  {tuple(norm_mel.shape)} (Min: {norm_mel.min().item():.2f}, Max: {norm_mel.max().item():.2f})")
    print(f"Augmented Mel:           {tuple(aug_real.shape)} (Min: {aug_real.min().item():.2f}, Max: {aug_real.max().item():.2f})")
    print(f"Denormalized Mel:        {tuple(denorm_aug.shape)} (Min: {denorm_aug.min().item():.2f}, Max: {denorm_aug.max().item():.2f})")

    # 7. Actual Measured CUDA Memory
    if device.type == "cuda":
        print("\n--- 7. Measured CUDA Memory Usage (RTX 2050 4 GB) ---")
        vram_allocated = torch.cuda.memory_allocated(device) / (1024**2)
        vram_peak = torch.cuda.max_memory_allocated(device) / (1024**2)
        print(f"Active VRAM Allocated:   {vram_allocated:.2f} MB")
        print(f"Peak VRAM Recorded:      {vram_peak:.2f} MB")

    print("\n" + "=" * 80)
    print(">>> RESIDUAL MEL GAN UNIT TESTS PASSED (100% SUCCESS) <<<")
    print("=" * 80)

if __name__ == "__main__":
    run_unit_tests()

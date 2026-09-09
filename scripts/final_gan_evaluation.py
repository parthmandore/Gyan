"""
Gyan TTS — Final GAN Evaluation

Generates:
1. Training curves
2. Summary metrics
3. Checkpoint information
4. Final evaluation report

Uses the existing GAN training_history.json and checkpoints.
Does NOT retrain the GAN.
"""

import json
from pathlib import Path

import matplotlib.pyplot as plt


PROJECT_ROOT = Path("D:/Gyan")

GAN_DIR = (
    PROJECT_ROOT
    / "checkpoints"
    / "gan"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "outputs"
    / "gan_evaluation"
)


def load_history():
    history_path = GAN_DIR / "training_history.json"

    if not history_path.exists():
        raise FileNotFoundError(
            f"Training history not found:\n{history_path}"
        )

    with open(
        history_path,
        "r",
        encoding="utf-8",
    ) as f:
        return json.load(f)


def save_json_report(history):
    report = {
        "training_epochs": len(history),
        "best_checkpoint": str(
            GAN_DIR / "gan_best.pt"
        ),
        "latest_checkpoint": str(
            GAN_DIR / "gan_latest.pt"
        ),
        "epochs": history,
    }

    path = OUTPUT_DIR / "gan_training_report.json"

    with open(
        path,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            report,
            f,
            indent=2,
        )

    return path


def plot_metric(history, key, title, filename):
    epochs = [x["epoch"] for x in history]
    values = [x[key] for x in history]

    plt.figure(figsize=(8, 5))
    plt.plot(epochs, values, marker="o")
    plt.xlabel("Epoch")
    plt.ylabel(key)
    plt.title(title)
    plt.xticks(epochs)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    path = OUTPUT_DIR / filename
    plt.savefig(path, dpi=200)
    plt.close()

    return path


def create_combined_plot(history):
    epochs = [x["epoch"] for x in history]

    plt.figure(figsize=(10, 6))

    plt.plot(
        epochs,
        [x["g_loss"] for x in history],
        marker="o",
        label="Generator Loss",
    )

    plt.plot(
        epochs,
        [x["d_loss"] for x in history],
        marker="o",
        label="Discriminator Loss",
    )

    plt.plot(
        epochs,
        [x["content_loss_l1"] for x in history],
        marker="o",
        label="Content L1",
    )

    plt.plot(
        epochs,
        [x["spectral_loss_l1"] for x in history],
        marker="o",
        label="Spectral L1",
    )

    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("GAN Training Curves")
    plt.xticks(epochs)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    path = OUTPUT_DIR / "gan_training_curves.png"

    plt.savefig(
        path,
        dpi=200,
    )

    plt.close()

    return path


def main():
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    history = load_history()

    print("=" * 80)
    print("GYAN GAN — FINAL TRAINING EVALUATION")
    print("=" * 80)

    print(f"Training epochs: {len(history)}")

    # --------------------------------------------------------
    # Print table
    # --------------------------------------------------------

    print("\nTraining history")
    print("-" * 80)

    print(
        f"{'Epoch':>5} "
        f"{'G Loss':>12} "
        f"{'D Loss':>12} "
        f"{'Content L1':>14} "
        f"{'Spectral L1':>14}"
    )

    for row in history:
        print(
            f"{row['epoch']:5d} "
            f"{row['g_loss']:12.6f} "
            f"{row['d_loss']:12.6f} "
            f"{row['content_loss_l1']:14.6f} "
            f"{row['spectral_loss_l1']:14.6f}"
        )

    # --------------------------------------------------------
    # Best values
    # --------------------------------------------------------

    best_g = min(
        history,
        key=lambda x: x["g_loss"]
    )

    best_content = min(
        history,
        key=lambda x: x["content_loss_l1"]
    )

    best_spectral = min(
        history,
        key=lambda x: x["spectral_loss_l1"]
    )

    print("\nBest generator loss:")
    print(
        f"  Epoch {best_g['epoch']}: "
        f"{best_g['g_loss']:.6f}"
    )

    print("\nBest content loss:")
    print(
        f"  Epoch {best_content['epoch']}: "
        f"{best_content['content_loss_l1']:.6f}"
    )

    print("\nBest spectral loss:")
    print(
        f"  Epoch {best_spectral['epoch']}: "
        f"{best_spectral['spectral_loss_l1']:.6f}"
    )

    # --------------------------------------------------------
    # Checkpoints
    # --------------------------------------------------------

    print("\nCheckpoints")
    print("-" * 80)

    for name in [
        "gan_best.pt",
        "gan_epoch_1.pt",
        "gan_epoch_2.pt",
        "gan_epoch_3.pt",
        "gan_epoch_4.pt",
        "gan_epoch_5.pt",
        "gan_latest.pt",
    ]:
        path = GAN_DIR / name
        print(
            f"{name:20s} "
            f"{'FOUND' if path.exists() else 'MISSING'}"
        )

    # --------------------------------------------------------
    # Generate plots
    # --------------------------------------------------------

    print("\nGenerating plots...")

    combined_plot = create_combined_plot(
        history
    )

    g_plot = plot_metric(
        history,
        "g_loss",
        "Generator Loss",
        "generator_loss.png",
    )

    d_plot = plot_metric(
        history,
        "d_loss",
        "Discriminator Loss",
        "discriminator_loss.png",
    )

    content_plot = plot_metric(
        history,
        "content_loss_l1",
        "Content L1 Loss",
        "content_l1_loss.png",
    )

    spectral_plot = plot_metric(
        history,
        "spectral_loss_l1",
        "Spectral L1 Loss",
        "spectral_l1_loss.png",
    )

    # --------------------------------------------------------
    # JSON report
    # --------------------------------------------------------

    report_path = save_json_report(
        history
    )

    # --------------------------------------------------------
    # Final output
    # --------------------------------------------------------

    print("\nGenerated files:")
    print(f"  {combined_plot}")
    print(f"  {g_plot}")
    print(f"  {d_plot}")
    print(f"  {content_plot}")
    print(f"  {spectral_plot}")
    print(f"  {report_path}")

    print("\n" + "=" * 80)
    print("FINAL GAN TRAINING EVALUATION COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
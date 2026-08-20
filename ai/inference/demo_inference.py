"""
Gyan Multilingual TTS — Demo Inference

Loads the demo-trained acoustic model and generates
a predicted mel spectrogram from input text.

Usage:
    python -m ai.inference.demo_inference
"""

from pathlib import Path

import matplotlib.pyplot as plt
import torch

from ai.configs.tts_config import TTSConfig
from ai.models.multilingual_tts import MultilingualTTS
from ai.utils.text_utils import MultilingualVocabulary


# ============================================================
# CONFIGURATION
# ============================================================

CHECKPOINT_PATH = Path(
    "D:/Gyan/checkpoints/demo/best_model.pt"
)

OUTPUT_DIR = Path(
    "D:/Gyan/outputs"
)


LANGUAGE_MAP = {
    "en": 0,
    "hi": 1,
    "mr": 2,
}


def get_device():

    if torch.cuda.is_available():

        device = torch.device("cuda")

        print(
            f"Using GPU: "
            f"{torch.cuda.get_device_name(0)}"
        )

    else:

        device = torch.device("cpu")

        print(
            "CUDA not available. "
            "Using CPU."
        )

    return device


def load_model_and_vocab(device):

    config = TTSConfig()

    # --------------------------------------------------------
    # Vocabulary
    # --------------------------------------------------------

    vocab = MultilingualVocabulary(
        config.text
    )

    if not config.data.vocab_file.exists():

        raise FileNotFoundError(
            "Vocabulary file not found: "
            f"{config.data.vocab_file}"
        )

    vocab.load(
        config.data.vocab_file
    )

    config.model.vocab_size = len(vocab)

    print(
        f"Vocabulary loaded: "
        f"{len(vocab)} tokens"
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = MultilingualTTS(
        config=config,
        vocab_size=len(vocab),
    )

    # --------------------------------------------------------
    # Checkpoint
    # --------------------------------------------------------

    if not CHECKPOINT_PATH.exists():

        raise FileNotFoundError(
            "Checkpoint not found: "
            f"{CHECKPOINT_PATH}"
        )

    checkpoint = torch.load(
    CHECKPOINT_PATH,
    map_location=device,
    weights_only=False,
)

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model = model.to(device)

    model.eval()

    print(
        "Checkpoint loaded: "
        f"{CHECKPOINT_PATH}"
    )

    print(
        f"Checkpoint epoch: "
        f"{checkpoint.get('epoch', 'unknown')}"
    )

    return model, vocab, config


def estimate_mel_length(text):

    """
    Simple heuristic for demo inference.

    During training, the decoder receives the target mel
    length. For standalone inference we need to estimate
    an output length.

    This will later be replaced with a proper duration /
    stop-token prediction mechanism.
    """

    text_length = len(text)

    estimated_length = max(
        100,
        text_length * 8
    )

    estimated_length = min(
        estimated_length,
        1500
    )

    return estimated_length


@torch.no_grad()
def synthesize_mel(
    model,
    vocab,
    config,
    text,
    language,
    device,
):

    if language not in LANGUAGE_MAP:

        raise ValueError(
            f"Unsupported language: {language}. "
            f"Choose from {list(LANGUAGE_MAP.keys())}"
        )

    # --------------------------------------------------------
    # Text encoding
    # --------------------------------------------------------

    sequence = vocab.text_to_sequence(
        text,
        add_bos=config.text.add_bos,
        add_eos=config.text.add_eos,
    )

    text_ids = torch.tensor(
        sequence,
        dtype=torch.long,
    ).unsqueeze(0).to(device)

    text_lengths = torch.tensor(
        [len(sequence)],
        dtype=torch.long,
        device=device,
    )

    language_ids = torch.tensor(
        [LANGUAGE_MAP[language]],
        dtype=torch.long,
        device=device,
    )

    # --------------------------------------------------------
    # Estimate output mel length
    # --------------------------------------------------------

    mel_length = estimate_mel_length(
        text
    )

    mel_lengths = torch.tensor(
        [mel_length],
        dtype=torch.long,
        device=device,
    )

    print()
    print("Inference details")
    print("-" * 50)

    print(f"Text: {text}")

    print(
        f"Language: "
        f"{language}"
    )

    print(
        f"Text tokens: "
        f"{len(sequence)}"
    )

    print(
        f"Estimated mel frames: "
        f"{mel_length}"
    )

    # --------------------------------------------------------
    # Forward pass
    # --------------------------------------------------------

    coarse_mel, refined_mel = model(
        text_ids=text_ids,
        text_lengths=text_lengths,
        language_ids=language_ids,
        mel_lengths=mel_lengths,
    )

    mel = refined_mel.squeeze(0).cpu()

    print(
        f"Generated mel shape: "
        f"{tuple(mel.shape)}"
    )

    return mel


def save_mel(mel, output_path):

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    torch.save(
        mel,
        output_path
    )

    print(
        f"Mel tensor saved: "
        f"{output_path}"
    )


def plot_mel(
    mel,
    image_path,
):

    plt.figure(
        figsize=(12, 5)
    )

    plt.imshow(
        mel.numpy(),
        aspect="auto",
        origin="lower",
    )

    plt.colorbar()

    plt.xlabel(
        "Time Frames"
    )

    plt.ylabel(
        "Mel Channel"
    )

    plt.title(
        "Gyan Multilingual TTS — Predicted Mel Spectrogram"
    )

    plt.tight_layout()

    plt.savefig(
        image_path,
        dpi=150,
    )

    plt.close()

    print(
        f"Mel image saved: "
        f"{image_path}"
    )


def main():

    print()
    print("=" * 60)

    print(
        "GYAN MULTILINGUAL TTS — DEMO INFERENCE"
    )

    print("=" * 60)

    # --------------------------------------------------------
    # Example inputs
    # --------------------------------------------------------

    examples = [

        (
            "Hello, welcome to Gyan.",
            "en",
            "english_demo",
        ),

        (
            "नमस्ते, ज्ञान में आपका स्वागत है।",
            "hi",
            "hindi_demo",
        ),

        (
            "नमस्कार, ज्ञान मध्ये तुमचे स्वागत आहे.",
            "mr",
            "marathi_demo",
        ),

    ]

    device = get_device()

    model, vocab, config = load_model_and_vocab(
        device
    )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    for text, language, name in examples:

        print()
        print("=" * 60)

        print(
            f"GENERATING: "
            f"{language.upper()}"
        )

        print("=" * 60)

        mel = synthesize_mel(
            model=model,
            vocab=vocab,
            config=config,
            text=text,
            language=language,
            device=device,
        )

        mel_path = (
            OUTPUT_DIR
            / f"{name}_mel.pt"
        )

        image_path = (
            OUTPUT_DIR
            / f"{name}_mel.png"
        )

        save_mel(
            mel,
            mel_path
        )

        plot_mel(
            mel,
            image_path
        )

    print()

    print("=" * 60)

    print(
        "INFERENCE COMPLETE"
    )

    print("=" * 60)

    print()

    print(
        f"Outputs saved to: "
        f"{OUTPUT_DIR}"
    )


if __name__ == "__main__":
    main()
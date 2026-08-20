"""
Gyan Multilingual TTS — Text Utilities Module

Builds a character-level multilingual vocabulary from training text
and handles tokenization / detokenization.

This module must remain independent of the Dataset and DataLoader
modules to avoid circular imports.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Union

import pandas as pd

from ai.configs.tts_config import TextConfig


class MultilingualVocabulary:
    """
    Multilingual character-level vocabulary.

    Special tokens:
        <pad>: 0
        <unk>: 1
        <bos>: 2
        <eos>: 3

    All remaining unique characters are built from training text only.
    """

    def __init__(
        self,
        config: Optional[TextConfig] = None,
    ):
        self.config = config or TextConfig()

        self.special_tokens = [
            self.config.pad_token,
            self.config.unk_token,
            self.config.bos_token,
            self.config.eos_token,
        ]

        self.char2idx: Dict[str, int] = {}
        self.idx2char: Dict[int, str] = {}

        self._init_special_tokens()

    def _init_special_tokens(self) -> None:
        """
        Initialize the fixed special token mappings.
        """

        self.char2idx = {
            token: idx
            for idx, token in enumerate(
                self.special_tokens
            )
        }

        self.idx2char = {
            idx: token
            for idx, token in enumerate(
                self.special_tokens
            )
        }

    def build_from_train_csv(
        self,
        train_csv_path: Union[str, Path],
        save_path: Optional[Union[str, Path]] = None,
    ) -> "MultilingualVocabulary":
        """
        Build vocabulary strictly from the training CSV.

        Validation and test text are never used.
        """

        train_csv_path = Path(
            train_csv_path
        )

        if not train_csv_path.exists():
            raise FileNotFoundError(
                f"Training split CSV not found: "
                f"{train_csv_path}"
            )

        df = pd.read_csv(
            train_csv_path,
            encoding="utf-8",
        )

        if "text" not in df.columns:
            raise KeyError(
                f"'text' column missing from "
                f"{train_csv_path.name}"
            )

        unique_chars = set()

        for text in df["text"].dropna():
            unique_chars.update(
                list(str(text))
            )

        sorted_chars = sorted(
            unique_chars
        )

        # Reset to special tokens before rebuilding.
        self._init_special_tokens()

        offset = len(
            self.special_tokens
        )

        for index, char in enumerate(
            sorted_chars
        ):
            token_id = offset + index

            self.char2idx[char] = (
                token_id
            )

            self.idx2char[token_id] = (
                char
            )

        if save_path is not None:

            self.save(
                save_path
            )

        return self

    def save(
        self,
        save_path: Union[str, Path],
    ) -> None:
        """
        Save vocabulary as JSON.
        """

        save_path = Path(
            save_path
        )

        save_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        payload = {
            "special_tokens": (
                self.special_tokens
            ),
            "char2idx": (
                self.char2idx
            ),
            "vocab_size": (
                len(self.char2idx)
            ),
        }

        with open(
            save_path,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                payload,
                file,
                ensure_ascii=False,
                indent=2,
            )

    def load(
        self,
        load_path: Union[str, Path],
    ) -> "MultilingualVocabulary":
        """
        Load vocabulary from JSON.
        """

        load_path = Path(
            load_path
        )

        if not load_path.exists():

            raise FileNotFoundError(
                f"Vocabulary file not found: "
                f"{load_path}"
            )

        with open(
            load_path,
            "r",
            encoding="utf-8",
        ) as file:

            payload = json.load(
                file
            )

        self.special_tokens = (
            payload.get(
                "special_tokens",
                self.special_tokens,
            )
        )

        self.char2idx = {
            str(char): int(token_id)
            for char, token_id
            in payload["char2idx"].items()
        }

        self.idx2char = {
            token_id: char
            for char, token_id
            in self.char2idx.items()
        }

        return self

    def text_to_sequence(
        self,
        text: str,
        add_bos: Optional[bool] = None,
        add_eos: Optional[bool] = None,
    ) -> List[int]:
        """
        Convert text into token IDs.
        """

        if add_bos is None:

            add_bos = (
                self.config.add_bos
            )

        if add_eos is None:

            add_eos = (
                self.config.add_eos
            )

        sequence: List[int] = []

        if add_bos:

            sequence.append(
                self.config.bos_id
            )

        for char in str(text):

            sequence.append(
                self.char2idx.get(
                    char,
                    self.config.unk_id,
                )
            )

        if add_eos:

            sequence.append(
                self.config.eos_id
            )

        return sequence

    def sequence_to_text(
        self,
        sequence: List[int],
        remove_special: bool = True,
    ) -> str:
        """
        Convert token IDs back into text.
        """

        chars: List[str] = []

        special_ids = {
            self.config.pad_id,
            self.config.unk_id,
            self.config.bos_id,
            self.config.eos_id,
        }

        for token_id in sequence:

            token_id = int(token_id)

            if (
                remove_special
                and token_id in special_ids
            ):
                continue

            char = self.idx2char.get(
                token_id,
                "",
            )

            chars.append(
                char
            )

        return "".join(
            chars
        )

    def __len__(self) -> int:
        """
        Return total vocabulary size.
        """

        return len(
            self.char2idx
        )
import re
import unicodedata
from difflib import SequenceMatcher
from typing import List, Dict, Any


def clean_text(text: str) -> List[str]:
    """
    Multilingual-safe text cleaner for English, Hindi, and Marathi.
    - Normalizes Unicode to NFC (properly composes Devanagari matras, virama, nukta)
    - Lowercases Latin characters for case-insensitive matching
    - Removes punctuation (including Devanagari danda '।' and double-danda '॥')
    - Preserves Devanagari letters, matras, digits, and Latin characters
    """
    if not text:
        return []

    # 1. Unicode NFC Normalization (crucial for Devanagari combining characters)
    text = unicodedata.normalize("NFC", text.strip())

    # 2. Lowercase for English / Latin
    text = text.lower()

    # 3. Strip Devanagari and Latin punctuation marks
    # Danda (U+0964), Double Danda (U+0965), and common symbols
    text = re.sub(r"[।॥\.,!?:;\"'()\[\]{}–—\-_/\\*~`#@%^&+=<>|]", " ", text)

    # 4. Filter to keep word characters (\w matches Latin, Devanagari letters/matras/digits)
    # and split on whitespace
    words = [w for w in text.split() if w]

    # Additional cleanup: strip any remaining non-alphanumeric leading/trailing symbols per word
    cleaned = []
    for word in words:
        w_clean = re.sub(r"^[^\w]+|[^\w]+$", "", word)
        if w_clean:
            cleaned.append(w_clean)

    return cleaned


def assess_reading(expected_text: str, recognized_text: str) -> Dict[str, Any]:
    """
    Compares expected text against recognized text using SequenceMatcher.
    Works for English, Hindi, and Marathi.
    Returns accuracy percentage, word counts, missing/incorrect words, and feedback.
    """
    expected_words = clean_text(expected_text)
    recognized_words = clean_text(recognized_text)

    matcher = SequenceMatcher(
        None,
        expected_words,
        recognized_words
    )

    correct_words = 0
    missing_words = []
    incorrect_words = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            correct_words += i2 - i1
        elif tag == "delete":
            missing_words.extend(expected_words[i1:i2])
        elif tag == "replace":
            incorrect_words.extend(expected_words[i1:i2])
        elif tag == "insert":
            # Extra words inserted that were not in expected
            incorrect_words.extend(recognized_words[j1:j2])

    total_words = len(expected_words)

    if total_words > 0:
        accuracy = (correct_words / total_words) * 100
    else:
        accuracy = 100.0 if len(recognized_words) == 0 else 0.0

    # Determine reading level
    if accuracy >= 90:
        reading_level = "Excellent"
    elif accuracy >= 75:
        reading_level = "Good"
    elif accuracy >= 50:
        reading_level = "Needs Practice"
    else:
        reading_level = "Needs More Practice"

    # Construct smart educational feedback
    feedback_parts = []
    if accuracy >= 90:
        feedback_parts.append("Excellent reading!")
    elif accuracy >= 75:
        feedback_parts.append("Good reading.")
    elif accuracy >= 50:
        feedback_parts.append("Good attempt.")
    else:
        feedback_parts.append("Keep practicing.")

    if missing_words:
        feedback_parts.append(
            f"You missed {len(missing_words)} word(s): "
            + ", ".join(missing_words) + "."
        )

    if incorrect_words:
        # Deduplicate while preserving order
        unique_incorrect = list(dict.fromkeys(incorrect_words))
        feedback_parts.append(
            f"Check these word(s): "
            + ", ".join(unique_incorrect) + "."
        )

    feedback_parts.append("Try to read slowly and clearly.")
    feedback = " ".join(feedback_parts)

    return {
        "expected_text": expected_text,
        "recognized_text": recognized_text,
        "accuracy": round(accuracy, 2),
        "correct_words": correct_words,
        "total_words": total_words,
        "missing_words": missing_words,
        "incorrect_words": incorrect_words,
        "reading_level": reading_level,
        "feedback": feedback
    }
import os
import tempfile
import numpy as np
import soundfile as sf
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import whisper

from backend.utils.assessment import assess_reading
from backend.utils.audio_analysis import analyze_audio

router = APIRouter()

# Configurable model size (default to 'small' for rich multilingual phonetic accuracy)
MODEL_NAME = os.environ.get("WHISPER_MODEL", "small")
# Maximum allowed audio upload size: 10 MB
MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024

# Supported language codes for the educational app
SUPPORTED_LANGUAGES = {"en", "hi", "mr"}

# Vocabulary-anchored prompts to steer Whisper towards educational vocabulary & Devanagari script
LANGUAGE_INITIAL_PROMPTS = {
    "en": "apple, ball, bowl, cat, dog, fish, house, star, tree, book, car, duck, hat, sun, water, words.",
    "hi": "सेब, गेंद, बिल्ली, कुत्ता, मछली, सूरज, पेड़, गाड़ी, किताब, फूल, कमल, घर, आम, तारा, केला, शब्द।",
    "mr": "सफरचंद, चेंडू, मांजर, कुत्रा, मासा, सूर्य, झाड, गाडी, पुस्तक, फूल, कमळ, घर, आंबा, तारा, केळे, शब्द."
}

print(f"[Speech API] Loading Whisper model: '{MODEL_NAME}'...")
try:
    model = whisper.load_model(MODEL_NAME)
    print(f"[Speech API] Whisper model '{MODEL_NAME}' loaded successfully.")
except Exception as e:
    print(f"[Speech API] Warning: Failed to load Whisper model at startup: {e}")
    model = None


def _get_model():
    global model
    if model is None:
        model = whisper.load_model(MODEL_NAME)
    return model


def _preprocess_audio(raw_path: str) -> str:
    """
    Applies RMS volume normalization and 200ms comfort silence padding
    to ensure Whisper's encoder attention window captures isolated short words clearly.
    """
    try:
        # Load audio at 16kHz mono using Whisper's built-in loader (uses ffmpeg)
        audio = whisper.load_audio(raw_path)
        if len(audio) == 0:
            return raw_path

        # 1. RMS Normalization
        rms = np.sqrt(np.mean(audio ** 2))
        target_rms = 0.1
        if rms > 0:
            audio = audio * (target_rms / (rms + 1e-6))
            max_val = np.max(np.abs(audio))
            if max_val > 0.95:
                audio = audio * (0.95 / max_val)

        # 2. Comfort silence padding (200ms at 16kHz = 3200 samples)
        pad_len = 3200
        silence = np.zeros(pad_len, dtype=np.float32)
        audio = np.concatenate([silence, audio, silence])

        # Write to temp WAV
        temp_f = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_wav = temp_f.name
        temp_f.close()
        sf.write(temp_wav, audio, 16000)
        return temp_wav
    except Exception as e:
        print(f"[Speech API] Audio preprocessing fallback: {e}")
        return raw_path


def _clean_transcription(text: str) -> str:
    """
    Removes autoregressive repetition loops if Whisper repeats identical words.
    Example: 'बिल्ली, बिल्ली, बिल्ली' -> 'बिल्ली'
    """
    if not text:
        return ""
    cleaned = text.strip().replace("।", "").replace("॥", "").strip()
    words = [w.strip(" ,.!?\"'()") for w in cleaned.split() if w.strip(" ,.!?\"'()")]
    if not words:
        return cleaned

    # Check for immediate repetition
    unique_words = []
    for w in words:
        if not unique_words or unique_words[-1] != w:
            unique_words.append(w)

    return " ".join(unique_words)


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    """
    Pure transcription endpoint for game integration.
    Accepts an audio file and optional language code ('en', 'hi', 'mr').
    Returns recognized text and detected/used language.
    """
    temp_raw_path = None
    temp_prep_path = None
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file provided.")
        if len(content) > MAX_AUDIO_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file exceeds maximum size limit of {MAX_AUDIO_SIZE_BYTES // (1024 * 1024)}MB."
            )

        suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(content)
            temp_raw_path = temp.name

        # Audio preprocessing
        temp_prep_path = _preprocess_audio(temp_raw_path)
        m = _get_model()

        # Language isolation & script steering with optimal decoding parameters
        transcribe_args = {
            "task": "transcribe",
            "fp16": False,
            "beam_size": 1,
            "best_of": 1,
            "temperature": 0.0,
            "condition_on_previous_text": False,
            "without_timestamps": True,
            "no_speech_threshold": 0.6,
            "logprob_threshold": -1.0,
            "compression_ratio_threshold": 2.4,
            "suppress_blank": True,
        }
        lang_code = language.strip().lower() if language else None
        if lang_code and lang_code in SUPPORTED_LANGUAGES:
            transcribe_args["language"] = lang_code
            if lang_code in LANGUAGE_INITIAL_PROMPTS:
                transcribe_args["initial_prompt"] = LANGUAGE_INITIAL_PROMPTS[lang_code]

        result = m.transcribe(temp_prep_path, **transcribe_args)
        raw_text = result.get("text", "").strip()
        recognized = _clean_transcription(raw_text)

        return {
            "success": True,
            "recognized_text": recognized,
            "language_used": transcribe_args.get("language", result.get("language", "auto")),
            "is_empty": len(recognized) == 0
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription error: {str(e)}"
        )
    finally:
        for p in [temp_raw_path, temp_prep_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except OSError:
                    pass


@router.post("/assess")
async def assess_audio(
    expected_text: str = Form(...),
    file: UploadFile = File(...),
    language: Optional[str] = Form("en")
):
    """
    Complete reading assessment endpoint.
    Transcribes audio, runs text comparison vs expected_text, and computes audio metrics (WPM, duration, pauses).
    Supports English ('en'), Hindi ('hi'), and Marathi ('mr').
    """
    temp_raw_path = None
    temp_prep_path = None
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file provided.")
        if len(content) > MAX_AUDIO_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file exceeds maximum size limit of {MAX_AUDIO_SIZE_BYTES // (1024 * 1024)}MB."
            )

        suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(content)
            temp_raw_path = temp.name

        temp_prep_path = _preprocess_audio(temp_raw_path)
        m = _get_model()

        lang_code = (language or "en").strip().lower()
        transcribe_args = {
            "task": "transcribe",
            "fp16": False,
            "beam_size": 1,
            "best_of": 1,
            "temperature": 0.0,
            "condition_on_previous_text": False,
            "without_timestamps": True,
            "no_speech_threshold": 0.6,
            "logprob_threshold": -1.0,
            "compression_ratio_threshold": 2.4,
            "suppress_blank": True,
        }
        if lang_code in SUPPORTED_LANGUAGES:
            transcribe_args["language"] = lang_code
            if lang_code in LANGUAGE_INITIAL_PROMPTS:
                transcribe_args["initial_prompt"] = LANGUAGE_INITIAL_PROMPTS[lang_code]

        # Step 1: Speech-to-Text
        result = m.transcribe(temp_prep_path, **transcribe_args)
        raw_text = result.get("text", "").strip()
        recognized = _clean_transcription(raw_text)

        # Step 2: Word assessment with multilingual Unicode awareness
        assessment = assess_reading(
            expected_text,
            recognized
        )

        # Step 3: Audio analysis (duration, WPM, pauses)
        try:
            audio_analysis = analyze_audio(temp_raw_path, recognized)
        except Exception as audio_err:
            audio_analysis = {
                "duration_seconds": 0.0,
                "words_per_minute": 0.0,
                "pause_count": 0,
                "audio_analysis_error": str(audio_err)
            }

        # Step 4: Combine results
        assessment.update(audio_analysis)
        assessment["language"] = lang_code
        assessment["is_empty_speech"] = len(recognized) == 0

        return assessment

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Assessment error: {str(e)}"
        )
    finally:
        for p in [temp_raw_path, temp_prep_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except OSError:
                    pass
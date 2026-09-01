import librosa
import numpy as np
import whisper.audio


def analyze_audio(audio_path: str, recognized_text: str):
    """
    Analyzes audio metrics:
    - duration in seconds
    - words per minute (WPM)
    - pause count (> 0.5s silence)

    Supports all audio codecs (AAC/M4A from mobile, WebM from browser, WAV, OGG, MP3)
    via Whisper's ffmpeg-backed loader.
    """
    try:
        # Load audio using Whisper's ffmpeg loader (handles any container/codec at 16kHz)
        audio = whisper.audio.load_audio(audio_path)
        sample_rate = 16000
    except Exception:
        # Fallback to librosa
        audio, sample_rate = librosa.load(audio_path, sr=None)

    # Calculate duration
    duration = librosa.get_duration(
        y=audio,
        sr=sample_rate
    )

    # Calculate words per minute
    words = recognized_text.split()
    word_count = len(words)

    if duration > 0:
        words_per_minute = (word_count / duration) * 60
    else:
        words_per_minute = 0

    # Detect speech/non-speech sections
    intervals = librosa.effects.split(
        audio,
        top_db=30
    )

    # Count pauses between speech sections
    pause_count = 0

    for i in range(1, len(intervals)):
        previous_end = intervals[i - 1][1]
        current_start = intervals[i][0]

        pause_duration = (
            current_start - previous_end
        ) / sample_rate

        # Count pauses longer than 0.5 seconds
        if pause_duration >= 0.5:
            pause_count += 1

    return {
        "duration_seconds": round(float(duration), 2),
        "words_per_minute": round(float(words_per_minute), 2),
        "pause_count": pause_count
    }
"""
End-to-End Multilingual Speech Recognition Test for Gyan
Tests Whisper STT across English (en), Hindi (hi), and Marathi (mr).
"""
import os
import sys
import time

# Ensure UTF-8 stdout on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from gtts import gTTS

# Ensure backend in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

# Ensure ffmpeg in PATH
winget_ffmpeg = r"C:\Users\mando\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin"
if os.path.exists(winget_ffmpeg) and winget_ffmpeg not in os.environ.get("PATH", ""):
    os.environ["PATH"] = winget_ffmpeg + os.pathsep + os.environ.get("PATH", "")

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
SAMPLE_DIR = os.path.join(SCRIPT_DIR, "sample_inputs")
os.makedirs(SAMPLE_DIR, exist_ok=True)

test_cases = [
    # English Tests
    {
        "lang": "en",
        "label": "English Single Word (Apple)",
        "spoken_text": "Apple",
        "expected_text": "Apple",
        "filename": "test_en_apple.mp3"
    },
    {
        "lang": "en",
        "label": "English Sentence",
        "spoken_text": "The sun rises in the east.",
        "expected_text": "The sun rises in the east.",
        "filename": "test_en_sentence.mp3"
    },
    # Hindi Tests
    {
        "lang": "hi",
        "label": "Hindi Single Word (कमल)",
        "spoken_text": "कमल",
        "expected_text": "कमल",
        "filename": "test_hi_kamal.mp3"
    },
    {
        "lang": "hi",
        "label": "Hindi Sentence (सूर्य पूर्व में उगता है)",
        "spoken_text": "सूर्य पूर्व में उगता है",
        "expected_text": "सूर्य पूर्व में उगता है",
        "filename": "test_hi_sentence.mp3"
    },
    # Marathi Tests
    {
        "lang": "mr",
        "label": "Marathi Single Word (कमळ)",
        "spoken_text": "कमळ",
        "expected_text": "कमळ",
        "filename": "test_mr_kamal.mp3"
    },
    {
        "lang": "mr",
        "label": "Marathi Sentence (सूर्य पूर्वेकडे उगवतो)",
        "spoken_text": "सूर्य पूर्वेकडे उगवतो",
        "expected_text": "सूर्य पूर्वेकडे उगवतो",
        "filename": "test_mr_sentence.mp3"
    }
]

print("=" * 70)
print("  GYAN MULTILINGUAL SPEECH RECOGNITION (STT) AUDIT & TEST")
print("=" * 70)

results = []

for tc in test_cases:
    audio_path = os.path.join(SAMPLE_DIR, tc["filename"])
    print(f"\n--- Testing: {tc['label']} ({tc['lang'].upper()}) ---")
    
    # 1. Generate audio with gTTS
    print(f"Generating TTS audio: '{tc['spoken_text']}' -> {tc['filename']}...")
    tts = gTTS(text=tc["spoken_text"], lang=tc["lang"], slow=False)
    tts.save(audio_path)
    
    # 2. Test /speech/transcribe
    with open(audio_path, "rb") as f:
        t0 = time.time()
        resp_transcribe = client.post(
            "/speech/transcribe",
            files={"file": (tc["filename"], f, "audio/mp3")},
            data={"language": tc["lang"]}
        )
        transcribe_lat = round((time.time() - t0) * 1000, 1)

    if resp_transcribe.status_code == 200:
        data_t = resp_transcribe.json()
        rec_text = data_t.get("recognized_text", "")
        print(f"Transcribe Response (Status 200, {transcribe_lat}ms):")
        print(f"  * Recognized: '{rec_text}'")
        print(f"  * Language:   '{data_t.get('language_used')}'")
    else:
        print(f"Transcribe Failed: {resp_transcribe.status_code} - {resp_transcribe.text}")
        rec_text = ""

    # 3. Test /speech/assess
    with open(audio_path, "rb") as f:
        t0 = time.time()
        resp_assess = client.post(
            "/speech/assess",
            files={"file": (tc["filename"], f, "audio/mp3")},
            data={
                "expected_text": tc["expected_text"],
                "language": tc["lang"]
            }
        )
        assess_lat = round((time.time() - t0) * 1000, 1)

    if resp_assess.status_code == 200:
        data_a = resp_assess.json()
        print(f"Assess Response (Status 200, {assess_lat}ms):")
        print(f"  * Accuracy:      {data_a.get('accuracy')}%")
        print(f"  * Reading Level: {data_a.get('reading_level')}")
        print(f"  * WPM:           {data_a.get('words_per_minute')}")
        print(f"  * Feedback:      {data_a.get('feedback')}")
        
        results.append({
            "test": tc["label"],
            "lang": tc["lang"],
            "spoken": tc["spoken_text"],
            "recognized": rec_text,
            "accuracy": data_a.get("accuracy"),
            "level": data_a.get("reading_level"),
            "transcribe_ms": transcribe_lat,
            "assess_ms": assess_lat
        })
    else:
        print(f"Assess Failed: {resp_assess.status_code} - {resp_assess.text}")

print("\n" + "=" * 70)
print("  MULTILINGUAL AUDIT SUMMARY TABLE")
print("=" * 70)
print(f"{'Test':<40} | {'Lang':<5} | {'Recognized':<20} | {'Acc':<6} | {'Transcribe':<10} | {'Assess':<10}")
print("-" * 100)
for r in results:
    print(f"{r['test']:<40} | {r['lang']:<5} | {r['recognized']:<20} | {r['accuracy']:>5}% | {r['transcribe_ms']:>8}ms | {r['assess_ms']:>8}ms")
print("=" * 70)

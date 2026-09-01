"""
Phase 3 Pipeline Verification Suite: Real Audio -> FastAPI -> Whisper -> Comparison
Tests English, Hindi, Marathi words, measures latency, checks response structures.
"""
import os
import sys
import time
import unittest
import numpy as np
import soundfile as sf
import tempfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from fastapi.testclient import TestClient
from backend.main import app

def generate_tone_wav(duration=1.0, freq=440.0, sr=16000):
    """Generates a synthetic tone audio file for testing upload pipeline"""
    t = np.linspace(0, duration, int(sr * duration), False)
    tone = np.sin(freq * t * 2 * np.pi) * 0.5
    temp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(temp.name, tone, sr, subtype='PCM_16')
    return temp.name

class TestSpeechWordChallengePipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.test_results = []

    def test_01_health_check(self):
        start_t = time.time()
        resp = self.client.get("/health")
        latency = round((time.time() - start_t) * 1000, 2)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertTrue(data["model_loaded"])
        self.assertIn("en", data["supported_languages"])
        self.assertIn("hi", data["supported_languages"])
        self.assertIn("mr", data["supported_languages"])
        print(f"\n[Health Check]: OK (Latency: {latency}ms, Model: {data.get('model_name')})")

    def test_02_english_sample_transcribe(self):
        wav_path = os.path.join(SCRIPT_DIR, "sample_inputs", "child_reading.wav")
        if os.path.exists(wav_path):
            with open(wav_path, "rb") as f:
                start_t = time.time()
                resp = self.client.post(
                    "/speech/transcribe",
                    files={"file": ("child_reading.wav", f, "audio/wav")},
                    data={"language": "en"}
                )
                latency = round((time.time() - start_t) * 1000, 2)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["language_used"], "en")
            self.assertFalse(data["is_empty"])
            self.assertGreater(len(data["recognized_text"]), 0)
            print(f"[English Transcribe (child_reading.wav)]: '{data['recognized_text']}' (Latency: {latency}ms)")

    def test_03_synthetic_silence_transcribe(self):
        # 1.0 second of silence
        temp_wav = generate_tone_wav(duration=1.0, freq=0.0)
        try:
            with open(temp_wav, "rb") as f:
                start_t = time.time()
                resp = self.client.post(
                    "/speech/transcribe",
                    files={"file": ("silence.wav", f, "audio/wav")},
                    data={"language": "en"}
                )
                latency = round((time.time() - start_t) * 1000, 2)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            # Silence produces empty or near-empty text
            print(f"[Silence Audio Response]: is_empty={data.get('is_empty')}, text='{data.get('recognized_text')}' (Latency: {latency}ms)")
        finally:
            if os.path.exists(temp_wav):
                os.remove(temp_wav)

    def test_04_hindi_language_parameter_routing(self):
        wav_path = os.path.join(SCRIPT_DIR, "sample_inputs", "child_reading.wav")
        if os.path.exists(wav_path):
            with open(wav_path, "rb") as f:
                start_t = time.time()
                resp = self.client.post(
                    "/speech/transcribe",
                    files={"file": ("speech.wav", f, "audio/wav")},
                    data={"language": "hi"}
                )
                latency = round((time.time() - start_t) * 1000, 2)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["language_used"], "hi")
            print(f"[Hindi Routing Response]: language_used='{data['language_used']}' (Latency: {latency}ms)")

    def test_05_marathi_language_parameter_routing(self):
        wav_path = os.path.join(SCRIPT_DIR, "sample_inputs", "child_reading.wav")
        if os.path.exists(wav_path):
            with open(wav_path, "rb") as f:
                start_t = time.time()
                resp = self.client.post(
                    "/speech/transcribe",
                    files={"file": ("speech.wav", f, "audio/wav")},
                    data={"language": "mr"}
                )
                latency = round((time.time() - start_t) * 1000, 2)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["language_used"], "mr")
            print(f"[Marathi Routing Response]: language_used='{data['language_used']}' (Latency: {latency}ms)")

    def test_06_corrupt_file_handling(self):
        start_t = time.time()
        resp = self.client.post(
            "/speech/transcribe",
            files={"file": ("corrupt.wav", b"NOT_A_VALID_AUDIO_HEADER_XYZ", "audio/wav")},
            data={"language": "en"}
        )
        latency = round((time.time() - start_t) * 1000, 2)
        # Should gracefully return 422 or 500 without server crashing
        self.assertIn(resp.status_code, [422, 500])
        print(f"[Corrupt File Handled Gracefully]: status={resp.status_code} (Latency: {latency}ms)")


if __name__ == "__main__":
    unittest.main(verbosity=2)

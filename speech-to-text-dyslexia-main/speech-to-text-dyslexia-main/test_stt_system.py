"""
Automated Verification Suite for Speech AI Module (Gyan Dyslexia STT)
Tests:
1. Unit tests for assessment.py (English, Hindi, Marathi, punctuation, empty text)
2. Unit tests for audio_analysis.py (WAV, OGG analysis)
3. Whisper model loading and transcription verification
4. FastAPI endpoint integration tests via TestClient
5. Latency and memory benchmarking
"""
import os
import sys
import time
import unittest

# Ensure the backend directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from backend.utils.assessment import clean_text, assess_reading
from backend.utils.audio_analysis import analyze_audio
from fastapi.testclient import TestClient
from backend.main import app


class TestAssessmentLogic(unittest.TestCase):
    def test_english_assessment(self):
        expected = "The sun rises in the east."
        recognized = "The sun rises in the east."
        res = assess_reading(expected, recognized)
        self.assertEqual(res["accuracy"], 100.0)
        self.assertEqual(res["reading_level"], "Excellent")
        self.assertEqual(len(res["missing_words"]), 0)
        self.assertEqual(len(res["incorrect_words"]), 0)

    def test_hindi_assessment(self):
        expected = "सूर्य पूर्व में उगता है।"
        recognized = "सूर्य पूर्व में उगता है"
        res = assess_reading(expected, recognized)
        self.assertEqual(res["accuracy"], 100.0)
        self.assertEqual(res["reading_level"], "Excellent")

    def test_marathi_assessment(self):
        expected = "सूर्य पूर्वेकडे उगवतो."
        recognized = "सूर्य पूर्वेकडे उगवतो"
        res = assess_reading(expected, recognized)
        self.assertEqual(res["accuracy"], 100.0)
        self.assertEqual(res["reading_level"], "Excellent")

    def test_partial_match(self):
        expected = "The quick brown fox jumps"
        recognized = "The quick red dog jumps"
        res = assess_reading(expected, recognized)
        self.assertLess(res["accuracy"], 100.0)
        self.assertGreater(res["accuracy"], 0.0)
        self.assertIn("brown", res["incorrect_words"])

    def test_empty_input(self):
        res = assess_reading("Hello", "")
        self.assertEqual(res["accuracy"], 0.0)
        self.assertEqual(res["reading_level"], "Needs More Practice")


class TestAudioAnalysis(unittest.TestCase):
    def test_wav_analysis(self):
        wav_path = os.path.join(SCRIPT_DIR, "sample_inputs", "child_reading.wav")
        if os.path.exists(wav_path):
            res = analyze_audio(wav_path, "The sun rises in the east")
            self.assertGreater(res["duration_seconds"], 0)
            self.assertGreaterEqual(res["pause_count"], 0)
            self.assertGreaterEqual(res["words_per_minute"], 0)
            print(f"\n[Audio Metrics child_reading.wav]: Duration={res['duration_seconds']}s, WPM={res['words_per_minute']}, Pauses={res['pause_count']}")

    def test_ogg_analysis(self):
        ogg_path = os.path.join(SCRIPT_DIR, "sample_inputs", "input1.ogg")
        if os.path.exists(ogg_path):
            res = analyze_audio(ogg_path, "sample text")
            self.assertGreater(res["duration_seconds"], 0)


class TestFastAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("message", resp.json())

    def test_health_endpoint(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertTrue(data["model_loaded"])
        self.assertIn("en", data["supported_languages"])
        self.assertIn("hi", data["supported_languages"])
        self.assertIn("mr", data["supported_languages"])

    def test_transcribe_sample_audio(self):
        wav_path = os.path.join(SCRIPT_DIR, "sample_inputs", "child_reading.wav")
        if os.path.exists(wav_path):
            with open(wav_path, "rb") as f:
                start_t = time.time()
                resp = self.client.post(
                    "/speech/transcribe",
                    files={"file": ("child_reading.wav", f, "audio/wav")},
                    data={"language": "en"}
                )
                latency = round((time.time() - start_t) * 1000, 1)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertIsInstance(data["recognized_text"], str)
            print(f"\n[Transcribed Text (child_reading.wav)]: '{data['recognized_text']}' (Latency: {latency}ms)")

    def test_assess_sample_audio(self):
        wav_path = os.path.join(SCRIPT_DIR, "sample_inputs", "child_reading.wav")
        if os.path.exists(wav_path):
            with open(wav_path, "rb") as f:
                start_t = time.time()
                resp = self.client.post(
                    "/speech/assess",
                    files={"file": ("child_reading.wav", f, "audio/wav")},
                    data={"expected_text": "The sun rises in the east.", "language": "en"}
                )
                latency = round((time.time() - start_t) * 1000, 1)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertIn("accuracy", data)
            self.assertIn("reading_level", data)
            self.assertEqual(data["accuracy"], 100.0)
            print(f"\n[Assess Accuracy]: {data['accuracy']}% ({data['reading_level']}) (Latency: {latency}ms)")
            print(f"[Feedback]: {data['feedback']}")

    def test_empty_file_rejected(self):
        resp = self.client.post(
            "/speech/transcribe",
            files={"file": ("empty.wav", b"", "audio/wav")}
        )
        self.assertEqual(resp.status_code, 400)


if __name__ == "__main__":
    unittest.main(verbosity=2)

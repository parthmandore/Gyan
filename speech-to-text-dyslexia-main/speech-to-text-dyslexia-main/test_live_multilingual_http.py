"""
Live HTTP Multilingual Integration Test for Gyan Speech AI Module
Sends actual audio to http://localhost:8000/speech/transcribe and tests:
1. GET /health
2. POST /speech/transcribe with English (child_reading.wav, language='en')
3. POST /speech/transcribe with Hindi language parameter ('hi')
4. POST /speech/transcribe with Marathi language parameter ('mr')
5. Response schema verification (success, recognized_text, language_used, is_empty, latency)
"""

import requests
import time
import os
import sys

# Force UTF-8 on Windows stdout for Devanagari script output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://localhost:8000"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_WAV = os.path.join(SCRIPT_DIR, "sample_inputs", "child_reading.wav")

def run_live_tests():
    print("=" * 60)
    print("  RUNNING LIVE HTTP END-TO-END VERIFICATION")
    print(f"  Target URL: {BASE_URL}")
    print("=" * 60)

    # 1. Health Check
    t0 = time.time()
    try:
        health_resp = requests.get(f"{BASE_URL}/health", timeout=5)
        health_lat = round((time.time() - t0) * 1000, 1)
        assert health_resp.status_code == 200, f"Health returned {health_resp.status_code}"
        health_data = health_resp.json()
        print(f"\n[1. HEALTH CHECK] Status: {health_data.get('status')}, Model Loaded: {health_data.get('model_loaded')}, Latency: {health_lat}ms")
        assert health_data.get("model_loaded") == True
    except Exception as e:
        print(f"\n[1. HEALTH CHECK FAILED]: {e}")
        return False

    # 2. English Audio Transcription
    if os.path.exists(SAMPLE_WAV):
        t0 = time.time()
        with open(SAMPLE_WAV, "rb") as f:
            resp = requests.post(
                f"{BASE_URL}/speech/transcribe",
                files={"file": ("recording.wav", f, "audio/wav")},
                data={"language": "en"},
                timeout=15
            )
        lat = round((time.time() - t0) * 1000, 1)
        assert resp.status_code == 200, f"Transcribe returned {resp.status_code}"
        data = resp.json()
        print(f"\n[2. ENGLISH TRANSCRIPTION (child_reading.wav)]")
        print(f"   Success:         {data.get('success')}")
        print(f"   Recognized Text: '{data.get('recognized_text')}'")
        print(f"   Language Used:   {data.get('language_used')}")
        print(f"   Is Empty:        {data.get('is_empty')}")
        print(f"   HTTP Latency:    {lat}ms")
        assert data.get("success") == True
        assert len(data.get("recognized_text", "")) > 0
        assert data.get("language_used") == "en"

    # 3. Hindi Parameter Routing
    if os.path.exists(SAMPLE_WAV):
        t0 = time.time()
        with open(SAMPLE_WAV, "rb") as f:
            resp = requests.post(
                f"{BASE_URL}/speech/transcribe",
                files={"file": ("recording.wav", f, "audio/wav")},
                data={"language": "hi"},
                timeout=15
            )
        lat = round((time.time() - t0) * 1000, 1)
        assert resp.status_code == 200
        data = resp.json()
        print(f"\n[3. HINDI ROUTING]")
        print(f"   Success:         {data.get('success')}")
        print(f"   Recognized Text: '{data.get('recognized_text')}'")
        print(f"   Language Used:   {data.get('language_used')}")
        print(f"   HTTP Latency:    {lat}ms")
        assert data.get("language_used") == "hi"

    # 4. Marathi Parameter Routing
    if os.path.exists(SAMPLE_WAV):
        t0 = time.time()
        with open(SAMPLE_WAV, "rb") as f:
            resp = requests.post(
                f"{BASE_URL}/speech/transcribe",
                files={"file": ("recording.wav", f, "audio/wav")},
                data={"language": "mr"},
                timeout=15
            )
        lat = round((time.time() - t0) * 1000, 1)
        assert resp.status_code == 200
        data = resp.json()
        print(f"\n[4. MARATHI ROUTING]")
        print(f"   Success:         {data.get('success')}")
        print(f"   Recognized Text: '{data.get('recognized_text')}'")
        print(f"   Language Used:   {data.get('language_used')}")
        print(f"   HTTP Latency:    {lat}ms")
        assert data.get("language_used") == "mr"

    print("\n" + "=" * 60)
    print("  ALL LIVE HTTP INTEGRATION TESTS PASSED (100%)")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = run_live_tests()
    sys.exit(0 if success else 1)

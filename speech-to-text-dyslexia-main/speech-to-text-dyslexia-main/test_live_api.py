import os
import tempfile
import requests
from gtts import gTTS

test_cases = [
    ("bowl", "en", "co.in"),
    ("ball", "en", "co.in"),
    ("bye", "en", "co.in"),
    ("कमळ", "mr", None),
    ("सूरज", "hi", None),
]

for word, lang, tld in test_cases:
    if tld:
        tts = gTTS(text=word, lang=lang, tld=tld)
    else:
        tts = gTTS(text=word, lang=lang)
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    temp_path = temp_file.name
    temp_file.close()
    tts.save(temp_path)

    with open(temp_path, "rb") as f:
        resp = requests.post(
            "http://localhost:8000/speech/transcribe",
            files={"file": ("test.mp3", f, "audio/mpeg")},
            data={"language": lang}
        )

    print(f"Expected: {word:10} | Language: {lang} | Status: {resp.status_code} | Response: {resp.json()}")
    os.remove(temp_path)

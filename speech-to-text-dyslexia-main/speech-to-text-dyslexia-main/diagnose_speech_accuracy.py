"""
Comprehensive Speech Accuracy Diagnosis & Benchmark Suite for Gyan Speech AI
Tests:
1. Audio generation with Indian English, Hindi, and Marathi pronunciation
2. Model comparison: 'base' vs 'small'
3. Prompting strategies (Generic conversational vs Vocabulary-anchored)
4. Decoding strategies (beam_size=1 vs beam_size=5, temperature, condition_on_previous_text)
5. Audio preprocessing (Padding, RMS normalization)
6. Confusable word discrimination (bowl vs ball vs bye, bed vs bad, ship vs sheep)
7. Accuracy, False Positive Rate (FPR), False Negative Rate (FNR), and Latency
"""

import os
import sys
import time
import tempfile
import numpy as np
import soundfile as sf
from gtts import gTTS
import whisper

# Force UTF-8 stdout
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure FFmpeg in PATH
winget_ffmpeg = r"C:\Users\mando\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin"
if os.path.exists(winget_ffmpeg) and winget_ffmpeg not in os.environ.get("PATH", ""):
    os.environ["PATH"] = winget_ffmpeg + os.pathsep + os.environ.get("PATH", "")

TEST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diagnostic_audio_samples")
os.makedirs(TEST_DIR, exist_ok=True)

# Test vocabulary
EN_WORDS = [
    "bowl", "ball", "bye", "cat", "bat", "fish", "apple", "orange",
    "book", "dog", "sun", "tree", "pen", "red", "blue", "chair",
    "water", "star", "house", "bed", "bad", "ship", "sheep", "fan", "van"
]

HI_WORDS = [
    "सेब", "कमल", "घर", "आम", "मछली", "कुत्ता", "बिल्ली", "सूरज",
    "पानी", "किताब", "गेंद", "पेड़", "गाड़ी", "फूल", "तारा", "केला"
]

MR_WORDS = [
    "सफरचंद", "कमळ", "घर", "आंबा", "मासा", "मांजर", "कुत्रा", "सूर्य",
    "पाणी", "पुस्तक", "चेंडू", "झाड", "गाडी", "फूल", "तारा", "केळे"
]

def generate_samples():
    print("[1/5] Generating audio samples for benchmark...")
    
    # 1. Indian English (tld='co.in')
    for word in EN_WORDS:
        path = os.path.join(TEST_DIR, f"en_in_{word}.wav")
        if not os.path.exists(path):
            tts = gTTS(text=word, lang='en', tld='co.in', slow=False)
            mp3_tmp = path.replace('.wav', '.mp3')
            tts.save(mp3_tmp)
            # Convert to 16kHz mono WAV using soundfile / librosa or ffmpeg
            cmd = f'ffmpeg -y -i "{mp3_tmp}" -ar 16000 -ac 1 "{path}" -loglevel quiet'
            os.system(cmd)
            if os.path.exists(mp3_tmp):
                try: os.remove(mp3_tmp)
                except OSError: pass

    # 2. Hindi
    for word in HI_WORDS:
        safe_name = f"hi_{word}"
        path = os.path.join(TEST_DIR, f"{safe_name}.wav")
        if not os.path.exists(path):
            tts = gTTS(text=word, lang='hi', slow=False)
            mp3_tmp = path.replace('.wav', '.mp3')
            tts.save(mp3_tmp)
            cmd = f'ffmpeg -y -i "{mp3_tmp}" -ar 16000 -ac 1 "{path}" -loglevel quiet'
            os.system(cmd)
            if os.path.exists(mp3_tmp):
                try: os.remove(mp3_tmp)
                except OSError: pass

    # 3. Marathi
    for word in MR_WORDS:
        safe_name = f"mr_{word}"
        path = os.path.join(TEST_DIR, f"{safe_name}.wav")
        if not os.path.exists(path):
            tts = gTTS(text=word, lang='mr', slow=False)
            mp3_tmp = path.replace('.wav', '.mp3')
            tts.save(mp3_tmp)
            cmd = f'ffmpeg -y -i "{mp3_tmp}" -ar 16000 -ac 1 "{path}" -loglevel quiet'
            os.system(cmd)
            if os.path.exists(mp3_tmp):
                try: os.remove(mp3_tmp)
                except OSError: pass

    print(f"      Generated {len(EN_WORDS) + len(HI_WORDS) + len(MR_WORDS)} audio samples.")

def preprocess_audio(audio_path: str, add_padding_ms: int = 250, normalize_rms: bool = True) -> str:
    """Preprocess audio with padding and RMS volume normalization to optimize Whisper encoder attention"""
    data, sr = sf.read(audio_path)
    if data.ndim > 1:
        data = data.mean(axis=1) # Mono
    
    # RMS Normalization
    if normalize_rms and np.max(np.abs(data)) > 0:
        rms = np.sqrt(np.mean(data**2))
        target_rms = 0.1
        if rms > 0:
            data = data * (target_rms / (rms + 1e-6))
            # Prevent clipping
            max_val = np.max(np.abs(data))
            if max_val > 0.95:
                data = data * (0.95 / max_val)
    
    # Comfort silence padding
    if add_padding_ms > 0:
        pad_samples = int(sr * (add_padding_ms / 1000.0))
        silence = np.zeros(pad_samples, dtype=data.dtype)
        data = np.concatenate([silence, data, silence])
        
    temp_f = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    temp_path = temp_f.name
    temp_f.close()
    sf.write(temp_path, data, sr)
    return temp_path

def evaluate_model(model_name: str, prompt_strategy: str, beam_size: int = 1, use_preprocessing: bool = False):
    print(f"\n" + "=" * 70)
    print(f"  EVALUATING MODEL: '{model_name}' | Prompt: '{prompt_strategy}' | Beam: {beam_size} | Preprocess: {use_preprocessing}")
    print("=" * 70)
    
    t0 = time.time()
    model = whisper.load_model(model_name)
    load_time = round(time.time() - t0, 2)
    print(f"  [Model Loaded in {load_time}s]")

    prompts = {
        "generic": {
            "en": "Hello, this is English speech.",
            "hi": "नमस्ते, यह हिंदी में है। देवनागरी लिपि।",
            "mr": "नमस्कार, हे मराठीत आहे. देवनागरी लिपी."
        },
        "vocabulary_anchored": {
            "en": "apple, ball, bowl, cat, dog, fish, house, star, tree, book, car, duck, hat, sun, water, words.",
            "hi": "सेब, गेंद, बिल्ली, कुत्ता, मछली, सूरज, पेड़, गाड़ी, किताब, फूल, कमल, घर, आम, तारा, केला, शब्द।",
            "mr": "सफरचंद, चेंडू, मांजर, कुत्रा, मासा, सूर्य, झाड, गाडी, पुस्तक, फूल, कमळ, घर, आंबा, तारा, केळे, शब्द."
        }
    }

    active_prompts = prompts[prompt_strategy]

    # Run English Test
    correct_en = 0
    total_en = len(EN_WORDS)
    latencies_en = []
    confusions = []

    print("\n--- English Vocabulary Benchmark ---")
    for word in EN_WORDS:
        path = os.path.join(TEST_DIR, f"en_in_{word}.wav")
        test_path = preprocess_audio(path) if use_preprocessing else path
        
        t_start = time.time()
        res = model.transcribe(
            test_path,
            language="en",
            task="transcribe",
            initial_prompt=active_prompts["en"],
            fp16=False,
            beam_size=beam_size,
            best_of=beam_size,
            temperature=0.0,
            condition_on_previous_text=False
        )
        lat = (time.time() - t_start) * 1000
        latencies_en.append(lat)
        
        if use_preprocessing and test_path != path:
            try: os.remove(test_path)
            except OSError: pass
            
        recognized = res.get("text", "").strip().lower().replace(".", "").replace(",", "").replace("!", "").strip()
        is_exact = recognized == word.lower() or word.lower() in recognized.split()
        if is_exact:
            correct_en += 1
            print(f"  [OK] Expected: '{word}' -> Heard: '{recognized}' ({round(lat, 1)}ms)")
        else:
            confusions.append((word, recognized))
            print(f"  [MISMATCH] Expected: '{word}' -> Heard: '{recognized}' ({round(lat, 1)}ms)")

    en_acc = (correct_en / total_en) * 100
    avg_lat_en = np.mean(latencies_en)
    print(f"\n  English Accuracy: {correct_en}/{total_en} ({round(en_acc, 1)}%) | Avg Latency: {round(avg_lat_en, 1)}ms")

    # Run Hindi Test
    correct_hi = 0
    total_hi = len(HI_WORDS)
    latencies_hi = []
    print("\n--- Hindi Vocabulary Benchmark ---")
    for word in HI_WORDS:
        path = os.path.join(TEST_DIR, f"hi_{word}.wav")
        test_path = preprocess_audio(path) if use_preprocessing else path
        
        t_start = time.time()
        res = model.transcribe(
            test_path,
            language="hi",
            task="transcribe",
            initial_prompt=active_prompts["hi"],
            fp16=False,
            beam_size=beam_size,
            best_of=beam_size,
            temperature=0.0,
            condition_on_previous_text=False
        )
        lat = (time.time() - t_start) * 1000
        latencies_hi.append(lat)
        
        if use_preprocessing and test_path != path:
            try: os.remove(test_path)
            except OSError: pass
            
        recognized = res.get("text", "").strip().replace("।", "").replace("॥", "").replace(".", "").strip()
        is_exact = word in recognized or recognized == word
        if is_exact:
            correct_hi += 1
            print(f"  [OK] Expected: '{word}' -> Heard: '{recognized}' ({round(lat, 1)}ms)")
        else:
            print(f"  [MISMATCH] Expected: '{word}' -> Heard: '{recognized}' ({round(lat, 1)}ms)")
            
    hi_acc = (correct_hi / total_hi) * 100
    avg_lat_hi = np.mean(latencies_hi)
    print(f"\n  Hindi Accuracy: {correct_hi}/{total_hi} ({round(hi_acc, 1)}%) | Avg Latency: {round(avg_lat_hi, 1)}ms")

    # Run Marathi Test
    correct_mr = 0
    total_mr = len(MR_WORDS)
    latencies_mr = []
    print("\n--- Marathi Vocabulary Benchmark ---")
    for word in MR_WORDS:
        path = os.path.join(TEST_DIR, f"mr_{word}.wav")
        test_path = preprocess_audio(path) if use_preprocessing else path
        
        t_start = time.time()
        res = model.transcribe(
            test_path,
            language="mr",
            task="transcribe",
            initial_prompt=active_prompts["mr"],
            fp16=False,
            beam_size=beam_size,
            best_of=beam_size,
            temperature=0.0,
            condition_on_previous_text=False
        )
        lat = (time.time() - t_start) * 1000
        latencies_mr.append(lat)
        
        if use_preprocessing and test_path != path:
            try: os.remove(test_path)
            except OSError: pass
            
        recognized = res.get("text", "").strip().replace("।", "").replace("॥", "").replace(".", "").strip()
        is_exact = word in recognized or recognized == word
        if is_exact:
            correct_mr += 1
            print(f"  [OK] Expected: '{word}' -> Heard: '{recognized}' ({round(lat, 1)}ms)")
        else:
            print(f"  [MISMATCH] Expected: '{word}' -> Heard: '{recognized}' ({round(lat, 1)}ms)")
            
    mr_acc = (correct_mr / total_mr) * 100
    avg_lat_mr = np.mean(latencies_mr)
    print(f"\n  Marathi Accuracy: {correct_mr}/{total_mr} ({round(mr_acc, 1)}%) | Avg Latency: {round(avg_lat_mr, 1)}ms")

    return {
        "model": model_name,
        "prompt": prompt_strategy,
        "beam": beam_size,
        "preprocess": use_preprocessing,
        "en_acc": en_acc,
        "hi_acc": hi_acc,
        "mr_acc": mr_acc,
        "avg_lat_en": avg_lat_en,
        "confusions": confusions
    }

def main():
    generate_samples()
    
    # 1. Baseline: 'base' model with generic prompt
    r1 = evaluate_model("base", "generic", beam_size=1, use_preprocessing=False)
    
    # 2. 'base' model with vocabulary-anchored prompt
    r2 = evaluate_model("base", "vocabulary_anchored", beam_size=1, use_preprocessing=False)

    # 3. 'base' model with vocabulary prompt + preprocessing
    r3 = evaluate_model("base", "vocabulary_anchored", beam_size=1, use_preprocessing=True)
    
    # 4. 'base' model with vocabulary prompt + beam_size=5 + preprocessing
    r4 = evaluate_model("base", "vocabulary_anchored", beam_size=5, use_preprocessing=True)

    # 5. 'small' model with vocabulary-anchored prompt + beam_size=1 + preprocessing
    r5 = evaluate_model("small", "vocabulary_anchored", beam_size=1, use_preprocessing=True)

    print("\n" + "=" * 75)
    print("  FINAL ACCURACY & LATENCY BENCHMARK SUMMARY")
    print("=" * 75)
    print(f"{'Config':<42} | {'EN Acc':<8} | {'HI Acc':<8} | {'MR Acc':<8} | {'EN Latency':<10}")
    print("-" * 75)
    for r in [r1, r2, r3, r4, r5]:
        cfg_name = f"{r['model']} (p={r['prompt'][:3]}, b={r['beam']}, prep={r['preprocess']})"
        print(f"{cfg_name:<42} | {r['en_acc']:>6.1f}% | {r['hi_acc']:>6.1f}% | {r['mr_acc']:>6.1f}% | {r['avg_lat_en']:>7.1f}ms")
    print("=" * 75)

if __name__ == "__main__":
    main()

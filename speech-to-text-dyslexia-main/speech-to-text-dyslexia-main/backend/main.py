import os
import sys

# Ensure backend package directory and ffmpeg are in PATH
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

# Auto-detect winget ffmpeg path if not already in system PATH
winget_ffmpeg = r"C:\Users\mando\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin"
if os.path.exists(winget_ffmpeg) and winget_ffmpeg not in os.environ.get("PATH", ""):
    os.environ["PATH"] = winget_ffmpeg + os.pathsep + os.environ.get("PATH", "")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.speech_api import router as speech_router

app = FastAPI(
    title="Speech AI Module",
    description="Speech-to-Text API for Gyan Educational Application",
    version="1.1.0"
)

# --- CORS Middleware for Expo Web & Mobile Development ---
origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:19000",
    "http://127.0.0.1:19000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

env_origins = os.environ.get("CORS_ORIGINS")
if env_origins:
    origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])
else:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    speech_router,
    prefix="/speech",
    tags=["Speech"]
)


# --- Health check endpoints ---
@app.get("/")
def home():
    return {
        "message": "Speech AI Module is running",
        "version": "1.1.0",
        "endpoints": [
            "/speech/transcribe (POST)",
            "/speech/assess (POST)",
            "/health (GET)"
        ]
    }


@app.get("/health")
def health():
    from backend.api.speech_api import model, MODEL_NAME
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_name": MODEL_NAME,
        "supported_languages": ["en", "hi", "mr"],
        "version": "1.1.0"
    }
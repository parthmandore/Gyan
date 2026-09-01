@echo off
REM Startup script for Gyan Speech AI Module
cd /d "%~dp0"
set "PATH=C:\Users\mando\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin;%PATH%"
set "PYTHONIOENCODING=utf-8"
set "WHISPER_MODEL=base"

echo ============================================================
echo   Starting Gyan Speech AI Module (FastAPI + Whisper)
echo   Listening on: http://localhost:8000
echo   Docs:         http://localhost:8000/docs
echo   Health:       http://localhost:8000/health
echo ============================================================

.\venv\Scripts\uvicorn.exe backend.main:app --host 0.0.0.0 --port 8000 --reload

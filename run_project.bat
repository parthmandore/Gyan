@echo off
title Gyan Educational Platform - Launcher
color 0B
cls
echo ======================================================================
echo                  GYAN MULTILINGUAL LEARNING PLATFORM
echo ======================================================================
echo.
echo  [1/3] Starting Speech Recognition Backend (FastAPI + Whisper Medium)...
start "Gyan Speech Backend (Port 8000)" cmd /k "cd /d %~dp0speech-to-text-dyslexia-main\speech-to-text-dyslexia-main && venv\Scripts\activate && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

echo  [2/3] Starting Frontend Web Server (Expo Web on Port 8081)...
start "Gyan Frontend Web (Port 8081)" cmd /k "cd /d %~dp0frontend && npx expo start --web --port 8081"

echo  [3/3] Opening Web Browser at http://localhost:8081 ...
timeout /t 4 /nobreak >nul
start http://localhost:8081

echo.
echo ======================================================================
echo   SUCCESS: Both services are launching!
echo   - Web Application: http://localhost:8081
echo   - Speech Backend:  http://localhost:8000/health
echo ======================================================================
echo.
pause

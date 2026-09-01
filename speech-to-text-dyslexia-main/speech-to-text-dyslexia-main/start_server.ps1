# PowerShell startup script for Gyan Speech AI Module
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$env:PATH = "C:\Users\mando\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin;" + $env:PATH
$env:PYTHONIOENCODING = "utf-8"
$env:WHISPER_MODEL = if ($env:WHISPER_MODEL) { $env:WHISPER_MODEL } else { "base" }

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting Gyan Speech AI Module (FastAPI + Whisper)" -ForegroundColor Green
Write-Host "  Listening on: http://localhost:8000" -ForegroundColor Yellow
Write-Host "  API Docs:     http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  Health Check: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

& ".\venv\Scripts\uvicorn.exe" backend.main:app --host 0.0.0.0 --port 8000 --reload

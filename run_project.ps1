# Gyan 1-Click PowerShell Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                GYAN MULTILINGUAL LEARNING PLATFORM                   " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
$backendPath = Join-Path $rootPath "speech-to-text-dyslexia-main\speech-to-text-dyslexia-main"
$frontendPath = Join-Path $rootPath "frontend"

Write-Host " [1/3] Starting Speech Recognition Backend (FastAPI + Whisper)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d `"$backendPath`" && venv\Scripts\activate && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

Write-Host " [2/3] Starting Frontend Web Server (Expo Web on Port 8081)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d `"$frontendPath`" && npx expo start --web --port 8081"

Write-Host " [3/3] Opening Web Browser at http://localhost:8081 ..." -ForegroundColor Cyan
Start-Sleep -Seconds 4
Start-Process "http://localhost:8081"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: Both services have started!" -ForegroundColor Green
Write-Host " - Frontend: http://localhost:8081" -ForegroundColor White
Write-Host " - Backend:  http://localhost:8000/health" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

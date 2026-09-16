# 🔌 "Speech Helper is Resting" — Troubleshooting Guide

When playing the **Speech Word Challenge** game, you may see:
> **"🔌 Speech helper is resting. Tap to retry!"**

This message appears when the **Speech-to-Text (STT) backend** cannot be reached or fails to respond. Here's how to fix it:

---

## ✅ Quick Checklist

- [ ] Backend server is running (`npm run start` in `speech-to-text-dyslexia-main/backend`)
- [ ] Backend is healthy: `curl http://localhost:8000/health`
- [ ] Backend is at the correct URL
- [ ] Mobile device has correct `EXPO_PUBLIC_STT_API_URL` configured
- [ ] Internet/network connection is stable

---

## 🔍 Common Causes & Fixes

### **1. Backend Server Not Running**

**Problem:** The speech processing server hasn't started yet.

**Fix:**
```powershell
# Navigate to backend directory
cd speech-to-text-dyslexia-main/speech-to-text-dyslexia-main/backend

# Activate Python environment
.\venv\Scripts\activate

# Start the server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
# OR use the PowerShell script:
..\start_server.ps1
```

**Verify it's running:**
```powershell
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_name": "medium",
  "supported_languages": ["en", "hi", "mr"],
  "version": "1.1.0"
}
```

---

### **2. Playing on Physical Mobile Device or Emulator**

**Problem:** The phone/emulator cannot reach `localhost:8000` on your development computer.

#### **For Android Emulator:**
- Automatically handled by the frontend code
- Backend should be accessible at `http://10.0.2.2:8000` (special loopback)

#### **For Physical Mobile Device (Expo Go):**
1. Find your computer's **Local Network IP Address**:
   ```powershell
   ipconfig
   # Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)
   ```

2. Create or edit `.env` file in the frontend directory:
   ```
   EXPO_PUBLIC_STT_API_URL=http://192.168.1.100:8000
   # Replace 192.168.1.100 with YOUR computer's IP
   ```

3. Restart the Expo development server:
   ```
   npm start
   ```

---

### **3. Timeout (Request Takes Too Long)**

**Problem:** The Whisper model processing exceeds the timeout.

**Recent Fix:** 
- ✅ `frontend`: 60 seconds (updated)
- ✅ `FrontendN`: 90 seconds (just updated)

If you're still seeing timeouts, the backend may be overloaded. Try:
- Restart the backend
- Close other applications consuming CPU/memory
- Check if Whisper model is fully loaded

---

### **4. Backend Crashes or Returns 500 Error**

**Problem:** The backend encounters an error during transcription.

**Fix:**
1. Check the backend console for error messages
2. Restart the backend:
   ```powershell
   # Kill the process and restart
   ..\start_server.ps1
   ```
3. Check if all dependencies are installed:
   ```
   pip install -r requirements.txt
   ```

---

## 📊 Browser Console Diagnostics

When using the **web version**, open the browser console (`F12` → Console) and look for `[sttService]` logs:

```
[sttService] Checking health at: http://localhost:8000/health
[sttService] Health check OK: {...}
[sttService] Transcribing audio (attempt 1/3) at http://localhost:8000/speech/transcribe, language=en
[sttService] Transcription SUCCESS (7305ms): "apple"
```

**If you see errors like:**
- `CONNECTION_REFUSED` → Backend is not running
- `TIMEOUT` → Backend is too slow or unreachable
- `NETWORK_ERROR` → Network connectivity issue

---

## 🚀 Verify Everything Works

Run this complete test:

```powershell
# 1. Backend is running
curl http://localhost:8000/health

# 2. Test with a sample audio file
curl -F "file=@speech-to-text-dyslexia-main/speech-to-text-dyslexia-main/sample_inputs/test_en_apple.mp3" `
     -F "language=en" `
     http://localhost:8000/speech/transcribe

# Expected response:
# {"success":true,"recognized_text":"apple","language_used":"en","is_empty":false}
```

---

## 📝 Configuration Summary

| Scenario | URL | How to Set |
|----------|-----|-----------|
| **Web (localhost)** | `http://localhost:8000` | Default (no action needed) |
| **Android Emulator** | `http://10.0.2.2:8000` | Auto-detected |
| **Physical Phone (LAN)** | `http://YOUR_IP:8000` | Set in `.env`: `EXPO_PUBLIC_STT_API_URL=http://192.168.x.x:8000` |

---

## 💡 Pro Tips

1. **Keep backend running** — Start it once and leave it running while you develop
2. **Check network** — Ensure your phone and computer are on the same Wi-Fi network
3. **Monitor logs** — Watch the backend console for transcription details
4. **Restart on changes** — After changing `.env`, restart Expo with `npm start`

---

## 🆘 Still Having Issues?

1. Check console logs for `[sttService]` messages (provides exact error details)
2. Verify backend health endpoint manually
3. Test with a sample audio file (see "Verify Everything Works" section)
4. Ensure firewall isn't blocking port 8000

---

**Last Updated:** 2026-09-10  
**Version:** STT Service v1.2 (with automatic retry logic)

/**
 * Purpose: Robust Speech-to-Text (STT) Client Service for communicating with
 *          the Gyan FastAPI Whisper backend with comprehensive error classification,
 *          accurate latency profiling, and environment-aware configuration.
 * Module: Services
 * Folder: frontend/src/services
 */

import { Platform } from 'react-native';
import { API_CONFIG } from '../config/apiConfig';

export type STTErrorType =
  | 'NONE'
  | 'CONNECTION_REFUSED'
  | 'TIMEOUT'
  | 'BAD_REQUEST'
  | 'PAYLOAD_TOO_LARGE'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

export interface TranscribeResponse {
  success: boolean;
  recognized_text: string;
  language_used: string;
  is_empty: boolean;
  latency_ms: number;
  error_type: STTErrorType;
  status_code?: number;
  error?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error' | 'offline';
  model_loaded: boolean;
  model_name?: string;
  supported_languages?: string[];
  version?: string;
  error?: string;
}

/**
 * Checks if the Speech AI backend is reachable and the Whisper model is loaded.
 */
export const checkSTTHealth = async (): Promise<HealthResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_CONFIG.STT_BASE_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        status: data.status === 'ok' ? 'ok' : 'error',
        model_loaded: Boolean(data.model_loaded),
        model_name: data.model_name,
        supported_languages: data.supported_languages,
        version: data.version,
      };
    }
    return {
      status: 'error',
      model_loaded: false,
      error: `Health check returned HTTP ${response.status}`,
    };
  } catch (err: any) {
    return {
      status: 'offline',
      model_loaded: false,
      error: err.name === 'AbortError' ? 'Health check timed out' : err.message || 'Connection refused',
    };
  }
};

/**
 * Sends a recorded audio file/blob to the Speech AI backend for Whisper transcription.
 * Supports English ('en'), Hindi ('hi'), and Marathi ('mr').
 */
export const transcribeAudio = async (
  audioData: Blob | string,
  language: 'en' | 'hi' | 'mr' = 'en',
  timeoutMs: number = API_CONFIG.TIMEOUT_MS
): Promise<TranscribeResponse> => {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const formData = new FormData();

    if (Platform.OS === 'web' && audioData instanceof Blob) {
      // Direct Web MediaRecorder Opus/WebM blob
      const ext = audioData.type.includes('ogg') ? 'ogg' : audioData.type.includes('wav') ? 'wav' : 'webm';
      formData.append('file', audioData, `recording.${ext}`);
    } else if (Platform.OS === 'web' && typeof audioData === 'string') {
      // In web, if URI is a blob URL, fetch the actual blob
      const res = await fetch(audioData);
      const blob = await res.blob();
      const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('wav') ? 'wav' : 'webm';
      formData.append('file', blob, `recording.${ext}`);
    } else {
      // Mobile (Android / iOS)
      const filename = typeof audioData === 'string' && audioData.endsWith('.wav') ? 'recording.wav' : 'recording.m4a';
      formData.append('file', {
        uri: audioData,
        name: filename,
        type: filename.endsWith('.wav') ? 'audio/wav' : 'audio/m4a',
      } as any);
    }

    formData.append('language', language);

    const response = await fetch(`${API_CONFIG.STT_BASE_URL}/speech/transcribe`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency_ms = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      let error_type: STTErrorType = 'SERVER_ERROR';

      if (response.status === 400) error_type = 'BAD_REQUEST';
      else if (response.status === 413) error_type = 'PAYLOAD_TOO_LARGE';
      else if (response.status >= 500) error_type = 'SERVER_ERROR';

      console.warn(`[sttService] HTTP ${response.status} Error:`, errText);

      return {
        success: false,
        recognized_text: '',
        language_used: language,
        is_empty: false, // Network/HTTP error is NOT empty speech
        latency_ms,
        error_type,
        status_code: response.status,
        error: `Server responded with status ${response.status}: ${errText}`,
      };
    }

    const data = await response.json();
    const recognized = (data.recognized_text || '').trim();
    const is_empty = Boolean(data.is_empty) || recognized.length === 0;

    return {
      success: true,
      recognized_text: recognized,
      language_used: data.language_used || language,
      is_empty,
      latency_ms,
      error_type: 'NONE',
      status_code: 200,
    };
  } catch (err: any) {
    const latency_ms = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    const isConnectionRefused =
      err.message?.toLowerCase().includes('failed to fetch') ||
      err.message?.toLowerCase().includes('network') ||
      err.message?.toLowerCase().includes('refused');

    const error_type: STTErrorType = isTimeout
      ? 'TIMEOUT'
      : isConnectionRefused
      ? 'CONNECTION_REFUSED'
      : 'NETWORK_ERROR';

    console.warn(`[sttService] ${error_type}:`, err.message);

    return {
      success: false,
      recognized_text: '',
      language_used: language,
      is_empty: false, // Connection failure is NOT empty speech
      latency_ms,
      error_type,
      error: isTimeout
        ? 'Speech-to-Text request timed out'
        : `Cannot connect to Speech AI server at ${API_CONFIG.STT_BASE_URL} (${err.message})`,
    };
  }
};

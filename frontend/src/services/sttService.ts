/**
 * Purpose: Robust Speech-to-Text (STT) Client Service for communicating with
 *          the Gyan FastAPI Whisper backend with comprehensive error classification,
 *          accurate latency profiling, and environment-aware configuration.
 *          Native mobile uses XMLHttpRequest to avoid Expo fetch FormDataPart limitations.
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
 * Suppresses console warnings when canceled intentionally via AbortController.
 */
export const checkSTTHealth = async (): Promise<HealthResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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
    const isAborted =
      err?.name === 'AbortError' ||
      err?.message?.toLowerCase().includes('cancel') ||
      err?.message?.toLowerCase().includes('abort');

    if (!isAborted) {
      console.warn(`[sttService] Health check unreachable:`, err?.message || err);
    }

    return {
      status: 'offline',
      model_loaded: false,
      error: isAborted ? 'Health check timed out' : err?.message || 'Connection refused',
    };
  }
};

/**
 * Native XMLHttpRequest upload wrapper for Android and iOS.
 * React Native's XMLHttpRequest natively delegates { uri, name, type } to OkHttp / NSURLSession,
 * bypassing Expo SDK 57 fetch's "Unsupported FormDataPart implementation" error.
 */
interface XHRResponse {
  status: number;
  text: string;
}

const sendNativeXHR = (
  url: string,
  formData: FormData,
  timeoutMs: number
): Promise<XHRResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = timeoutMs;
    xhr.setRequestHeader('Accept', 'application/json');
    // Note: Never set Content-Type so OkHttp automatically generates the multipart boundary.

    xhr.onload = () => {
      resolve({
        status: xhr.status,
        text: xhr.responseText || '',
      });
    };

    xhr.onerror = () => {
      reject(new Error(`Network request failed (${xhr.status || 0})`));
    };

    xhr.ontimeout = () => {
      const err: any = new Error(`Request timed out after ${timeoutMs}ms`);
      err.name = 'AbortError';
      reject(err);
    };

    xhr.onabort = () => {
      const err: any = new Error('Request aborted');
      err.name = 'AbortError';
      reject(err);
    };

    xhr.send(formData);
  });
};

/**
 * Sends a recorded audio file/blob to the Speech AI backend for Whisper transcription.
 * Supports English ('en'), Hindi ('hi'), and Marathi ('mr').
 * Native mobile uses XMLHttpRequest for multipart streaming; Web uses fetch.
 */
export const transcribeAudio = async (
  audioData: Blob | string,
  language: 'en' | 'hi' | 'mr' = 'en',
  timeoutMs: number = API_CONFIG.TIMEOUT_MS,
  retryCount: number = 0
): Promise<TranscribeResponse> => {
  const startTime = Date.now();
  const maxRetries = 2;

  // 1. Validate audio input upfront before attempting network transmission
  if (!audioData) {
    return {
      success: false,
      recognized_text: '',
      language_used: language,
      is_empty: true,
      latency_ms: 0,
      error_type: 'BAD_REQUEST',
      error: 'No audio data provided for transcription.',
    };
  }

  if (typeof audioData === 'string' && audioData.trim().length === 0) {
    return {
      success: false,
      recognized_text: '',
      language_used: language,
      is_empty: true,
      latency_ms: 0,
      error_type: 'BAD_REQUEST',
      error: 'Audio file URI is empty.',
    };
  }

  try {
    const formData = new FormData();
    const isWeb = Platform.OS === 'web';

    if (isWeb && audioData instanceof Blob) {
      const ext = audioData.type.includes('ogg') ? 'ogg' : audioData.type.includes('wav') ? 'wav' : 'webm';
      formData.append('file', audioData, `recording.${ext}`);
    } else if (isWeb && typeof audioData === 'string') {
      const res = await fetch(audioData);
      const blob = await res.blob();
      const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('wav') ? 'wav' : 'webm';
      formData.append('file', blob, `recording.${ext}`);
    } else {
      // Mobile native (Android / iOS): Use React Native's { uri, name, type } object
      const uri = String(audioData);
      const isWav = uri.toLowerCase().endsWith('.wav');
      const filename = isWav ? 'recording.wav' : 'recording.m4a';
      const mimeType = isWav ? 'audio/wav' : 'audio/m4a';

      formData.append('file', {
        uri,
        name: filename,
        type: mimeType,
      } as any);
    }

    formData.append('language', language);

    const transcribeUrl = `${API_CONFIG.STT_BASE_URL}/speech/transcribe`;
    let responseStatus: number;
    let responseText: string;

    if (isWeb) {
      // Standard fetch on Web
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(transcribeUrl, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      responseStatus = response.status;
      responseText = await response.text();
    } else {
      // Native Mobile: OkHttp via XMLHttpRequest
      const xhrRes = await sendNativeXHR(transcribeUrl, formData, timeoutMs);
      responseStatus = xhrRes.status;
      responseText = xhrRes.text;
    }

    const latency_ms = Date.now() - startTime;

    // Handle non-2xx HTTP responses
    if (responseStatus < 200 || responseStatus >= 300) {
      let error_type: STTErrorType = 'SERVER_ERROR';
      if (responseStatus === 400) error_type = 'BAD_REQUEST';
      else if (responseStatus === 413) error_type = 'PAYLOAD_TOO_LARGE';
      else if (responseStatus >= 500) error_type = 'SERVER_ERROR';

      // Strictly retry ONLY on 5xx server errors, never 4xx client errors
      if (responseStatus >= 500 && retryCount < maxRetries) {
        if (__DEV__) console.warn(`[sttService] Retrying on HTTP ${responseStatus} (attempt ${retryCount + 1}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, 600));
        return transcribeAudio(audioData, language, timeoutMs, retryCount + 1);
      }

      return {
        success: false,
        recognized_text: '',
        language_used: language,
        is_empty: false,
        latency_ms,
        error_type,
        status_code: responseStatus,
        error: `Server responded with HTTP ${responseStatus}: ${responseText.slice(0, 200)}`,
      };
    }

    // Parse JSON response
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        recognized_text: '',
        language_used: language,
        is_empty: false,
        latency_ms,
        error_type: 'SERVER_ERROR',
        error: 'Invalid JSON response from speech server.',
      };
    }

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
    const isTimeout = err?.name === 'AbortError' || err?.message?.toLowerCase().includes('time');
    const isConnectionRefused =
      err?.message?.toLowerCase().includes('failed to fetch') ||
      err?.message?.toLowerCase().includes('network') ||
      err?.message?.toLowerCase().includes('refused');

    const error_type: STTErrorType = isTimeout
      ? 'TIMEOUT'
      : isConnectionRefused
      ? 'CONNECTION_REFUSED'
      : 'NETWORK_ERROR';

    // Retry transient network or timeout errors only
    if ((isConnectionRefused || isTimeout) && retryCount < maxRetries) {
      if (__DEV__) console.warn(`[sttService] Retrying transient ${error_type} (attempt ${retryCount + 1}/${maxRetries})...`);
      await new Promise((r) => setTimeout(r, 800));
      return transcribeAudio(audioData, language, timeoutMs, retryCount + 1);
    }

    return {
      success: false,
      recognized_text: '',
      language_used: language,
      is_empty: false,
      latency_ms,
      error_type,
      error: isTimeout
        ? `Speech transcription timed out after ${latency_ms}ms`
        : `Could not reach speech server at ${API_CONFIG.STT_BASE_URL} (${err?.message || 'Network error'})`,
    };
  }
};

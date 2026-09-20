import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Resolve the correct API base URL:
 * - Env var EXPO_PUBLIC_API_URL takes priority
 * - Android emulator uses 10.0.2.2 (loopback to host machine)
 * - All other platforms (web, iOS simulator) use localhost
 * - Backend runs on port 8000 (FastAPI/Uvicorn)
 */
const getBaseURL = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  return `http://${host}:8000`;
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Suppress unhandled network rejections for offline/background sync
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Graceful offline fallback
    return Promise.resolve({ data: null, error: error?.message || 'Network unavailable' });
  }
);

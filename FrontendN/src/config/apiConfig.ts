import { Platform } from 'react-native';

const normalizeUrl = (url: string): string =>
  url.replace(/\/+$/, '');

const getDefaultMainApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  // Android Emulator can access the host machine through 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
};

const getDefaultSTTUrl = (): string => {
  if (process.env.EXPO_PUBLIC_STT_API_URL) {
    return normalizeUrl(process.env.EXPO_PUBLIC_STT_API_URL);
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

export const API_CONFIG = {
  MAIN_API_URL: getDefaultMainApiUrl(),
  STT_BASE_URL: getDefaultSTTUrl(),
  TIMEOUT_MS: 25000,
} as const;
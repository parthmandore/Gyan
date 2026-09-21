/**
 * Purpose: Centralized API configuration for Gyan application and Speech AI services.
 * Supports: Local web development (localhost), Android emulator (10.0.2.2),
 *           and physical mobile LAN IP via EXPO_PUBLIC_STT_API_URL.
 * Module: Config
 * Folder: frontend/src/config
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDefaultSTTUrl = (): string => {
  if (process.env.EXPO_PUBLIC_STT_API_URL) {
    return process.env.EXPO_PUBLIC_STT_API_URL.replace(/\/+$/, '');
  }

  // On Web, default to localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  // On native mobile (physical Android/iOS device connected to Metro)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000`;
    }
  }

  // Android emulator loopback to host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

export const API_CONFIG = {
  STT_BASE_URL: getDefaultSTTUrl(),
  MAIN_API_URL: (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  TIMEOUT_MS: 25000,
} as const;

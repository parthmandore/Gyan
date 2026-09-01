/**
 * Purpose: Centralized API configuration for Gyan application and Speech AI services.
 * Supports: Local web development (localhost), Android emulator (10.0.2.2),
 *           and physical mobile LAN IP via EXPO_PUBLIC_STT_API_URL.
 * Module: Config
 * Folder: frontend/src/config
 */

import { Platform } from 'react-native';

const getDefaultSTTUrl = (): string => {
  if (process.env.EXPO_PUBLIC_STT_API_URL) {
    return process.env.EXPO_PUBLIC_STT_API_URL.replace(/\/+$/, '');
  }
  // Android emulator loopback to host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  // Web and iOS local default
  return 'http://localhost:8000';
};

export const API_CONFIG = {
  STT_BASE_URL: getDefaultSTTUrl(),
  MAIN_API_URL: (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  TIMEOUT_MS: 15000,
} as const;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_CONFIG } from '../config/apiConfig';

export const AUTH_TOKEN_KEY = '@gyan_auth_token';

export const apiClient = axios.create({
  baseURL: API_CONFIG.MAIN_API_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the saved JWT to authenticated requests.
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  apiClient,
  AUTH_TOKEN_KEY,
} from './apiClient';

export type UserRole = 'student' | 'parent' | 'teacher';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age?: number;
  language?: string;
  xpTotal?: number;
  level?: number;
  streak?: number;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
}

interface MeResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export const authService = {
  async login(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const response =
      await apiClient.post<LoginResponse>(
        '/api/auth/login',
        {
          email: email.trim().toLowerCase(),
          password,
        },
      );

    const result = response.data;

    if (!result.success || !result.data?.token) {
      throw new Error(
        result.message || 'Login failed',
      );
    }

    await AsyncStorage.setItem(
      AUTH_TOKEN_KEY,
      result.data.token,
    );

    return result.data.user;
  },

  async getMe(): Promise<AuthUser> {
    const response =
      await apiClient.get<MeResponse>(
        '/api/auth/me',
      );

    const result = response.data;

    if (!result.success || !result.data?.user) {
      throw new Error(
        'Unable to retrieve user profile',
      );
    }

    return result.data.user;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(
      AUTH_TOKEN_KEY,
    );
  },

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(
      AUTH_TOKEN_KEY,
    );
  },
};

export default authService;
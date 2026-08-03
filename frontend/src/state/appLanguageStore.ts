/**
 * Purpose: Central App Language Store using Zustand & AsyncStorage persistence.
 * Module: State Management
 * Folder: frontend/src/state
 */

import { create } from 'zustand';

export type AppLanguage = 'en' | 'hi' | 'mr';

const STORAGE_KEY = '@gyan_app_language';

const getI18n = () => {
  try {
    return require('../localization/i18n').default;
  } catch {
    return null;
  }
};

/**
 * Single, swappable persistence check function for initial app language retrieval.
 * NOTE: When integrated into the main production platform, this function will likely
 * be replaced by reading the user's language choice from their onboarding form/profile
 * instead of device-local AsyncStorage. Keep this read source isolated!
 */
export const getInitialLanguage = async (): Promise<AppLanguage | null> => {
  try {
    let stored: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        stored = await AsyncStorage.getItem(STORAGE_KEY);
      } catch {
        // Native AsyncStorage fallback
      }
    }

    if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
      return stored as AppLanguage;
    }
  } catch (err) {
    console.warn('[appLanguageStore] Error reading initial language:', err);
  }
  return null;
};

/**
 * Persists selected language to local storage.
 */
export const setPersistedLanguage = async (lang: AppLanguage): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Storage fallback
      }
    }
  } catch (err) {
    console.warn('[appLanguageStore] Error saving persisted language:', err);
  }
};

export interface AppLanguageState {
  selectedLanguage: AppLanguage | null;
  isInitialized: boolean;
  initLanguage: () => Promise<AppLanguage | null>;
  setSelectedLanguage: (lang: AppLanguage) => Promise<void>;
}

export const useAppLanguageStore = create<AppLanguageState>((set, get) => ({
  selectedLanguage: null,
  isInitialized: false,

  initLanguage: async () => {
    const lang = await getInitialLanguage();
    if (lang) {
      set({ selectedLanguage: lang, isInitialized: true });
      const i18nInstance = getI18n();
      if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
        i18nInstance.changeLanguage(lang);
      }
      try {
        const { LanguageManager } = require('../language/LanguageManager');
        const mapped = lang === 'hi' ? 'hindi' : lang === 'mr' ? 'marathi' : 'english';
        LanguageManager.setLanguage(mapped);
      } catch {}
    } else {
      set({ isInitialized: true });
    }
    return lang;
  },

  setSelectedLanguage: async (lang: AppLanguage) => {
    set({ selectedLanguage: lang });
    await setPersistedLanguage(lang);

    const i18nInstance = getI18n();
    if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
      i18nInstance.changeLanguage(lang);
    }

    try {
      const { LanguageManager } = require('../language/LanguageManager');
      const mapped = lang === 'hi' ? 'hindi' : lang === 'mr' ? 'marathi' : 'english';
      LanguageManager.setLanguage(mapped);
    } catch {}
  },
}));

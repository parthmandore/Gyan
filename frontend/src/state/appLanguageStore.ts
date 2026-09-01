/**
 * Purpose: Central App Language & Age Store using Zustand & AsyncStorage persistence.
 * Module: State Management
 * Folder: frontend/src/state
 */

import { create } from 'zustand';

export type AppLanguage = 'en' | 'hi' | 'mr';
export type AppAge = 5 | 6;

const LANGUAGE_STORAGE_KEY = '@gyan_app_language';
const AGE_STORAGE_KEY = '@gyan_app_age';

const getI18n = () => {
  try {
    return require('../localization/i18n').default;
  } catch {
    return null;
  }
};

/**
 * Persistence check function for initial app language retrieval.
 */
export const getInitialLanguage = async (): Promise<AppLanguage | null> => {
  try {
    let stored: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
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
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      } catch {
        // Storage fallback
      }
    }
  } catch (err) {
    console.warn('[appLanguageStore] Error saving persisted language:', err);
  }
};

/**
 * Persistence check function for initial app age retrieval.
 */
export const getInitialAge = async (): Promise<AppAge | null> => {
  try {
    let stored: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      stored = window.localStorage.getItem(AGE_STORAGE_KEY);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        stored = await AsyncStorage.getItem(AGE_STORAGE_KEY);
      } catch {
        // Native AsyncStorage fallback
      }
    }

    if (stored && (stored === '5' || stored === '6')) {
      return parseInt(stored, 10) as AppAge;
    }
  } catch (err) {
    console.warn('[appLanguageStore] Error reading initial age:', err);
  }
  return null;
};

/**
 * Persists selected age to local storage.
 */
export const setPersistedAge = async (age: AppAge): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(AGE_STORAGE_KEY, age.toString());
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(AGE_STORAGE_KEY, age.toString());
      } catch {
        // Storage fallback
      }
    }
  } catch (err) {
    console.warn('[appLanguageStore] Error saving persisted age:', err);
  }
};

export interface AppLanguageState {
  selectedLanguage: AppLanguage | null;
  selectedAge: AppAge | null;
  isInitialized: boolean;
  initLanguage: () => Promise<AppLanguage | null>;
  initAge: () => Promise<AppAge | null>;
  setSelectedLanguage: (lang: AppLanguage) => Promise<void>;
  setSelectedAge: (age: AppAge) => Promise<void>;
}

export const useAppLanguageStore = create<AppLanguageState>((set, get) => ({
  selectedLanguage: null,
  selectedAge: null,
  isInitialized: false,

  initLanguage: async () => {
    const lang = await getInitialLanguage();
    const age = await getInitialAge();

    set({
      selectedLanguage: lang,
      selectedAge: age ?? 5, // Default to age 5 if unset
      isInitialized: true,
    });

    if (lang) {
      const i18nInstance = getI18n();
      if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
        i18nInstance.changeLanguage(lang);
      }
      try {
        const { LanguageManager } = require('../language/LanguageManager');
        const mapped = lang === 'hi' ? 'hindi' : lang === 'mr' ? 'marathi' : 'english';
        LanguageManager.setLanguage(mapped);
      } catch {}
    }
    return lang;
  },

  initAge: async () => {
    const age = await getInitialAge();
    if (age) {
      set({ selectedAge: age });
    }
    return age;
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

  setSelectedAge: async (age: AppAge) => {
    set({ selectedAge: age });
    await setPersistedAge(age);
  },
}));

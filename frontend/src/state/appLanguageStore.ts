/**
 * Purpose: Central App Language & Age Store using Zustand & AsyncStorage persistence.
 *          Supports Universal Dual-Language Architecture:
 *          - Mother Tongue (App Language): Governs UI, tutorials, buttons, feedback, and spoken instructional cues.
 *          - Learning Language: Governs learning content, target vocabulary, STT evaluation, and target pronunciation.
 * Module: State Management
 * Folder: frontend/src/state
 */

import { create } from 'zustand';

export type AppLanguage = 'en' | 'hi' | 'mr';
export type LearningLanguage = 'en' | 'hi' | 'mr';
export type AppAge = 5 | 6;

const MOTHER_TONGUE_STORAGE_KEY = '@gyan_mother_tongue';
const LEARNING_LANGUAGE_STORAGE_KEY = '@gyan_learning_language';
const LEGACY_LANGUAGE_STORAGE_KEY = '@gyan_app_language';
const AGE_STORAGE_KEY = '@gyan_app_age';

const getI18n = () => {
  try {
    return require('../localization/i18n').default;
  } catch {
    return null;
  }
};

const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(key);
  } catch (err) {
    console.warn(`[appLanguageStore] Error reading storage key ${key}:`, err);
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[appLanguageStore] Error writing storage key ${key}:`, err);
  }
};

/**
 * Retrieves initial mother tongue / app language with legacy fallback.
 */
export const getInitialMotherTongue = async (): Promise<AppLanguage | null> => {
  let stored = await getStorageItem(MOTHER_TONGUE_STORAGE_KEY);
  if (!stored) {
    stored = await getStorageItem(LEGACY_LANGUAGE_STORAGE_KEY);
  }
  if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
    return stored as AppLanguage;
  }
  return null;
};

/**
 * Retrieves initial learning language with legacy fallback.
 */
export const getInitialLearningLanguage = async (): Promise<LearningLanguage | null> => {
  const stored = await getStorageItem(LEARNING_LANGUAGE_STORAGE_KEY);
  if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
    return stored as LearningLanguage;
  }
  return null;
};

/**
 * Backward-compatible helper for initial language retrieval.
 */
export const getInitialLanguage = getInitialMotherTongue;

/**
 * Retrieves initial age.
 */
export const getInitialAge = async (): Promise<AppAge | null> => {
  const stored = await getStorageItem(AGE_STORAGE_KEY);
  if (stored && (stored === '5' || stored === '6')) {
    return parseInt(stored, 10) as AppAge;
  }
  return null;
};

export const setPersistedMotherTongue = async (lang: AppLanguage): Promise<void> => {
  await setStorageItem(MOTHER_TONGUE_STORAGE_KEY, lang);
  await setStorageItem(LEGACY_LANGUAGE_STORAGE_KEY, lang); // Sync legacy
};

export const setPersistedLearningLanguage = async (lang: LearningLanguage): Promise<void> => {
  await setStorageItem(LEARNING_LANGUAGE_STORAGE_KEY, lang);
};

export const setPersistedLanguage = setPersistedMotherTongue;

export const setPersistedAge = async (age: AppAge): Promise<void> => {
  await setStorageItem(AGE_STORAGE_KEY, age.toString());
};

export interface AppLanguageState {
  // Dual-Language Model
  motherTongue: AppLanguage;
  learningLanguage: LearningLanguage;
  selectedAge: AppAge;
  isInitialized: boolean;

  // Backward-compatibility alias fields
  selectedLanguage: AppLanguage;
  appLanguage: AppLanguage;

  // Actions
  initLanguage: () => Promise<AppLanguage | null>;
  initAge: () => Promise<AppAge | null>;
  setMotherTongue: (lang: AppLanguage) => Promise<void>;
  setLearningLanguage: (lang: LearningLanguage) => Promise<void>;
  setSelectedLanguage: (lang: AppLanguage) => Promise<void>;
  setSelectedAge: (age: AppAge) => Promise<void>;
  setCompleteProfile: (
    motherTongue: AppLanguage,
    learningLang: LearningLanguage,
    age: AppAge
  ) => Promise<void>;
}

export const useAppLanguageStore = create<AppLanguageState>((set, get) => ({
  motherTongue: 'en',
  learningLanguage: 'en',
  selectedAge: 5,
  isInitialized: false,

  // Backward compatibility alias getters
  selectedLanguage: 'en',
  appLanguage: 'en',

  initLanguage: async () => {
    const mother = await getInitialMotherTongue();
    const learning = await getInitialLearningLanguage();
    const age = await getInitialAge();

    const finalMother: AppLanguage = mother || 'en';
    const defaultLearning: LearningLanguage = finalMother === 'en' ? 'hi' : 'en';
    const finalLearning: LearningLanguage = learning || defaultLearning;
    const finalAge: AppAge = age ?? 5;

    console.log(
      `[LANGUAGE DEBUG] initLanguage: motherTongue = ${finalMother}, learningLanguage = ${finalLearning}, age = ${finalAge}`
    );

    set({
      motherTongue: finalMother,
      learningLanguage: finalLearning,
      selectedLanguage: finalMother,
      appLanguage: finalMother,
      selectedAge: finalAge,
      isInitialized: true,
    });

    if (finalMother) {
      const i18nInstance = getI18n();
      if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
        i18nInstance.changeLanguage(finalMother);
      }
    }

    return mother;
  },

  initAge: async () => {
    const age = await getInitialAge();
    if (age) {
      set({ selectedAge: age });
    }
    return age;
  },

  setMotherTongue: async (lang: AppLanguage) => {
    console.log(`[LANGUAGE DEBUG] setMotherTongue: ${lang}`);
    set({
      motherTongue: lang,
      selectedLanguage: lang,
      appLanguage: lang,
    });
    await setPersistedMotherTongue(lang);

    const i18nInstance = getI18n();
    if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
      i18nInstance.changeLanguage(lang);
    }
  },

  setLearningLanguage: async (lang: LearningLanguage) => {
    console.log(`[LANGUAGE DEBUG] setLearningLanguage: ${lang}`);
    set({ learningLanguage: lang });
    await setPersistedLearningLanguage(lang);
  },

  // Backward-compatible alias: setting selectedLanguage sets motherTongue
  setSelectedLanguage: async (lang: AppLanguage) => {
    await get().setMotherTongue(lang);
  },

  setSelectedAge: async (age: AppAge) => {
    console.log(`[LANGUAGE DEBUG] setSelectedAge: ${age}`);
    set({ selectedAge: age });
    await setPersistedAge(age);
  },

  setCompleteProfile: async (
    motherTongue: AppLanguage,
    learningLang: LearningLanguage,
    age: AppAge
  ) => {
    console.log(
      `[LANGUAGE DEBUG] setCompleteProfile: motherTongue = ${motherTongue}, learningLanguage = ${learningLang}, age = ${age}`
    );
    set({
      motherTongue,
      learningLanguage: learningLang,
      selectedLanguage: motherTongue,
      appLanguage: motherTongue,
      selectedAge: age,
    });

    await Promise.all([
      setPersistedMotherTongue(motherTongue),
      setPersistedLearningLanguage(learningLang),
      setPersistedAge(age),
    ]);

    const i18nInstance = getI18n();
    if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
      i18nInstance.changeLanguage(motherTongue);
    }
  },
}));


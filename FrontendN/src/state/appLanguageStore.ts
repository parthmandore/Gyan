/**
 * Purpose: Central App Language, Learning Language & Age Store
 * using Zustand & AsyncStorage persistence.
 * Module: State Management
 * Folder: frontend/src/state
 */

import { create } from 'zustand';

export type AppLanguage = 'en' | 'hi' | 'mr';
export type LearningLanguage = 'en' | 'hi' | 'mr';
export type AppAge = 5 | 6;

const LANGUAGE_STORAGE_KEY = '@gyan_app_language';
const LEARNING_LANGUAGE_STORAGE_KEY = '@gyan_learning_language';
const AGE_STORAGE_KEY = '@gyan_app_age';

const getI18n = () => {
  try {
    return require('../localization/i18n').default;
  } catch {
    return null;
  }
};

const isValidLanguage = (
  value: string | null,
): value is AppLanguage => {
  return value === 'en' || value === 'hi' || value === 'mr';
};

const isValidLearningLanguage = (
  value: string | null,
): value is LearningLanguage => {
  return value === 'en' || value === 'hi' || value === 'mr';
};

/**
 * Read a value from persistent storage.
 */
const getStoredValue = async (
  key: string,
): Promise<string | null> => {
  try {
    if (
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      return window.localStorage.getItem(key);
    }

    const AsyncStorage =
      require(
        '@react-native-async-storage/async-storage',
      ).default;

    return await AsyncStorage.getItem(key);
  } catch (err) {
    console.warn(
      `[appLanguageStore] Error reading ${key}:`,
      err,
    );

    return null;
  }
};

/**
 * Save a value to persistent storage.
 */
const setStoredValue = async (
  key: string,
  value: string,
): Promise<void> => {
  try {
    if (
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      window.localStorage.setItem(key, value);
      return;
    }

    const AsyncStorage =
      require(
        '@react-native-async-storage/async-storage',
      ).default;

    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.warn(
      `[appLanguageStore] Error saving ${key}:`,
      err,
    );
  }
};

/**
 * Persistence check for initial app language.
 */
export const getInitialLanguage =
  async (): Promise<AppLanguage | null> => {
    const stored = await getStoredValue(
      LANGUAGE_STORAGE_KEY,
    );

    if (isValidLanguage(stored)) {
      return stored;
    }

    return null;
  };

/**
 * Persistence check for learning language.
 */
export const getInitialLearningLanguage =
  async (): Promise<LearningLanguage | null> => {
    const stored = await getStoredValue(
      LEARNING_LANGUAGE_STORAGE_KEY,
    );

    if (isValidLearningLanguage(stored)) {
      return stored;
    }

    return null;
  };

/**
 * Persistence check for age.
 */
export const getInitialAge =
  async (): Promise<AppAge | null> => {
    const stored = await getStoredValue(
      AGE_STORAGE_KEY,
    );

    if (stored === '5' || stored === '6') {
      return parseInt(stored, 10) as AppAge;
    }

    return null;
  };

/**
 * Persist selected app language.
 */
export const setPersistedLanguage = async (
  lang: AppLanguage,
): Promise<void> => {
  await setStoredValue(
    LANGUAGE_STORAGE_KEY,
    lang,
  );
};

/**
 * Persist selected learning language.
 */
export const setPersistedLearningLanguage =
  async (
    lang: LearningLanguage,
  ): Promise<void> => {
    await setStoredValue(
      LEARNING_LANGUAGE_STORAGE_KEY,
      lang,
    );
  };

/**
 * Persist selected age.
 */
export const setPersistedAge = async (
  age: AppAge,
): Promise<void> => {
  await setStoredValue(
    AGE_STORAGE_KEY,
    age.toString(),
  );
};

export interface AppLanguageState {
  selectedLanguage: AppLanguage | null;
  selectedLearningLanguage:
    | LearningLanguage
    | null;
  selectedAge: AppAge | null;
  isInitialized: boolean;

  initLanguage: () => Promise<AppLanguage | null>;

  initLearningLanguage: () =>
    Promise<LearningLanguage | null>;

  initAge: () => Promise<AppAge | null>;

  setSelectedLanguage: (
    lang: AppLanguage,
  ) => Promise<void>;

  setSelectedLearningLanguage: (
    lang: LearningLanguage,
  ) => Promise<void>;

  setSelectedAge: (
    age: AppAge,
  ) => Promise<void>;
}

export const useAppLanguageStore =
  create<AppLanguageState>((set) => ({
    selectedLanguage: null,
    selectedLearningLanguage: null,
    selectedAge: null,
    isInitialized: false,

    initLanguage: async () => {
      const lang = await getInitialLanguage();
      const learningLanguage =
        await getInitialLearningLanguage();
      const age = await getInitialAge();

      set({
        selectedLanguage: lang,
        selectedLearningLanguage:
          learningLanguage,
        selectedAge: age ?? 5,
        isInitialized: true,
      });

      if (lang) {
        const i18nInstance = getI18n();

        if (
          i18nInstance &&
          typeof i18nInstance.changeLanguage ===
            'function'
        ) {
          await i18nInstance.changeLanguage(lang);
        }

        try {
          const { LanguageManager } =
            require(
              '../language/LanguageManager',
            );

          const mapped =
            lang === 'hi'
              ? 'hindi'
              : lang === 'mr'
                ? 'marathi'
                : 'english';

          LanguageManager.setLanguage(mapped);
        } catch {
          // LanguageManager is optional.
        }
      }

      return lang;
    },

    initLearningLanguage: async () => {
      const learningLanguage =
        await getInitialLearningLanguage();

      set({
        selectedLearningLanguage:
          learningLanguage,
      });

      return learningLanguage;
    },

    initAge: async () => {
      const age = await getInitialAge();

      if (age) {
        set({
          selectedAge: age,
        });
      }

      return age;
    },

    setSelectedLanguage: async (
      lang: AppLanguage,
    ) => {
      set({
        selectedLanguage: lang,
      });

      await setPersistedLanguage(lang);

      const i18nInstance = getI18n();

      if (
        i18nInstance &&
        typeof i18nInstance.changeLanguage ===
          'function'
      ) {
        await i18nInstance.changeLanguage(lang);
      }

      try {
        const { LanguageManager } =
          require(
            '../language/LanguageManager',
          );

        const mapped =
          lang === 'hi'
            ? 'hindi'
            : lang === 'mr'
              ? 'marathi'
              : 'english';

        LanguageManager.setLanguage(mapped);
      } catch {
        // LanguageManager is optional.
      }
    },

    setSelectedLearningLanguage: async (
      lang: LearningLanguage,
    ) => {
      set({
        selectedLearningLanguage: lang,
      });

      await setPersistedLearningLanguage(lang);
    },

    setSelectedAge: async (
      age: AppAge,
    ) => {
      set({
        selectedAge: age,
      });

      await setPersistedAge(age);
    },
  }));

export default useAppLanguageStore;
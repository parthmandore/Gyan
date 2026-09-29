/**
 * Purpose: Central App Language, Learning Language & Age Store
 * Compatible with the finalized Gyan frontend and the game modules.
 * Module: State Management
 */

import { create } from 'zustand';

export type AppLanguage = 'en' | 'hi' | 'mr';
export type LearningLanguage = 'en' | 'hi' | 'mr';
export type AppAge = 5 | 6 | 7;

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

export const getInitialLanguage =
  async (): Promise<AppLanguage | null> => {
    const stored = await getStoredValue(
      LANGUAGE_STORAGE_KEY,
    );

    return isValidLanguage(stored) ? stored : null;
  };

export const getInitialLearningLanguage =
  async (): Promise<LearningLanguage | null> => {
    const stored = await getStoredValue(
      LEARNING_LANGUAGE_STORAGE_KEY,
    );

    return isValidLearningLanguage(stored)
      ? stored
      : null;
  };

export const getInitialAge =
  async (): Promise<AppAge | null> => {
    const stored = await getStoredValue(
      AGE_STORAGE_KEY,
    );

    if (
      stored === '5' ||
      stored === '6' ||
      stored === '7'
    ) {
      return parseInt(stored, 10) as AppAge;
    }

    return null;
  };

export const setPersistedLanguage = async (
  lang: AppLanguage,
): Promise<void> => {
  await setStoredValue(
    LANGUAGE_STORAGE_KEY,
    lang,
  );
};

export const setPersistedLearningLanguage =
  async (
    lang: LearningLanguage,
  ): Promise<void> => {
    await setStoredValue(
      LEARNING_LANGUAGE_STORAGE_KEY,
      lang,
    );
  };

export const setPersistedAge = async (
  age: AppAge,
): Promise<void> => {
  await setStoredValue(
    AGE_STORAGE_KEY,
    age.toString(),
  );
};

/**
 * The store intentionally exposes both naming styles:
 *
 * Finalized Gyan frontend:
 *   selectedLanguage
 *   selectedLearningLanguage
 *   selectedAge
 *
 * Game modules:
 *   appLanguage
 *   motherTongue
 *   learningLanguage
 *
 * They all represent the same underlying selections.
 */
export interface AppLanguageState {
  // Finalized frontend API
  selectedLanguage: AppLanguage | null;
  selectedLearningLanguage:
    | LearningLanguage
    | null;
  selectedAge: AppAge | null;

  // Game compatibility API
  appLanguage: AppLanguage | null;
  motherTongue: AppLanguage | null;
  learningLanguage: LearningLanguage | null;

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

  // Compatibility aliases used by game modules
  setAppLanguage: (
    lang: AppLanguage,
  ) => Promise<void>;

  setMotherTongue: (
    lang: AppLanguage,
  ) => Promise<void>;

  setLearningLanguage: (
    lang: LearningLanguage,
  ) => Promise<void>;
}

export const useAppLanguageStore =
  create<AppLanguageState>((set) => ({
    selectedLanguage: null,
    selectedLearningLanguage: null,
    selectedAge: null,

    appLanguage: null,
    motherTongue: null,
    learningLanguage: null,

    isInitialized: false,

    initLanguage: async () => {
      const lang = await getInitialLanguage();
      const storedLearningLanguage =
        await getInitialLearningLanguage();
      const age = await getInitialAge();

      set({
        selectedLanguage: lang,
        appLanguage: lang,
        motherTongue: lang,

        selectedLearningLanguage:
          storedLearningLanguage,
        learningLanguage:
          storedLearningLanguage,

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
      const stored =
        await getInitialLearningLanguage();

      set({
        selectedLearningLanguage: stored,
        learningLanguage: stored,
      });

      return stored;
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
        appLanguage: lang,
        motherTongue: lang,
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
        learningLanguage: lang,
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

    setAppLanguage: async (
      lang: AppLanguage,
    ) => {
      set({
        selectedLanguage: lang,
        appLanguage: lang,
        motherTongue: lang,
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
    },

    setMotherTongue: async (
      lang: AppLanguage,
    ) => {
      set({
        selectedLanguage: lang,
        appLanguage: lang,
        motherTongue: lang,
      });

      await setPersistedLanguage(lang);
    },

    setLearningLanguage: async (
      lang: LearningLanguage,
    ) => {
      set({
        selectedLearningLanguage: lang,
        learningLanguage: lang,
      });

      await setPersistedLearningLanguage(lang);
    },
  }));

export default useAppLanguageStore;
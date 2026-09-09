/**
 * Purpose: Global Language Manager service handling persistence (AsyncStorage) and state.
 * Module: Language Architecture
 * Folder: frontend/src/language
 */

import i18n from '../localization/i18n';
import { LearningLanguage, SUPPORTED_LANGUAGES } from './types';

const STORAGE_KEY = '@gyan_learning_language';
const DEFAULT_LANGUAGE: LearningLanguage = 'english';

class LanguageManagerService {
  private currentLanguage: LearningLanguage = DEFAULT_LANGUAGE;
  private isLoaded: boolean = false;

  /**
   * Loads persisted learning language from storage on app launch.
   */
  async init(): Promise<LearningLanguage> {
    if (this.isLoaded) return this.currentLanguage;

    try {
      let stored: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } else {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          stored = await AsyncStorage.getItem(STORAGE_KEY);
        } catch {
          // Fallback if native module unavailable
        }
      }

      if (stored && (stored === 'english' || stored === 'hindi' || stored === 'marathi')) {
        this.currentLanguage = stored as LearningLanguage;
      } else {
        this.currentLanguage = DEFAULT_LANGUAGE;
      }
    } catch (err) {
      console.warn('[LanguageManager] Error loading language from storage, fallback to default:', err);
      this.currentLanguage = DEFAULT_LANGUAGE;
    }

    this.isLoaded = true;
    this.syncI18n();
    return this.currentLanguage;
  }

  /**
   * Gets current active learning language synchronously.
   */
  getLanguage(): LearningLanguage {
    return this.currentLanguage;
  }

  /**
   * Sets and persists the global learning language.
   */
  async setLanguage(lang: LearningLanguage): Promise<void> {
    this.currentLanguage = lang;
    this.syncI18n();

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
      console.warn('[LanguageManager] Error saving language to storage:', err);
    }
  }

  /**
   * Syncs i18next language locale to match selected learning language.
   */
  private syncI18n(): void {
    const meta = SUPPORTED_LANGUAGES[this.currentLanguage];
    if (meta && i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(meta.code);
    }
  }
}

export const LanguageManager = new LanguageManagerService();

/**
 * Purpose: Harmonized Language Manager adapter bridging to central useAppLanguageStore.
 *          Ensures zero competing stores while maintaining full backward-compatibility.
 * Module: Language Architecture
 * Folder: frontend/src/language
 */

import { LearningLanguage } from './types';

const MAP_CODE_TO_NAME: Record<string, LearningLanguage> = {
  en: 'english',
  hi: 'hindi',
  mr: 'marathi',
};

const MAP_NAME_TO_CODE: Record<LearningLanguage, 'en' | 'hi' | 'mr'> = {
  english: 'en',
  hindi: 'hi',
  marathi: 'mr',
};

class LanguageManagerService {
  async init(): Promise<LearningLanguage> {
    return this.getLanguage();
  }

  getLanguage(): LearningLanguage {
    try {
      const { useAppLanguageStore } = require('../state/appLanguageStore');
      const code = useAppLanguageStore.getState().learningLanguage;
      return MAP_CODE_TO_NAME[code] || 'english';
    } catch {
      return 'english';
    }
  }

  async setLanguage(lang: LearningLanguage): Promise<void> {
    try {
      const { useAppLanguageStore } = require('../state/appLanguageStore');
      const code = MAP_NAME_TO_CODE[lang] || 'en';
      await useAppLanguageStore.getState().setLearningLanguage(code);
    } catch (err) {
      console.warn('[LanguageManager] Error updating learningLanguage:', err);
    }
  }
}

export const LanguageManager = new LanguageManagerService();

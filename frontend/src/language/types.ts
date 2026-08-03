/**
 * Purpose: Global Learning Language Architecture type definitions.
 * Module: Language Architecture
 * Folder: frontend/src/language
 */

export type LearningLanguage = 'english' | 'hindi' | 'marathi';

export interface LanguageMeta {
  id: LearningLanguage;
  code: string;
  name: string;
  nativeName: string;
  flagIcon: string;
}

export const SUPPORTED_LANGUAGES: Record<LearningLanguage, LanguageMeta> = {
  english: {
    id: 'english',
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flagIcon: '🇬🇧',
  },
  hindi: {
    id: 'hindi',
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flagIcon: '🇮🇳',
  },
  marathi: {
    id: 'marathi',
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flagIcon: '🇮🇳',
  },
};

/**
 * Purpose: React Context for global Learning Language state and methods.
 * Module: Language Architecture
 * Folder: frontend/src/language
 */

import { createContext } from 'react';
import { LearningLanguage } from './types';

export interface LanguageContextType {
  learningLanguage: LearningLanguage;
  setLearningLanguage: (lang: LearningLanguage) => Promise<void>;
  isLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
  learningLanguage: 'english',
  setLearningLanguage: async () => {},
  isLoading: true,
});

/**
 * Purpose: Central Data Dispatcher for Letter Tracing datasets.
 *          Retrieves target letter collections filtered by learning language and age appropriateness.
 * Module: Letter Tracing — Data
 * Folder: frontend/src/screens/games/LetterTracing/data
 */

import { AppLanguage, AppAge } from '../../../../state/appLanguageStore';
import { LetterItem } from '../types';
import { EN_LETTERS } from './enLetters';
import { HI_LETTERS } from './hiLetters';
import { MR_LETTERS } from './mrLetters';

export { EN_LETTERS, HI_LETTERS, MR_LETTERS };

export function getLettersForLanguage(language: AppLanguage): LetterItem[] {
  switch (language) {
    case 'hi':
      return HI_LETTERS;
    case 'mr':
      return MR_LETTERS;
    case 'en':
    default:
      return EN_LETTERS;
  }
}

export function getLettersForLanguageAndAge(
  language: AppLanguage,
  age: AppAge
): LetterItem[] {
  const allLetters = getLettersForLanguage(language);
  // Filter letters where minAge <= selected age
  const filtered = allLetters.filter((item) => item.minAge <= age);
  return filtered.length >= 5 ? filtered : allLetters;
}

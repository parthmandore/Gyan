/**
 * Purpose: Central dataset dispatcher for Speech Word Challenge.
 *          Routes to Letter datasets for Age 5 and Word datasets for Age 6.
 * Module: Speech Word Challenge — Datasets
 * Folder: frontend/src/screens/games/SpeechWordChallenge/datasets
 */

import { SpeechChallengeItem } from '../types';
import { EN_WORDS } from './enWords';
import { HI_WORDS } from './hiWords';
import { MR_WORDS } from './mrWords';
import { EN_LETTERS } from './enLetters';
import { HI_LETTERS } from './hiLetters';
import { MR_LETTERS } from './mrLetters';

export const getItemsForLanguageAndAge = (
  language: string,
  age: number = 5
): SpeechChallengeItem[] => {
  if (age === 5) {
    switch (language) {
      case 'hi':
        return HI_LETTERS;
      case 'mr':
        return MR_LETTERS;
      case 'en':
      default:
        return EN_LETTERS;
    }
  } else {
    switch (language) {
      case 'hi':
        return HI_WORDS;
      case 'mr':
        return MR_WORDS;
      case 'en':
      default:
        return EN_WORDS;
    }
  }
};

export const getRandomizedRoundItems = (
  language: string,
  age: number = 5,
  count: number = 10
): SpeechChallengeItem[] => {
  const pool = [...getItemsForLanguageAndAge(language, age)];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
};

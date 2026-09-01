import { SpeechChallengeItem } from '../types';
import { EN_WORDS } from './enWords';
import { HI_WORDS } from './hiWords';
import { MR_WORDS } from './mrWords';

export const getWordsForLanguage = (language: string): SpeechChallengeItem[] => {
  switch (language) {
    case 'hi':
      return HI_WORDS;
    case 'mr':
      return MR_WORDS;
    case 'en':
    default:
      return EN_WORDS;
  }
};

export const getRandomizedRoundItems = (
  language: string,
  count: number = 10
): SpeechChallengeItem[] => {
  const pool = [...getWordsForLanguage(language)];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
};

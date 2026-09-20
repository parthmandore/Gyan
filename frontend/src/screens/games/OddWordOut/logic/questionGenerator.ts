/**
 * Purpose: Question generator logic for Odd Word Out (Age 7).
 *          Generates 10 categorical reasoning rounds with 4 shuffled word options.
 * Module: Odd Word Out — Logic
 * Folder: frontend/src/screens/games/OddWordOut/logic
 */

import { AppLanguage } from '../../../../state/appLanguageStore';
import { OddWordCategoryItem, WordChoiceOption, OddWordQuestion } from '../types';
import { ODD_WORDS_EN } from '../data/oddWordsEn';
import { ODD_WORDS_HI } from '../data/oddWordsHi';
import { ODD_WORDS_MR } from '../data/oddWordsMr';

export const TOTAL_ODD_WORD_OUT_ROUNDS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getOddWordPool(language: AppLanguage): OddWordCategoryItem[] {
  switch (language) {
    case 'hi':
      return ODD_WORDS_HI;
    case 'mr':
      return ODD_WORDS_MR;
    case 'en':
    default:
      return ODD_WORDS_EN;
  }
}

export function generateOddWordOutQuestions(
  language: AppLanguage
): OddWordQuestion[] {
  const pool = getOddWordPool(language);
  const shuffledPool = shuffleArray(pool);
  const selectedItems = shuffledPool.slice(0, TOTAL_ODD_WORD_OUT_ROUNDS);

  return selectedItems.map((item, index) => {
    const options: WordChoiceOption[] = shuffleArray([
      {
        id: `${item.id}_cat_0`,
        word: item.categoryWords[0],
        isOdd: false,
      },
      {
        id: `${item.id}_cat_1`,
        word: item.categoryWords[1],
        isOdd: false,
      },
      {
        id: `${item.id}_cat_2`,
        word: item.categoryWords[2],
        isOdd: false,
      },
      {
        id: `${item.id}_odd`,
        word: item.oddWord,
        isOdd: true,
      },
    ]);

    return {
      roundNumber: index + 1,
      targetItem: item,
      options,
      correctAnswer: item.oddWord,
    };
  });
}

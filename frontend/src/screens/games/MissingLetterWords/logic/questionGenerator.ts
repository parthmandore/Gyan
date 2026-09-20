/**
 * Purpose: Question generator logic for Missing Letter Words.
 *          Creates 10 diverse rounds with 4 randomized letter choices per round.
 * Module: Missing Letter Words — Logic
 * Folder: frontend/src/screens/games/MissingLetterWords/logic
 */

import { AppLanguage } from '../../../../state/appLanguageStore';
import { WordChallengeItem, WordOption, WordQuestion } from '../types';
import { getWordsAge6 } from '../data/wordsAge6';
import { getWordsAge7 } from '../data/wordsAge7';

export const TOTAL_MISSING_LETTER_WORDS_ROUNDS = 10;

/**
 * Fisher-Yates array shuffle helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate 10 randomized rounds for Missing Letter Words
 */
export function generateMissingLetterWordQuestions(
  age: number,
  language: AppLanguage
): WordQuestion[] {
  const pool: WordChallengeItem[] =
    age >= 7 ? getWordsAge7(language) : getWordsAge6(language);

  const shuffledPool = shuffleArray(pool);
  const selectedItems = shuffledPool.slice(0, TOTAL_MISSING_LETTER_WORDS_ROUNDS);

  return selectedItems.map((item, index) => {
    const correctLetter = item.missingLetter;
    const shuffledDistractors = shuffleArray(item.distractors);
    const chosenDistractors = shuffledDistractors.slice(0, 3);

    const options: WordOption[] = shuffleArray([
      {
        id: `${item.id}_opt_correct`,
        letter: correctLetter,
        isCorrect: true,
      },
      ...chosenDistractors.map((dist, dIdx) => ({
        id: `${item.id}_opt_dist_${dIdx}`,
        letter: dist,
        isCorrect: false,
      })),
    ]);

    return {
      roundNumber: index + 1,
      targetWord: item,
      options,
      correctAnswer: correctLetter,
    };
  });
}

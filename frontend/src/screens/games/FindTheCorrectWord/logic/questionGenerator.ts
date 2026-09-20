/**
 * Purpose: Question generator for Find the Correct Word.
 *          Creates 10 diverse rounds with 4 multiple-choice word options per round.
 * Module: Find the Correct Word — Logic
 * Folder: frontend/src/screens/games/FindTheCorrectWord/logic
 */

import { AppLanguage } from '../../../../state/appLanguageStore';
import { CorrectWordItem, WordChoiceOption, CorrectWordQuestion } from '../types';
import { getWordsAge6 } from '../data/wordsAge6';
import { getWordsAge7 } from '../data/wordsAge7';

export const TOTAL_FIND_CORRECT_WORD_ROUNDS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateFindCorrectWordQuestions(
  age: number,
  language: AppLanguage
): CorrectWordQuestion[] {
  const pool: CorrectWordItem[] =
    age >= 7 ? getWordsAge7(language) : getWordsAge6(language);

  const shuffledPool = shuffleArray(pool);
  const selectedItems = shuffledPool.slice(0, TOTAL_FIND_CORRECT_WORD_ROUNDS);

  return selectedItems.map((item, index) => {
    const shuffledDistractors = shuffleArray(item.distractors);
    const chosenDistractors = shuffledDistractors.slice(0, 3);

    const options: WordChoiceOption[] = shuffleArray([
      {
        id: `${item.id}_opt_correct`,
        word: item.correctWord,
        isCorrect: true,
      },
      ...chosenDistractors.map((dist, dIdx) => ({
        id: `${item.id}_opt_dist_${dIdx}`,
        word: dist,
        isCorrect: false,
      })),
    ]);

    return {
      roundNumber: index + 1,
      targetItem: item,
      options,
      correctAnswer: item.correctWord,
    };
  });
}

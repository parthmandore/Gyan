/**
 * Purpose: Question generation engine for Missing Numbers (Age 5).
 *          Yields exactly 5 randomized rounds per session without duplicates.
 * Module: Missing Numbers — Logic
 * Folder: frontend/src/screens/games/MissingNumbers/logic
 */

import { NUMBER_SEQUENCES, NUMBER_NAMES } from '../datasets/numberSequences';
import {
  MissingNumbersRound,
  MissingNumbersQuestion,
  MissingNumbersOption,
  NumberSequenceItem,
} from '../types';

export const TOTAL_MISSING_NUMBERS_ROUNDS = 10;

/**
 * Fisher-Yates shuffle helper
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
 * Helper to build spoken phrases for a number sequence across languages
 */
function buildSpokenPhrases(sequence: (number | null)[]): { en: string; hi: string; mr: string } {
  const enWords = sequence.map((num) =>
    num !== null ? NUMBER_NAMES[num]?.en || String(num) : 'blank'
  );
  const hiWords = sequence.map((num) =>
    num !== null ? NUMBER_NAMES[num]?.hi || String(num) : 'खाली'
  );
  const mrWords = sequence.map((num) =>
    num !== null ? NUMBER_NAMES[num]?.mr || String(num) : 'रिकामी जागा'
  );

  return {
    en: enWords.join(', '),
    hi: hiWords.join(', '),
    mr: mrWords.join(', '),
  };
}

/**
 * Generates 5 unique number sequence questions for the session.
 */
export function generateMissingNumbersSession(): MissingNumbersRound[] {
  // Shuffle dataset and pick 5 unique items
  const shuffledItems = shuffleArray(NUMBER_SEQUENCES);
  const selectedItems: NumberSequenceItem[] = shuffledItems.slice(
    0,
    TOTAL_MISSING_NUMBERS_ROUNDS
  );

  const rounds: MissingNumbersRound[] = selectedItems.map((item, index) => {
    const correctNumber = item.correctNumber;

    // Filter distractors to exclude correct answer and duplicates
    const cleanDistractors = item.distractors.filter(
      (d) => d !== correctNumber
    );
    const uniqueDistractors = Array.from(new Set(cleanDistractors)).slice(0, 3);

    // Combine correct answer with 3 distractors
    const rawOptions = [
      { value: correctNumber, isCorrect: true },
      ...uniqueDistractors.map((d) => ({ value: d, isCorrect: false })),
    ];

    // Shuffle options
    const shuffledOptions = shuffleArray(rawOptions);

    const options: MissingNumbersOption[] = shuffledOptions.map((opt, optIdx) => ({
      id: `${item.id}_opt_${optIdx}_${opt.value}`,
      value: opt.value,
      isCorrect: opt.isCorrect,
    }));

    const question: MissingNumbersQuestion = {
      id: `${item.id}_r${index + 1}`,
      sequence: item.sequence,
      missingIndex: item.missingIndex,
      correctNumber: item.correctNumber,
      options,
      roundNumber: index + 1,
      spokenPhrases: buildSpokenPhrases(item.sequence),
    };

    return {
      roundNumber: index + 1,
      question,
    };
  });

  return rounds;
}

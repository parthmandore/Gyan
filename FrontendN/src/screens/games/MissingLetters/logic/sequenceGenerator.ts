/**
 * Purpose: Question generation engine for Missing Letters (Age 5).
 *          Yields exactly 5 randomized rounds per session without duplicates.
 * Module: Missing Letters — Logic
 * Folder: frontend/src/screens/games/MissingLetters/logic
 */

import { getDatasetForLanguage } from '../datasets';
import { MissingLettersRound, MissingLettersQuestion, MissingLettersOption, SequenceItem } from '../types';

export const TOTAL_MISSING_LETTERS_ROUNDS = 10;

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
 * Generates 5 unique sequence questions for the given learning language.
 */
export function generateMissingLettersSession(learningLanguage: string): MissingLettersRound[] {
  const dataset = getDatasetForLanguage(learningLanguage);

  // Shuffle dataset and pick 5 unique items
  const shuffledItems = shuffleArray(dataset);
  const selectedItems: SequenceItem[] = shuffledItems.slice(0, TOTAL_MISSING_LETTERS_ROUNDS);

  // Fallback if dataset has fewer than 5 items
  while (selectedItems.length < TOTAL_MISSING_LETTERS_ROUNDS && dataset.length > 0) {
    selectedItems.push(dataset[selectedItems.length % dataset.length]);
  }

  const rounds: MissingLettersRound[] = selectedItems.map((item, index) => {
    const correctLetter = item.correctLetter;

    // Filter out any distractor that matches correctLetter or duplicates
    const cleanDistractors = item.distractors.filter(
      (d) => d !== correctLetter
    );
    const uniqueDistractors = Array.from(new Set(cleanDistractors)).slice(0, 3);

    // Combine correct answer with 3 distractors
    const rawOptions = [
      { letter: correctLetter, isCorrect: true },
      ...uniqueDistractors.map((d) => ({ letter: d, isCorrect: false })),
    ];

    // Shuffle options so correct letter is randomized
    const shuffledOptions = shuffleArray(rawOptions);

    const options: MissingLettersOption[] = shuffledOptions.map((opt, optIdx) => ({
      id: `${item.id}_opt_${optIdx}_${opt.letter}`,
      letter: opt.letter,
      isCorrect: opt.isCorrect,
    }));

    const question: MissingLettersQuestion = {
      id: `${item.id}_r${index + 1}`,
      sequence: item.sequence,
      missingIndex: item.missingIndex,
      correctLetter: item.correctLetter,
      options,
      displaySequence: item.displaySequence,
      spokenSequence: item.spokenSequence,
      roundNumber: index + 1,
    };

    return {
      roundNumber: index + 1,
      question,
    };
  });

  return rounds;
}

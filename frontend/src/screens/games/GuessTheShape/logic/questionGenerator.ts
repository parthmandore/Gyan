/**
 * Purpose: Question generation engine for Guess the Shape.
 *          Builds exactly 10 non-repeating rounds for Age 6 or Age 7 with
 *          shuffled, age-appropriate multiple-choice distractor options.
 * Module: Guess the Shape — Logic
 * Folder: frontend/src/screens/games/GuessTheShape/logic
 */

import { AppLanguage } from '../../../../state/appLanguageStore';
import { ShapeDefinition, ShapeOption, ShapeQuestion } from '../types';
import { SHAPES_AGE_6 } from '../data/shapesAge6';
import { SHAPES_AGE_7 } from '../data/shapesAge7';

export const TOTAL_GUESS_SHAPE_ROUNDS = 10;

/**
 * Fisher-Yates shuffle helper
 */
function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates 10 progressive rounds for Guess the Shape
 * @param age - Child age (6 or 7)
 * @param language - Learning language for shape names ('en', 'hi', 'mr')
 */
export function generateGuessShapeQuestions(
  age: number = 6,
  language: AppLanguage = 'en'
): ShapeQuestion[] {
  const dataset: ShapeDefinition[] = age >= 7 ? SHAPES_AGE_7 : SHAPES_AGE_6;

  // Shuffle dataset and pick 10 target shapes
  const shuffledTargets = shuffleArray(dataset).slice(0, TOTAL_GUESS_SHAPE_ROUNDS);

  return shuffledTargets.map((target, index) => {
    const targetName = target.names[language] || target.names.en;

    // Pick 3 distractors from remaining shapes in this dataset
    const availableDistractors = dataset.filter((s) => s.id !== target.id);
    const selectedDistractors = shuffleArray(availableDistractors).slice(0, 3);

    // Formulate 4 multiple-choice options (1 correct + 3 distractors)
    const rawOptions: ShapeOption[] = [
      {
        id: target.id,
        name: targetName,
        isCorrect: true,
      },
      ...selectedDistractors.map((d) => ({
        id: d.id,
        name: d.names[language] || d.names.en,
        isCorrect: false,
      })),
    ];

    const shuffledOptions = shuffleArray(rawOptions);

    return {
      roundNumber: index + 1,
      targetShape: target,
      options: shuffledOptions,
      correctAnswer: targetName,
    };
  });
}

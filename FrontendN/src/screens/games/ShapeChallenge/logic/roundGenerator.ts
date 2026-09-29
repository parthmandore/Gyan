/**
 * Purpose: Round generation logic for Shape Challenge.
 *          Generates EXACTLY 5 rounds with unique shape targets, zero duplicate options,
 *          and age-tailored geometry difficulties.
 * Module: Shape Challenge — Logic
 * Folder: frontend/src/screens/games/ShapeChallenge/logic
 */

import { ShapeItem, ShapeOption, ShapeRound } from '../types';
import { SHAPES_DATASET } from '../data/shapes';
import { AppAge, LearningLanguage } from '../../../../state/appLanguageStore';

export const TOTAL_SHAPE_ROUNDS = 5;

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Returns the pool of shapes suitable for the given age.
 */
export const getShapesForAge = (age: AppAge): ShapeItem[] => {
  if (age === 5) {
    // Basic shapes (difficulty 1: circle, square, triangle, rectangle, star)
    return SHAPES_DATASET.filter((s) => s.difficulty === 1);
  } else if (age === 6) {
    // Intermediate shapes + basic (difficulty 1 and 2)
    return SHAPES_DATASET.filter((s) => s.difficulty <= 2);
  } else {
    // Complex geometry + intermediate (difficulty 2 and 3)
    return SHAPES_DATASET.filter((s) => s.difficulty >= 2);
  }
};

/**
 * Generates exactly 5 rounds for a Shape Challenge session.
 */
export const generateShapeRounds = (
  age: AppAge = 5,
  learningLanguage: LearningLanguage = 'en'
): ShapeRound[] => {
  const pool = getShapesForAge(age);
  const shuffledPool = shuffle(pool);

  // Guarantee exactly TOTAL_SHAPE_ROUNDS distinct targets
  const targets = shuffledPool.slice(0, TOTAL_SHAPE_ROUNDS);

  return targets.map((target, idx) => {
    // Pick 3 distractors distinct from target and each other
    const remainingShapes = pool.filter((s) => s.id !== target.id);
    const shuffledDistractors = shuffle(remainingShapes).slice(0, 3);

    const targetName = target.names[learningLanguage] || target.names.en;

    const correctOption: ShapeOption = {
      id: target.id,
      color: target.color,
      name: targetName,
      isCorrect: true,
    };

    const distractorOptions: ShapeOption[] = shuffledDistractors.map((d) => ({
      id: d.id,
      color: d.color,
      name: d.names[learningLanguage] || d.names.en,
      isCorrect: false,
    }));

    const options = shuffle([correctOption, ...distractorOptions]);

    const expectedWord = target.names[learningLanguage] || target.names.en;
    const acceptedVariants = target.variants[learningLanguage] || target.variants.en;

    return {
      roundNumber: idx + 1,
      targetShape: target,
      options,
      expectedWord,
      acceptedVariants,
    };
  });
};

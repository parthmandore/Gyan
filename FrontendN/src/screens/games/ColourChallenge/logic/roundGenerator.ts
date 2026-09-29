/**
 * Purpose: Round generation logic for Colour Challenge.
 *          Generates EXACTLY 5 rounds with unique targets, zero duplicate options,
 *          and age-tailored difficulties.
 * Module: Colour Challenge — Logic
 * Folder: frontend/src/screens/games/ColourChallenge/logic
 */

import { ColorItem, ColorOption, ColorRound } from '../types';
import { COLORS_DATASET } from '../data/colors';
import { AppAge, LearningLanguage } from '../../../../state/appLanguageStore';

export const TOTAL_COLOUR_ROUNDS = 5;

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Returns the pool of colors suitable for the given age.
 */
export const getColorsForAge = (age: AppAge): ColorItem[] => {
  if (age === 5) {
    // Basic colors (difficulty 1)
    return COLORS_DATASET.filter((c) => c.difficulty === 1);
  } else if (age === 6) {
    // Intermediate + common colors (difficulty 1 and 2)
    return COLORS_DATASET.filter((c) => c.difficulty <= 2);
  } else {
    // Advanced shades + intermediate (difficulty 2 and 3)
    return COLORS_DATASET.filter((c) => c.difficulty >= 2);
  }
};

/**
 * Generates exactly 5 rounds for a Colour Challenge session.
 */
export const generateColourRounds = (
  age: AppAge = 5,
  learningLanguage: LearningLanguage = 'en'
): ColorRound[] => {
  const pool = getColorsForAge(age);
  const shuffledPool = shuffle(pool);

  // Guarantee at least TOTAL_COLOUR_ROUNDS distinct targets
  const targets = shuffledPool.slice(0, TOTAL_COLOUR_ROUNDS);

  return targets.map((target, idx) => {
    // Pick 3 distractors distinct from target and each other
    const remainingColors = pool.filter((c) => c.id !== target.id);
    const shuffledDistractors = shuffle(remainingColors).slice(0, 3);

    const targetName = target.names[learningLanguage] || target.names.en;

    const correctOption: ColorOption = {
      id: target.id,
      hex: target.hex,
      borderHex: target.borderHex,
      name: targetName,
      isCorrect: true,
    };

    const distractorOptions: ColorOption[] = shuffledDistractors.map((d) => ({
      id: d.id,
      hex: d.hex,
      borderHex: d.borderHex,
      name: d.names[learningLanguage] || d.names.en,
      isCorrect: false,
    }));

    const options = shuffle([correctOption, ...distractorOptions]);

    const expectedWord = target.names[learningLanguage] || target.names.en;
    const acceptedVariants = target.variants[learningLanguage] || target.variants.en;

    return {
      roundNumber: idx + 1,
      targetColor: target,
      options,
      expectedWord,
      acceptedVariants,
    };
  });
};

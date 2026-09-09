/**
 * Purpose: Central dataset dispatcher for Speech Word Challenge.
 *          Routes to Letter datasets for Age 5 and clean Category datasets for Age 6:
 *          - Animals (enAnimals, hiAnimals, mrAnimals)
 *          - Fruits & Vegetables (enFruitsVegetables, hiFruitsVegetables, mrFruitsVegetables)
 *          - Everyday Things & Nature (enEverydayNature, hiEverydayNature, mrEverydayNature)
 * Module: Speech Word Challenge — Datasets
 * Folder: frontend/src/screens/games/SpeechWordChallenge/datasets
 */

import { SpeechChallengeItem, GameCategory } from '../types';
import { EN_LETTERS } from './enLetters';
import { HI_LETTERS } from './hiLetters';
import { MR_LETTERS } from './mrLetters';

// Age 6 Category Datasets
import { EN_ANIMALS } from './enAnimals';
import { HI_ANIMALS } from './hiAnimals';
import { MR_ANIMALS } from './mrAnimals';

import { EN_FRUITS_VEGETABLES } from './enFruitsVegetables';
import { HI_FRUITS_VEGETABLES } from './hiFruitsVegetables';
import { MR_FRUITS_VEGETABLES } from './mrFruitsVegetables';

import { EN_EVERYDAY_NATURE } from './enEverydayNature';
import { HI_EVERYDAY_NATURE } from './hiEverydayNature';
import { MR_EVERYDAY_NATURE } from './mrEverydayNature';

export {
  EN_ANIMALS,
  HI_ANIMALS,
  MR_ANIMALS,
  EN_FRUITS_VEGETABLES,
  HI_FRUITS_VEGETABLES,
  MR_FRUITS_VEGETABLES,
  EN_EVERYDAY_NATURE,
  HI_EVERYDAY_NATURE,
  MR_EVERYDAY_NATURE,
};

const shuffleArray = <T>(arr: T[]): T[] => {
  const pool = [...arr];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};

/**
 * Returns the exact 15-item dataset for a specific language and category.
 */
export const getCategoryDataset = (
  language: string,
  category: GameCategory
): SpeechChallengeItem[] => {
  if (category === 'animals') {
    switch (language) {
      case 'hi':
        return HI_ANIMALS;
      case 'mr':
        return MR_ANIMALS;
      case 'en':
      default:
        return EN_ANIMALS;
    }
  }

  if (category === 'fruits') {
    switch (language) {
      case 'hi':
        return HI_FRUITS_VEGETABLES;
      case 'mr':
        return MR_FRUITS_VEGETABLES;
      case 'en':
      default:
        return EN_FRUITS_VEGETABLES;
    }
  }

  if (category === 'nature') {
    switch (language) {
      case 'hi':
        return HI_EVERYDAY_NATURE;
      case 'mr':
        return MR_EVERYDAY_NATURE;
      case 'en':
      default:
        return EN_EVERYDAY_NATURE;
    }
  }

  if (category === 'letters') {
    switch (language) {
      case 'hi':
        return HI_LETTERS;
      case 'mr':
        return MR_LETTERS;
      case 'en':
      default:
        return EN_LETTERS;
    }
  }

  return EN_ANIMALS;
};

/**
 * Fetches randomized items for an Age 6 category game session (default: 10 items).
 */
export const getItemsForCategory = (
  language: string,
  category: GameCategory,
  count: number = 10
): SpeechChallengeItem[] => {
  const dataset = getCategoryDataset(language, category);
  return shuffleArray(dataset).slice(0, Math.min(count, dataset.length));
};

/**
 * Backward compatibility: returns letters for age 5 or combined words for age 6.
 */
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
    const animals = getCategoryDataset(language, 'animals');
    const fruits = getCategoryDataset(language, 'fruits');
    const nature = getCategoryDataset(language, 'nature');
    return [...animals, ...fruits, ...nature];
  }
};

export const getRandomizedRoundItems = (
  language: string,
  age: number = 5,
  count: number = 10
): SpeechChallengeItem[] => {
  const pool = getItemsForLanguageAndAge(language, age);
  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
};

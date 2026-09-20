/**
 * Purpose: Round generation logic for Letter Tracing.
 *          Generates EXACTLY 5 rounds with unique target letters per session,
 *          tailored to the child's learning language and age.
 * Module: Letter Tracing — Logic
 * Folder: frontend/src/screens/games/LetterTracing/logic
 */

import { AppAge, AppLanguage } from '../../../../state/appLanguageStore';
import { LetterRound, LetterItem } from '../types';
import { getLettersForLanguageAndAge, getLettersForLanguage } from '../data';

export const TOTAL_TRACING_ROUNDS = 10;

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Generates exactly 5 rounds for a Letter Tracing session.
 */
export const generateTracingRounds = (
  age: AppAge = 5,
  learningLanguage: AppLanguage = 'en'
): LetterRound[] => {
  let pool = getLettersForLanguageAndAge(learningLanguage, age);
  if (pool.length < TOTAL_TRACING_ROUNDS) {
    pool = getLettersForLanguage(learningLanguage);
  }

  const shuffled = shuffle(pool);
  const selectedLetters: LetterItem[] = [];

  for (let i = 0; i < TOTAL_TRACING_ROUNDS; i++) {
    selectedLetters.push(shuffled[i % shuffled.length]);
  }

  return selectedLetters.map((letter, idx) => ({
    roundNumber: idx + 1,
    letter,
    age,
  }));
};

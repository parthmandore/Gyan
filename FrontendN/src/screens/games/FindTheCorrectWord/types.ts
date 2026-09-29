/**
 * Purpose: TypeScript type definitions for the Find the Correct Word educational game.
 * Module: Find the Correct Word — Types
 * Folder: frontend/src/screens/games/FindTheCorrectWord
 */

import { AppLanguage } from '../../../state/appLanguageStore';

export interface CorrectWordItem {
  id: string;
  image: string; // Emoji / visual representation
  correctWord: string; // Correctly spelled word, e.g. "CAT" or "कमल"
  distractors: string[]; // 3 realistic spelling distractors, e.g. ["KAT", "CATT", "COT"]
  meaning?: string; // Meaning / translation
  phoneticHint?: string; // Phonetic pronunciation guide
}

export interface WordChoiceOption {
  id: string;
  word: string;
  isCorrect: boolean;
}

export interface CorrectWordQuestion {
  roundNumber: number; // 1 to 10
  targetItem: CorrectWordItem;
  options: WordChoiceOption[]; // 4 multiple choice word options
  correctAnswer: string; // The correct word
}

export interface WordChoiceAttempt {
  roundNumber: number;
  expectedWord: string;
  chosenWord: string;
  isCorrect: boolean;
  attemptCount: 1 | 2;
  timestamp: number;
}

export interface FindTheCorrectWordSessionResults {
  starsEarned: number;
  xpEarned: number;
  itemsCorrect: number;
  sessionLength: number;
  accuracy: number;
  isTimeExpired?: boolean;
}

export type FindTheCorrectWordStackParamList = {
  FindTheCorrectWordIntro: undefined;
  FindTheCorrectWordGame: undefined;
  FindTheCorrectWordSessionComplete: FindTheCorrectWordSessionResults;
};

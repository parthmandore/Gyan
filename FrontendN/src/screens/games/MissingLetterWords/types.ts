/**
 * Purpose: TypeScript type definitions for the Missing Letter Words educational game.
 * Module: Missing Letter Words — Types
 * Folder: frontend/src/screens/games/MissingLetterWords
 */

import { AppLanguage } from '../../../state/appLanguageStore';

export interface WordChallengeItem {
  id: string;
  word: string; // Complete word, e.g. "CAT", "कमल"
  displayParts: string[]; // Segmented characters/glyphs, e.g. ["C", "A", "T"] or ["क", "म", "ल"]
  missingIndex: number; // 0-based index of the missing part
  missingLetter: string; // The correct missing letter/glyph, e.g. "A" or "म"
  distractors: string[]; // 3+ plausible distractor letters/glyphs
  meaning?: string; // Meaning in English or mother tongue
  phoneticHint?: string; // Phonetic pronunciation helper
  image?: string; // Associated emoji or icon representation
}

export interface WordOption {
  id: string;
  letter: string;
  isCorrect: boolean;
}

export interface WordQuestion {
  roundNumber: number; // 1 to 10
  targetWord: WordChallengeItem;
  options: WordOption[]; // 4 multiple choice letter options
  correctAnswer: string; // missing letter
}

export interface WordAttempt {
  roundNumber: number;
  word: string;
  expectedLetter: string;
  chosenLetter: string;
  isCorrect: boolean;
  attemptCount: 1 | 2;
  timestamp: number;
}

export interface MissingLetterWordsSessionResults {
  starsEarned: number;
  xpEarned: number;
  itemsCorrect: number;
  sessionLength: number;
  accuracy: number;
  isTimeExpired?: boolean;
}

export type MissingLetterWordsStackParamList = {
  MissingLetterWordsIntro: undefined;
  MissingLetterWordsGame: undefined;
  MissingLetterWordsSessionComplete: MissingLetterWordsSessionResults;
};

/**
 * Purpose: Type definitions for the Missing Letters (Age 5) educational game.
 * Module: Missing Letters — Types
 * Folder: frontend/src/screens/games/MissingLetters
 */

export interface SequenceItem {
  id: string;
  sequence: (string | null)[];
  missingIndex: number;
  correctLetter: string;
  distractors: string[];
  displaySequence: string;
  spokenSequence: string;
}

export interface MissingLettersOption {
  id: string;
  letter: string;
  isCorrect: boolean;
}

export interface MissingLettersQuestion {
  id: string;
  sequence: (string | null)[];
  missingIndex: number;
  correctLetter: string;
  options: MissingLettersOption[];
  displaySequence: string;
  spokenSequence: string;
  roundNumber: number;
}

export interface MissingLettersRound {
  roundNumber: number; // 1 to 5
  question: MissingLettersQuestion;
}

export interface MissingLettersAttempt {
  roundNumber: number;
  questionId: string;
  selectedLetter: string;
  correctLetter: string;
  isCorrect: boolean;
  attemptCount: number;
  timestamp: number;
}

export type MissingLettersStackParamList = {
  MissingLettersIntro: undefined;
  MissingLettersGame: undefined;
  MissingLettersSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};

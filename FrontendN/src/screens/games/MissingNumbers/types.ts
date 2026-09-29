/**
 * Purpose: Type definitions for the Missing Numbers (Age 5) educational game.
 * Module: Missing Numbers — Types
 * Folder: frontend/src/screens/games/MissingNumbers
 */

export interface NumberSequenceItem {
  id: string;
  sequence: (number | null)[];
  missingIndex: number;
  correctNumber: number;
  distractors: number[];
}

export interface MissingNumbersOption {
  id: string;
  value: number;
  isCorrect: boolean;
}

export interface MissingNumbersQuestion {
  id: string;
  sequence: (number | null)[];
  missingIndex: number;
  correctNumber: number;
  options: MissingNumbersOption[];
  roundNumber: number;
  spokenPhrases: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface MissingNumbersRound {
  roundNumber: number; // 1 to 5
  question: MissingNumbersQuestion;
}

export interface MissingNumbersAttempt {
  roundNumber: number;
  questionId: string;
  selectedValue: number;
  correctValue: number;
  isCorrect: boolean;
  attemptCount: number;
  timestamp: number;
}

export type MissingNumbersStackParamList = {
  MissingNumbersIntro: undefined;
  MissingNumbersGame: undefined;
  MissingNumbersSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};

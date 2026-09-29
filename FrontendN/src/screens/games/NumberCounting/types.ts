/**
 * Purpose: TypeScript type definitions for the Number Counting game (Age 5).
 * Module: Number Counting — Types
 * Folder: frontend/src/screens/games/NumberCounting
 */

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface LocalizedCountableNames {
  singular: string;
  plural: string;
}

export interface CountableObjectItem {
  id: string;
  emoji: string;
  category: 'fruits' | 'nature' | 'animals' | 'toys';
  names: Record<SupportedLanguage, LocalizedCountableNames>;
}

export interface CountingOption {
  id: string;
  number: number;
  label: string;
  isCorrect: boolean;
}

export interface CountingQuestion {
  id: string;
  roundNumber: number;
  targetCount: number;
  objectItem: CountableObjectItem;
  options: CountingOption[];
  questionText: Record<SupportedLanguage, string>;
  spokenPhrase: Record<SupportedLanguage, string>;
}

export interface CountingAttempt {
  roundIndex: number;
  questionId: string;
  selectedNumber: number;
  correctNumber: number;
  isCorrect: boolean;
  timeTakenMs: number;
}

export interface NumberCountingSessionResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  durationSeconds: number;
  isTimeExpired?: boolean;
}

export type NumberCountingStackParamList = {
  NumberCountingIntro: undefined;
  NumberCountingGame: undefined;
  NumberCountingSessionComplete: NumberCountingSessionResults;
};

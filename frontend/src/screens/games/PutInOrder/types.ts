/**
 * Purpose: TypeScript type definitions for the Put in Order (Age 5) educational game.
 * Module: Put in Order — Types
 * Folder: frontend/src/screens/games/PutInOrder
 */

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export type OrderChallengeType = 'numbers' | 'letters' | 'quantities' | 'logical';

export interface OrderItem {
  id: string;
  display: string; // The text or emoji shown on the card (e.g. '1', 'A', '🍎🍎', '🌱')
  label?: string; // Optional spoken name for TTS
  orderIndex: number; // Correct 0-indexed position in sequence
}

export interface OrderPreset {
  id: string;
  type: OrderChallengeType;
  items: Array<{
    display: string;
    label?: Record<SupportedLanguage, string>;
  }>;
  languages?: SupportedLanguage[]; // If language-specific (e.g. for letters)
}

export interface OrderQuestion {
  id: string;
  roundNumber: number;
  type: OrderChallengeType;
  items: OrderItem[]; // Correct order
  shuffledItems: OrderItem[]; // Initial shuffled order
  promptText: Record<SupportedLanguage, string>;
  spokenPrompt: Record<SupportedLanguage, string>;
}

export interface OrderAttempt {
  roundIndex: number;
  questionId: string;
  placedIds: string[];
  correctIds: string[];
  isCorrect: boolean;
  timeTakenMs: number;
}

export interface PutInOrderSessionResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  durationSeconds: number;
  isTimeExpired?: boolean;
}

export type PutInOrderStackParamList = {
  PutInOrderIntro: undefined;
  PutInOrderGame: undefined;
  PutInOrderSessionComplete: PutInOrderSessionResults;
};

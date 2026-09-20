/**
 * Purpose: Type definitions for the Educational Mathematics Games suite.
 *          Supports Addition, Subtraction, Bigger Addition, Multiplication, and Division.
 * Module: Math Challenge — Types
 * Folder: frontend/src/screens/games/MathChallenge
 */

export type MathOperation =
  | 'addition'
  | 'subtraction'
  | 'bigger_addition'
  | 'multiplication'
  | 'division';

export interface MathOption {
  id: string;
  value: number;
  label: string;
  isCorrect: boolean;
}

export interface MathQuestion {
  id: string;
  equation: string;
  operand1: number;
  operand2: number;
  symbol: string;
  correctAnswer: number;
  options: MathOption[];
  operation: MathOperation;
  roundNumber: number;
  difficulty: number;
}

export interface MathRound {
  roundNumber: number; // 1 to 5
  question: MathQuestion;
}

export interface MathAttempt {
  roundNumber: number;
  questionId: string;
  selectedValue: number;
  correctValue: number;
  isCorrect: boolean;
  attemptCount: number;
  timestamp: number;
}

export type MathChallengeStackParamList = {
  MathChallengeIntro: { operation?: MathOperation } | undefined;
  MathChallengeGame: { operation: MathOperation };
  MathChallengeSessionComplete: {
    operation: MathOperation;
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};

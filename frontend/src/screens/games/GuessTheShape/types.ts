/**
 * Purpose: TypeScript type definitions for the Guess the Shape educational game.
 * Module: Guess the Shape — Types
 * Folder: frontend/src/screens/games/GuessTheShape
 */

import { AppLanguage } from '../../../state/appLanguageStore';

export type ShapeId =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle'
  | 'oval'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'heart'
  | 'crescent'
  | 'octagon'
  | 'nonagon'
  | 'decagon'
  | 'trapezoid'
  | 'parallelogram'
  | 'rhombus';

export interface LocalizedShapeNames {
  en: string;
  hi: string;
  mr: string;
}

export interface ShapeDefinition {
  id: ShapeId;
  color: string;
  strokeColor: string;
  names: LocalizedShapeNames;
  phoneticHints?: Record<AppLanguage, string>;
}

export interface ShapeOption {
  id: ShapeId;
  name: string;
  isCorrect: boolean;
}

export interface ShapeQuestion {
  roundNumber: number; // 1 to 10
  targetShape: ShapeDefinition;
  options: ShapeOption[]; // 3 to 4 multiple choice options
  correctAnswer: string; // localized name of target shape
}

export interface ShapeGuessAttempt {
  roundNumber: number;
  targetShapeId: ShapeId;
  expectedWord: string;
  chosenWord: string;
  selectedOptionId: ShapeId;
  isCorrect: boolean;
  attemptCount: 1 | 2;
  timestamp: number;
}

export interface GuessTheShapeSessionResults {
  starsEarned: number;
  xpEarned: number;
  itemsCorrect: number;
  sessionLength: number;
  accuracy: number;
  isTimeExpired?: boolean;
}

export type GuessTheShapeStackParamList = {
  GuessTheShapeIntro: undefined;
  GuessTheShapeGame: undefined;
  GuessTheShapeSessionComplete: GuessTheShapeSessionResults;
};

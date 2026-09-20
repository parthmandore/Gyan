/**
 * Purpose: Type definitions for the Letter Tracing / Handwriting Practice game.
 * Module: Letter Tracing — Types
 * Folder: frontend/src/screens/games/LetterTracing
 */

import { AppLanguage, AppAge } from '../../../state/appLanguageStore';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp?: number;
}

export interface Stroke {
  points: TouchPoint[];
}

export interface NormalizedPoint {
  x: number; // 0 to 100
  y: number; // 0 to 100
}

export interface GuideStroke {
  points: NormalizedPoint[];
  startPoint: NormalizedPoint;
  endPoint: NormalizedPoint;
}

export interface LetterItem {
  id: string;
  char: string;
  displayChar: string;
  name: string;
  phoneticHint: string;
  language: AppLanguage;
  minAge: AppAge;
  // Normalized stroke coordinates [0, 100] x [0, 100]
  strokes: GuideStroke[];
  // Key anchor points for age 6
  anchorPoints: NormalizedPoint[];
}

export interface LetterRound {
  roundNumber: number; // 1 to 5
  letter: LetterItem;
  age: AppAge;
}

export interface TracingAttempt {
  roundIndex: number;
  letterId: string;
  strokes: Stroke[];
  score: number;
  isSuccess: boolean;
  timestamp: number;
}

export interface EvaluationResult {
  score: number; // 0 to 100
  coverageRatio: number; // 0 to 1
  isSuccess: boolean;
  stars: number; // 1, 2, or 3
  feedbackKey: string;
}

export type LetterTracingStackParamList = {
  LetterTracingIntro: undefined;
  LetterTracingGame: undefined;
  LetterTracingSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};

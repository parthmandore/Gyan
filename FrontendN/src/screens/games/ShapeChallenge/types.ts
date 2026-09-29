/**
 * Purpose: TypeScript type definitions for Shape Challenge educational game.
 * Module: Shape Challenge — Types
 * Folder: frontend/src/screens/games/ShapeChallenge
 */

import { AppLanguage, AppAge } from '../../../state/appLanguageStore';

export type ShapeId =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle'
  | 'star'
  | 'oval'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'heart'
  | 'crescent'
  | 'octagon'
  | 'trapezoid'
  | 'parallelogram'
  | 'rhombus'
  | 'semicircle'
  | 'cross'
  | 'decagon';

export interface ShapeItem {
  id: ShapeId;
  difficulty: 1 | 2 | 3; // 1: Age 5 (Basic), 2: Age 6 (Intermediate), 3: Age 7 (Complex)
  color: string;
  names: {
    en: string;
    hi: string;
    mr: string;
  };
  variants: {
    en: string[];
    hi: string[];
    mr: string[];
  };
}

export interface ShapeOption {
  id: ShapeId;
  color: string;
  name: string;
  isCorrect: boolean;
}

export interface ShapeRound {
  roundNumber: number; // 1 to 5
  targetShape: ShapeItem;
  options: ShapeOption[]; // 4 options
  expectedWord: string;
  acceptedVariants: string[];
}

export interface ShapeAttempt {
  roundNumber: number;
  targetShapeId: string;
  expectedWord: string;
  spokenWord?: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  attemptCount: number;
  mode: 'visual' | 'speech';
  timestamp: number;
}

export type ShapeChallengeStackParamList = {
  ShapeChallengeIntro: undefined;
  ShapeChallengeGame: undefined;
  ShapeChallengeSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};

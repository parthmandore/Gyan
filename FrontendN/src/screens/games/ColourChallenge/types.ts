/**
 * Purpose: TypeScript type definitions for Colour Challenge educational game.
 * Module: Colour Challenge — Types
 * Folder: frontend/src/screens/games/ColourChallenge
 */

import { AppLanguage, AppAge } from '../../../state/appLanguageStore';

export interface ColorItem {
  id: string;
  hex: string;
  borderHex: string;
  difficulty: 1 | 2 | 3; // 1: Age 5 (Basic), 2: Age 6 (Intermediate/Speaking), 3: Age 7 (Advanced shades)
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

export interface ColorOption {
  id: string;
  hex: string;
  borderHex: string;
  name: string;
  isCorrect: boolean;
}

export interface ColorRound {
  roundNumber: number; // 1 to 5
  targetColor: ColorItem;
  options: ColorOption[]; // 4 options
  expectedWord: string;
  acceptedVariants: string[];
}

export interface ColorAttempt {
  roundNumber: number;
  targetColorId: string;
  targetColorHex: string;
  expectedWord: string;
  spokenWord?: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  attemptCount: number;
  mode: 'visual' | 'speech';
  timestamp: number;
}

export type ColourChallengeStackParamList = {
  ColourChallengeIntro: undefined;
  ColourChallengeGame: undefined;
  ColourChallengeSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};

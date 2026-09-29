/**
 * Purpose: TypeScript type definitions for Odd Word Out educational game.
 * Module: Odd Word Out — Types
 * Folder: frontend/src/screens/games/OddWordOut
 */

import { AppLanguage } from '../../../state/appLanguageStore';

export interface OddWordCategoryItem {
  id: string;
  categoryName: string; // e.g. "Fruits", "फल", "फळे"
  categoryIcon: string; // e.g. "🍎"
  categoryWords: [string, string, string]; // 3 words belonging to the category
  oddWord: string; // 1 word that is different
  oddCategory: string; // Category of the odd word, e.g. "Animals"
  explanation: string; // Feedback explanation, e.g. "Apple, Mango, and Banana are fruits. Dog is an animal."
}

export interface WordChoiceOption {
  id: string;
  word: string;
  isOdd: boolean; // true if this is the odd word out (the correct answer)
}

export interface OddWordQuestion {
  roundNumber: number; // 1 to 10
  targetItem: OddWordCategoryItem;
  options: WordChoiceOption[]; // 4 multiple choice word options (3 category + 1 odd)
  correctAnswer: string; // The odd word
}

export interface OddWordAttempt {
  roundNumber: number;
  category: string;
  expectedOddWord: string;
  chosenWord: string;
  isCorrect: boolean;
  attemptCount: 1 | 2;
  timestamp: number;
}

export interface OddWordOutSessionResults {
  starsEarned: number;
  xpEarned: number;
  itemsCorrect: number;
  sessionLength: number;
  accuracy: number;
  isTimeExpired?: boolean;
}

export type OddWordOutStackParamList = {
  OddWordOutIntro: undefined;
  OddWordOutGame: undefined;
  OddWordOutSessionComplete: OddWordOutSessionResults;
};

/**
 * Purpose: Type definitions for the Aptitude & Logical Thinking games suite.
 *          Supports Pattern Match, Bigger/Smaller, What Comes Next, Number Pattern,
 *          Odd One Out, Logical Sequence, and Visual Reasoning.
 * Module: Aptitude Challenge — Types
 * Folder: frontend/src/screens/games/AptitudeChallenge
 */

export type AptitudeGameType =
  | 'pattern_match'
  | 'bigger_smaller'
  | 'what_comes_next'
  | 'number_pattern'
  | 'odd_one_out'
  | 'logical_sequence'
  | 'visual_reasoning';

export interface AptitudeOption {
  id: string;
  label: string;
  visual?: string; // Emoji, shape symbol, or visual token
  isCorrect: boolean;
}

export type StimulusLayout =
  | 'sequence'       // Horizontal series of tokens ending with ? (e.g. 🔴 🔵 🔴 🔵 ?)
  | 'comparison'     // 2 or 3 large cards to compare (e.g. 12 vs 8)
  | 'matrix'         // 2x2 grid with 1 missing cell
  | 'cause_effect'   // Step 1 -> Step 2 -> ?
  | 'cards_grid';    // 4 items displayed directly (e.g. Odd One Out)

export interface AptitudeQuestion {
  id: string;
  gameType: AptitudeGameType;
  roundNumber: number; // 1 to 5
  promptKey: string;   // Translation key for the question prompt
  promptFallback: string;
  spokenPhraseKey: string;
  stimulusLayout: StimulusLayout;
  stimulusTokens: {
    id: string;
    visual: string;
    label?: string;
    isPlaceholder?: boolean; // The '?' item
  }[];
  options: AptitudeOption[];
  explanationKey?: string;
  explanationFallback?: string;
}

export interface AptitudeRound {
  roundNumber: number; // 1 to 5
  question: AptitudeQuestion;
}

export interface AptitudeAttempt {
  roundNumber: number;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  attemptCount: number;
  timestamp: number;
}

export type AptitudeChallengeStackParamList = {
  AptitudeChallengeIntro: { gameType?: AptitudeGameType } | undefined;
  AptitudeChallengeGame: { gameType: AptitudeGameType };
  AptitudeChallengeSessionComplete: {
    gameType: AptitudeGameType;
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};

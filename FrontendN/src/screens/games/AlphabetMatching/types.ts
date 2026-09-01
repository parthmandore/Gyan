/**
 * Purpose: Type definitions for Alphabet Matching game module
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching
 */

export type GameMode = 'capital' | 'small' | 'numbers' | 'barakhadi';

export interface AlphabetMatchingState {
  mode: GameMode;
  currentLetter: string | null;
  selectedLetter: string | null;
  score: number;
  roundIndex: number;
  sessionLength: number;

  // Session metrics for POST /api/progress/submit
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number | null;
  roundResults: Array<'correct' | 'wrong' | 'pending'>;

  setMode: (mode: GameMode) => void;
  setCurrentLetter: (letter: string | null) => void;
  setSelectedLetter: (letter: string | null) => void;
  incrementScore: () => void;
  incrementRound: () => void;
  recordAttempt: (isCorrect: boolean) => void;
  recordRoundResult: (index: number, result: 'correct' | 'wrong') => void;
  setSessionStartTime: (time: number) => void;
  resetSession: () => void;
}

export type AlphabetMatchingStackParamList = {
  AlphabetMatchingModeSelection: undefined;
  AlphabetMatchingGame: undefined;
  AlphabetMatchingSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    durationSeconds: number;
  } | undefined;
};

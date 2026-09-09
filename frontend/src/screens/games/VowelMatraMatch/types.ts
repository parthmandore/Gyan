/**
 * Purpose: TypeScript type definitions for Vowel & Matra Match module.
 * Module: Vowel Matra Match — Types
 * Folder: frontend/src/screens/games/VowelMatraMatch
 */

export interface VowelMatraPairItem {
  vowel: string;       // Independent vowel (e.g. 'आ')
  matraForm: string;   // Consonant + Matra combined form (e.g. 'का')
  vowelName: string;
  matraName: string;
}

export interface GeneratedVowelMatraRound {
  pairs: VowelMatraPairItem[];
  vowelColumnOrder: number[];      // Display indices for left column (vowels)
  matraColumnOrder: number[];      // Display indices for right column (matras)
}

export interface VowelMatraMatchState {
  /* --- Round Data --- */
  roundPairs: VowelMatraPairItem[];
  vowelColumnOrder: number[];
  matraColumnOrder: number[];
  selectedVowel: string | null;
  matchedVowels: string[];

  /* --- Session Metrics --- */
  score: number;
  roundIndex: number;
  sessionLength: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number | null;

  /* --- Actions --- */
  advanceRound: (pairs: VowelMatraPairItem[], vowelOrder: number[], matraOrder: number[]) => void;
  setRound: (pairs: VowelMatraPairItem[], vowelOrder: number[], matraOrder: number[]) => void;
  selectVowel: (letter: string | null) => void;
  matchPair: (vowel: string) => void;
  incrementScore: (points: number) => void;
  incrementRound: () => void;
  recordAttempt: (isCorrect: boolean) => void;
  setSessionStartTime: (time: number) => void;
  setSessionLength: (length: number) => void;
  resetSession: () => void;
}

export type VowelMatraMatchStackParamList = {
  VowelMatraMatchIntro: undefined;
  VowelMatraMatchGame: undefined;
  VowelMatraMatchSessionComplete: {
    sessionId?: string;
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    durationSeconds: number;
    sessionResults?: Array<'correct' | 'wrong'>;
  } | undefined;
};

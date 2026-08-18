/**
 * Purpose: Type definitions for Capital & Small Letter Match game module.
 * Module: Capital Small Match
 * Folder: frontend/src/screens/games/CapitalSmallMatch
 *
 * Interaction model: Simultaneous multi-pair matching (NOT MCQ).
 * Each round presents 4 capital letters in one row and 4 lowercase letters
 * in a separately-shuffled row. The player selects a capital, then taps
 * its lowercase partner. Successfully matched pairs are visually locked.
 */

/* ------------------------------------------------------------------ */
/*  Data primitives                                                   */
/* ------------------------------------------------------------------ */

/** A single A↔a style letter-case pair. */
export interface LetterCasePair {
  capital: string;
  lowercase: string;
}

/** Status of a single pair within a round. */
export type PairMatchStatus = 'unmatched' | 'matched' | 'wrong';

/* ------------------------------------------------------------------ */
/*  Round state                                                       */
/* ------------------------------------------------------------------ */

/** Snapshot of one active round's data. */
export interface RoundState {
  /** The 4 letter-case pairs active this round. */
  pairs: LetterCasePair[];
  /** Display ordering for the top (capital) row — indices into `pairs`. */
  capitalRowOrder: number[];
  /** Display ordering for the bottom (lowercase) row — indices into `pairs`. */
  lowercaseRowOrder: number[];
}

/* ------------------------------------------------------------------ */
/*  Store state shape                                                 */
/* ------------------------------------------------------------------ */

export interface CapitalSmallMatchState {
  /* --- Round data --- */
  roundPairs: LetterCasePair[];
  capitalRowOrder: number[];
  lowercaseRowOrder: number[];
  selectedCapital: string | null;
  matchedPairs: string[];            // capitals whose pair is matched

  /* --- Session metrics (mirrors Game 1 discipline) --- */
  score: number;
  roundIndex: number;
  sessionLength: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number | null;

  /* --- Actions --- */
  advanceRound: (pairs: LetterCasePair[], capitalOrder: number[], lowercaseOrder: number[]) => void;
  setRound: (pairs: LetterCasePair[], capitalOrder: number[], lowercaseOrder: number[]) => void;
  selectCapital: (letter: string | null) => void;
  matchPair: (capital: string) => void;
  incrementScore: (points: number) => void;
  incrementRound: () => void;
  recordAttempt: (isCorrect: boolean) => void;
  setSessionStartTime: (time: number) => void;
  setSessionLength: (length: number) => void;
  resetSession: () => void;
}

/* ------------------------------------------------------------------ */
/*  Navigation param list                                             */
/* ------------------------------------------------------------------ */

export type CapitalSmallMatchStackParamList = {
  CapitalSmallMatchIntro: undefined;
  CapitalSmallMatchGame: undefined;
  CapitalSmallMatchSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    durationSeconds: number;
    sessionResults?: Array<'correct' | 'wrong'>;
  } | undefined;
};

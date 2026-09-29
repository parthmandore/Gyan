/**
 * Purpose: TypeScript type definitions for Language Pair Match game (Age 6).
 * Module: Language Pair Match — Types
 * Folder: frontend/src/screens/games/LanguagePairMatch
 */

export type LanguageCode = 'en' | 'hi' | 'mr';

export type ConceptCategory = 'animals' | 'fruits' | 'everyday' | 'nature';

/**
 * Single multilingual vocabulary concept with verified translations
 * across English, Hindi, and Marathi. Matching is strictly conceptId-based.
 */
export interface ConceptItem {
  id: string; // conceptId e.g. 'dog'
  category: ConceptCategory;
  image: string; // emoji illustration e.g. '🐶'
  translations: Record<LanguageCode, string>;
}

/** Represents an active card on the game board. */
export interface MatchCard {
  cardId: string;
  conceptId: string;
  language: LanguageCode;
  text: string;
  image?: string;
  side: 'source' | 'target';
}

export type PairCardState = 'idle' | 'selected' | 'matched' | 'wrong';

/** Detailed record of one match attempt for the report. */
export interface PairMatchAttempt {
  roundNumber: number;
  conceptId: string;
  sourceText: string;
  targetText: string;
  sourceImage: string;
  isCorrect: boolean;
  timestamp: number;
}

/** Round configuration generated dynamically. */
export interface LanguagePairMatchRound {
  roundNumber: number;
  pairCount: number;
  sourceCards: MatchCard[];
  targetCards: MatchCard[];
}

/** Store state shape for Language Pair Match. */
export interface LanguagePairMatchState {
  /* --- Active Round State --- */
  roundIndex: number;
  totalRounds: number;
  currentRound: LanguagePairMatchRound | null;
  matchedConceptIds: string[];
  selectedSourceId: string | null;
  selectedTargetId: string | null;
  wrongMatchPair: { sourceId: string; targetId: string } | null;

  /* --- Session Metrics --- */
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number | null;
  roundAttempts: PairMatchAttempt[];

  /* --- Actions --- */
  setRound: (round: LanguagePairMatchRound) => void;
  selectSource: (cardId: string | null) => void;
  selectTarget: (cardId: string | null) => void;
  matchSuccess: (conceptId: string, attempt: PairMatchAttempt) => void;
  matchWrong: (attempt: PairMatchAttempt) => void;
  clearSelection: () => void;
  clearWrongFlash: () => void;
  nextRound: () => void;
  setSessionStartTime: (time: number) => void;
  resetSession: () => void;
}

export type LanguagePairMatchStackParamList = {
  LanguagePairMatchIntro: undefined;
  LanguagePairMatchGame: {
    motherTongue?: LanguageCode;
    learningLanguage?: LanguageCode;
  } | undefined;
  LanguagePairMatchSessionComplete: {
    sessionId?: string;
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    durationSeconds: number;
    roundAttempts?: PairMatchAttempt[];
  } | undefined;
};

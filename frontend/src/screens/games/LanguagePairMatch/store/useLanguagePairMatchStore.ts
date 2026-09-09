/**
 * Purpose: Zustand state store for Language Pair Match game.
 * Module: Language Pair Match — Store
 * Folder: frontend/src/screens/games/LanguagePairMatch/store
 */

import { create } from 'zustand';
import {
  LanguagePairMatchRound,
  LanguagePairMatchState,
  PairMatchAttempt,
} from '../types';
import { TOTAL_GAME_ROUNDS } from '../logic/roundGenerator';

export const useLanguagePairMatchStore = create<LanguagePairMatchState>((set) => ({
  /* --- Active Round State --- */
  roundIndex: 0,
  totalRounds: TOTAL_GAME_ROUNDS,
  currentRound: null,
  matchedConceptIds: [],
  selectedSourceId: null,
  selectedTargetId: null,
  wrongMatchPair: null,

  /* --- Session Metrics --- */
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: null,
  roundAttempts: [],

  /* --- Actions --- */
  setRound: (round: LanguagePairMatchRound) =>
    set({
      currentRound: round,
      matchedConceptIds: [],
      selectedSourceId: null,
      selectedTargetId: null,
      wrongMatchPair: null,
    }),

  selectSource: (cardId: string | null) =>
    set({ selectedSourceId: cardId }),

  selectTarget: (cardId: string | null) =>
    set({ selectedTargetId: cardId }),

  matchSuccess: (conceptId: string, attempt: PairMatchAttempt) =>
    set((state) => ({
      matchedConceptIds: [...state.matchedConceptIds, conceptId],
      selectedSourceId: null,
      selectedTargetId: null,
      wrongMatchPair: null,
      score: state.score + 10,
      itemsCorrect: state.itemsCorrect + 1,
      itemsAttempted: state.itemsAttempted + 1,
      roundAttempts: [...state.roundAttempts, attempt],
    })),

  matchWrong: (attempt: PairMatchAttempt) =>
    set((state) => ({
      itemsAttempted: state.itemsAttempted + 1,
      roundAttempts: [...state.roundAttempts, attempt],
    })),

  clearSelection: () =>
    set({
      selectedSourceId: null,
      selectedTargetId: null,
    }),

  clearWrongFlash: () =>
    set({ wrongMatchPair: null }),

  nextRound: () =>
    set((state) => ({
      roundIndex: state.roundIndex + 1,
      currentRound: null,
      matchedConceptIds: [],
      selectedSourceId: null,
      selectedTargetId: null,
      wrongMatchPair: null,
    })),

  setSessionStartTime: (sessionStartTime: number) =>
    set({ sessionStartTime }),

  resetSession: () =>
    set({
      roundIndex: 0,
      totalRounds: TOTAL_GAME_ROUNDS,
      currentRound: null,
      matchedConceptIds: [],
      selectedSourceId: null,
      selectedTargetId: null,
      wrongMatchPair: null,
      score: 0,
      itemsAttempted: 0,
      itemsCorrect: 0,
      sessionStartTime: null,
      roundAttempts: [],
    }),
}));

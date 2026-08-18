/**
 * Purpose: Zustand state store for Capital & Small Letter Match game.
 * Module: Capital Small Match — Store
 * Folder: frontend/src/screens/games/CapitalSmallMatch/store
 *
 * Follows the same full-reset discipline as Game 1's store:
 * resetSession() wipes everything — score, rounds, metrics, selection state.
 */

import { create } from 'zustand';
import { CapitalSmallMatchState, LetterCasePair } from '../types';

const INITIAL_SESSION_LENGTH = 3;

export const useCapitalSmallMatchStore = create<CapitalSmallMatchState>((set) => ({
  /* --- Round data --- */
  roundPairs: [],
  capitalRowOrder: [],
  lowercaseRowOrder: [],
  selectedCapital: null,
  matchedPairs: [],

  /* --- Session metrics --- */
  score: 0,
  roundIndex: 0,
  sessionLength: INITIAL_SESSION_LENGTH,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: null,

  /* --- Actions --- */
  advanceRound: (pairs: LetterCasePair[], capitalOrder: number[], lowercaseOrder: number[]) =>
    set((state) => ({
      roundIndex: state.roundIndex + 1,
      roundPairs: pairs,
      capitalRowOrder: capitalOrder,
      lowercaseRowOrder: lowercaseOrder,
      selectedCapital: null,
      matchedPairs: [],
    })),

  setRound: (pairs: LetterCasePair[], capitalOrder: number[], lowercaseOrder: number[]) =>
    set({
      roundPairs: pairs,
      capitalRowOrder: capitalOrder,
      lowercaseRowOrder: lowercaseOrder,
      selectedCapital: null,
      matchedPairs: [],
    }),

  selectCapital: (letter: string | null) =>
    set({ selectedCapital: letter }),

  matchPair: (capital: string) =>
    set((state) => ({
      matchedPairs: state.matchedPairs.includes(capital) ? state.matchedPairs : [...state.matchedPairs, capital],
      selectedCapital: null,
    })),

  incrementScore: (points: number) =>
    set((state) => ({ score: state.score + points })),

  incrementRound: () =>
    set((state) => ({ roundIndex: state.roundIndex + 1 })),

  recordAttempt: (isCorrect: boolean) =>
    set((state) => ({
      itemsAttempted: state.itemsAttempted + 1,
      itemsCorrect: state.itemsCorrect + (isCorrect ? 1 : 0),
    })),

  setSessionStartTime: (time: number) =>
    set({ sessionStartTime: time }),

  setSessionLength: (length: number) =>
    set({ sessionLength: length }),

  resetSession: () =>
    set({
      roundPairs: [],
      capitalRowOrder: [],
      lowercaseRowOrder: [],
      selectedCapital: null,
      matchedPairs: [],
      score: 0,
      roundIndex: 0,
      sessionLength: INITIAL_SESSION_LENGTH,
      itemsAttempted: 0,
      itemsCorrect: 0,
      sessionStartTime: null,
    }),
}));

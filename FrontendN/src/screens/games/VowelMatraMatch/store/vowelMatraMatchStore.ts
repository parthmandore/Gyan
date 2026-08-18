/**
 * Purpose: Zustand state store for Vowel & Matra Match game.
 * Module: Vowel Matra Match — Store
 * Folder: frontend/src/screens/games/VowelMatraMatch/store
 */

import { create } from 'zustand';
import { VowelMatraMatchState, VowelMatraPairItem } from '../types';

const INITIAL_SESSION_LENGTH = 11; // 11 total pairs across 3 rounds

export const useVowelMatraMatchStore = create<VowelMatraMatchState>((set) => ({
  /* --- Round Data --- */
  roundPairs: [],
  vowelColumnOrder: [],
  matraColumnOrder: [],
  selectedVowel: null,
  matchedVowels: [],

  /* --- Session Metrics --- */
  score: 0,
  roundIndex: 0,
  sessionLength: INITIAL_SESSION_LENGTH,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: null,

  /* --- Actions --- */
  advanceRound: (pairs: VowelMatraPairItem[], vowelOrder: number[], matraOrder: number[]) =>
    set((state) => ({
      roundIndex: state.roundIndex + 1,
      roundPairs: pairs,
      vowelColumnOrder: vowelOrder,
      matraColumnOrder: matraOrder,
      selectedVowel: null,
      matchedVowels: [],
    })),

  setRound: (pairs: VowelMatraPairItem[], vowelOrder: number[], matraOrder: number[]) =>
    set({
      roundPairs: pairs,
      vowelColumnOrder: vowelOrder,
      matraColumnOrder: matraOrder,
      selectedVowel: null,
      matchedVowels: [],
    }),

  selectVowel: (vowel: string | null) =>
    set({ selectedVowel: vowel }),

  matchPair: (vowel: string) =>
    set((state) => ({
      matchedVowels: state.matchedVowels.includes(vowel) ? state.matchedVowels : [...state.matchedVowels, vowel],
      selectedVowel: null,
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
      vowelColumnOrder: [],
      matraColumnOrder: [],
      selectedVowel: null,
      matchedVowels: [],
      score: 0,
      roundIndex: 0,
      sessionLength: INITIAL_SESSION_LENGTH,
      itemsAttempted: 0,
      itemsCorrect: 0,
      sessionStartTime: null,
    }),
}));

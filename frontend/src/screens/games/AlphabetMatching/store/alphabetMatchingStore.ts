/**
 * Purpose: Zustand state management store for Alphabet Matching game.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching/store
 */

import { create } from 'zustand';
import { AlphabetMatchingState, GameMode } from '../types';

export const useAlphabetMatchingStore = create<AlphabetMatchingState>((set) => ({
  mode: 'capital',
  currentLetter: null,
  selectedLetter: null,
  score: 0,
  roundIndex: 0,
  sessionLength: 10,

  // Progress metrics
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: null,
  roundResults: Array(10).fill('pending'),

  setMode: (mode: GameMode) => set({ mode }),
  setCurrentLetter: (currentLetter: string | null) => set({ currentLetter }),
  setSelectedLetter: (selectedLetter: string | null) => set({ selectedLetter }),
  incrementScore: () => set((state) => ({ score: state.score + 1 })),
  incrementRound: () => set((state) => ({ roundIndex: state.roundIndex + 1 })),

  recordAttempt: (isCorrect: boolean) =>
    set((state) => ({
      itemsAttempted: state.itemsAttempted + 1,
      itemsCorrect: isCorrect ? state.itemsCorrect + 1 : state.itemsCorrect,
    })),

  recordRoundResult: (index: number, result: 'correct' | 'wrong') =>
    set((state) => {
      const updated = [...state.roundResults];
      updated[index] = result;
      return { roundResults: updated };
    }),

  setSessionStartTime: (sessionStartTime: number) => set({ sessionStartTime }),

  resetSession: () =>
    set((state) => ({
      mode: state.mode || 'capital',
      currentLetter: null,
      selectedLetter: null,
      score: 0,
      roundIndex: 0,
      itemsAttempted: 0,
      itemsCorrect: 0,
      sessionStartTime: null,
      roundResults: Array(10).fill('pending'),
    })),
}));

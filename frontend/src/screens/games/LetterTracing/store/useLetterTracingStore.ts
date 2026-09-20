/**
 * Purpose: Session state store for Letter Tracing using Zustand.
 * Module: Letter Tracing — Store
 * Folder: frontend/src/screens/games/LetterTracing/store
 */

import { create } from 'zustand';
import { LetterRound, TracingAttempt, Stroke } from '../types';
import { TOTAL_TRACING_ROUNDS } from '../logic/roundGenerator';

export interface LetterTracingState {
  roundIndex: number;
  totalRounds: number;
  rounds: LetterRound[];
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  currentStrokes: Stroke[];
  sessionStartTime: number;
  attempts: TracingAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: LetterRound[]) => void;
  setCurrentStrokes: (strokes: Stroke[]) => void;
  undoLastStroke: () => void;
  clearCurrentStrokes: () => void;
  recordAttempt: (attempt: Omit<TracingAttempt, 'timestamp'>) => void;
  nextRound: () => void;
  resetSession: () => void;
}

export const useLetterTracingStore = create<LetterTracingState>((set) => ({
  roundIndex: 0,
  totalRounds: TOTAL_TRACING_ROUNDS,
  rounds: [],
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  currentStrokes: [],
  sessionStartTime: Date.now(),
  attempts: [],
  isSessionActive: false,

  startSession: (rounds: LetterRound[]) => {
    set({
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_TRACING_ROUNDS,
      rounds,
      score: 0,
      itemsAttempted: 0,
      itemsCorrect: 0,
      currentStrokes: [],
      sessionStartTime: Date.now(),
      attempts: [],
      isSessionActive: true,
    });
  },

  setCurrentStrokes: (strokes: Stroke[]) => {
    set({ currentStrokes: strokes });
  },

  undoLastStroke: () => {
    set((state) => ({
      currentStrokes: state.currentStrokes.slice(0, -1),
    }));
  },

  clearCurrentStrokes: () => {
    set({ currentStrokes: [] });
  },

  recordAttempt: (attemptData) => {
    const newAttempt: TracingAttempt = {
      ...attemptData,
      timestamp: Date.now(),
    };

    set((state) => {
      const isCorrect = attemptData.isSuccess;
      return {
        attempts: [...state.attempts, newAttempt],
        itemsAttempted: state.itemsAttempted + 1,
        itemsCorrect: state.itemsCorrect + (isCorrect ? 1 : 0),
        score: state.score + (isCorrect ? Math.round(attemptData.score / 5) : 0),
      };
    });
  },

  nextRound: () => {
    set((state) => ({
      roundIndex: Math.min(state.roundIndex + 1, state.totalRounds),
      currentStrokes: [],
    }));
  },

  resetSession: () => {
    set({
      roundIndex: 0,
      rounds: [],
      score: 0,
      itemsAttempted: 0,
      itemsCorrect: 0,
      currentStrokes: [],
      sessionStartTime: Date.now(),
      attempts: [],
      isSessionActive: false,
    });
  },
}));

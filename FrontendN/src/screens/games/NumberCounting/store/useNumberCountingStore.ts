/**
 * Purpose: Session state store for Number Counting (Age 5).
 * Module: Number Counting — Store
 * Folder: frontend/src/screens/games/NumberCounting/store
 */

import { create } from 'zustand';
import { CountingQuestion, CountingAttempt } from '../types';

export interface NumberCountingState {
  sessionId: string;
  sessionStartTime: number;
  rounds: CountingQuestion[];
  roundIndex: number;
  itemsCorrect: number;
  itemsAttempted: number;
  score: number;
  attempts: CountingAttempt[];
  roundResults: Array<'correct' | 'wrong' | 'pending'>;
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: CountingQuestion[]) => void;
  recordAttempt: (attempt: CountingAttempt) => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useNumberCountingStore = create<NumberCountingState>((set) => ({
  sessionId: '',
  sessionStartTime: 0,
  rounds: [],
  roundIndex: 0,
  itemsCorrect: 0,
  itemsAttempted: 0,
  score: 0,
  attempts: [],
  roundResults: ['pending', 'pending', 'pending', 'pending', 'pending'],
  isSessionActive: false,

  startSession: (rounds: CountingQuestion[]) => {
    const sessionId = `nc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set({
      sessionId,
      sessionStartTime: Date.now(),
      rounds,
      roundIndex: 0,
      itemsCorrect: 0,
      itemsAttempted: 0,
      score: 0,
      attempts: [],
      roundResults: ['pending', 'pending', 'pending', 'pending', 'pending'],
      isSessionActive: true,
    });
  },

  recordAttempt: (attempt: CountingAttempt) => {
    set((state) => {
      const updatedResults = [...state.roundResults];
      if (updatedResults[state.roundIndex] === 'pending') {
        updatedResults[state.roundIndex] = attempt.isCorrect ? 'correct' : 'wrong';
      }

      return {
        attempts: [...state.attempts, attempt],
        itemsAttempted: state.itemsAttempted + 1,
        itemsCorrect: attempt.isCorrect ? state.itemsCorrect + 1 : state.itemsCorrect,
        score: attempt.isCorrect ? state.score + 10 : state.score,
        roundResults: updatedResults,
      };
    });
  },

  nextRound: () => {
    set((state) => ({
      roundIndex: state.roundIndex + 1,
    }));
  },

  resetGame: () => {
    set({
      sessionId: '',
      sessionStartTime: 0,
      rounds: [],
      roundIndex: 0,
      itemsCorrect: 0,
      itemsAttempted: 0,
      score: 0,
      attempts: [],
      roundResults: ['pending', 'pending', 'pending', 'pending', 'pending'],
      isSessionActive: false,
    });
  },
}));

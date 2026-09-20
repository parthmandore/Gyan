/**
 * Purpose: Session state store for Put in Order (Age 5).
 * Module: Put in Order — Store
 * Folder: frontend/src/screens/games/PutInOrder/store
 */

import { create } from 'zustand';
import { OrderQuestion, OrderAttempt } from '../types';

export interface PutInOrderState {
  sessionId: string;
  sessionStartTime: number;
  rounds: OrderQuestion[];
  roundIndex: number;
  itemsCorrect: number;
  itemsAttempted: number;
  score: number;
  attempts: OrderAttempt[];
  roundResults: Array<'correct' | 'wrong' | 'pending'>;
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: OrderQuestion[]) => void;
  recordAttempt: (attempt: OrderAttempt) => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const usePutInOrderStore = create<PutInOrderState>((set) => ({
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

  startSession: (rounds: OrderQuestion[]) => {
    const sessionId = `pio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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

  recordAttempt: (attempt: OrderAttempt) => {
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

/**
 * Purpose: Session state store for Educational Mathematics Games using Zustand.
 * Module: Math Challenge — Store
 * Folder: frontend/src/screens/games/MathChallenge/store
 */

import { create } from 'zustand';
import { MathOperation, MathRound, MathAttempt } from '../types';
import { TOTAL_MATH_ROUNDS } from '../logic/questionGenerator';

export interface MathChallengeState {
  operation: MathOperation;
  roundIndex: number;
  totalRounds: number;
  rounds: MathRound[];
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number;
  attempts: MathAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (operation: MathOperation, rounds: MathRound[]) => void;
  recordAttempt: (attempt: Omit<MathAttempt, 'timestamp'>) => void;
  nextRound: () => void;
  resetSession: () => void;
}

export const useMathChallengeStore = create<MathChallengeState>((set) => ({
  operation: 'addition',
  roundIndex: 0,
  totalRounds: TOTAL_MATH_ROUNDS,
  rounds: [],
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: Date.now(),
  attempts: [],
  isSessionActive: false,

  startSession: (operation: MathOperation, rounds: MathRound[]) => {
    set({
      operation,
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_MATH_ROUNDS,
      rounds,
      score: 0,
      itemsAttempted: 0,
      itemsCorrect: 0,
      sessionStartTime: Date.now(),
      attempts: [],
      isSessionActive: true,
    });
  },

  recordAttempt: (attemptData) => {
    const newAttempt: MathAttempt = {
      ...attemptData,
      timestamp: Date.now(),
    };

    set((state) => {
      const isFirstAttempt = attemptData.attemptCount === 1;
      const isCorrect = attemptData.isCorrect;

      return {
        attempts: [...state.attempts, newAttempt],
        itemsAttempted: state.itemsAttempted + (isFirstAttempt ? 1 : 0),
        itemsCorrect: state.itemsCorrect + (isCorrect && isFirstAttempt ? 1 : 0),
        score: state.score + (isCorrect ? (isFirstAttempt ? 10 : 5) : 0),
      };
    });
  },

  nextRound: () => {
    set((state) => ({
      roundIndex: Math.min(state.roundIndex + 1, state.totalRounds),
    }));
  },

  resetSession: () => {
    set({
      roundIndex: 0,
      rounds: [],
      score: 0,
      itemsAttempted: 0,
      itemsCorrect: 0,
      sessionStartTime: Date.now(),
      attempts: [],
      isSessionActive: false,
    });
  },
}));

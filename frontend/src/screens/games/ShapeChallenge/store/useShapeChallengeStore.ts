/**
 * Purpose: Session state store for Shape Challenge using Zustand.
 * Module: Shape Challenge — Store
 * Folder: frontend/src/screens/games/ShapeChallenge/store
 */

import { create } from 'zustand';
import { ShapeRound, ShapeAttempt } from '../types';
import { TOTAL_SHAPE_ROUNDS } from '../logic/roundGenerator';

export interface ShapeChallengeState {
  roundIndex: number;
  totalRounds: number;
  rounds: ShapeRound[];
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number;
  attempts: ShapeAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: ShapeRound[]) => void;
  recordAttempt: (attempt: Omit<ShapeAttempt, 'timestamp'>) => void;
  nextRound: () => void;
  resetSession: () => void;
}

export const useShapeChallengeStore = create<ShapeChallengeState>((set, get) => ({
  roundIndex: 0,
  totalRounds: TOTAL_SHAPE_ROUNDS,
  rounds: [],
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: Date.now(),
  attempts: [],
  isSessionActive: false,

  startSession: (rounds: ShapeRound[]) => {
    set({
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_SHAPE_ROUNDS,
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
    const newAttempt: ShapeAttempt = {
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
        score: state.score + (isCorrect ? (isFirstAttempt ? 15 : 10) : 0),
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

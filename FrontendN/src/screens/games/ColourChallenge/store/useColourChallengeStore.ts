/**
 * Purpose: Session state store for Colour Challenge using Zustand.
 * Module: Colour Challenge — Store
 * Folder: frontend/src/screens/games/ColourChallenge/store
 */

import { create } from 'zustand';
import { ColorRound, ColorAttempt } from '../types';
import { TOTAL_COLOUR_ROUNDS } from '../logic/roundGenerator';

export interface ColourChallengeState {
  roundIndex: number;
  totalRounds: number;
  rounds: ColorRound[];
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number;
  attempts: ColorAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: ColorRound[]) => void;
  recordAttempt: (attempt: Omit<ColorAttempt, 'timestamp'>) => void;
  nextRound: () => void;
  resetSession: () => void;
}

export const useColourChallengeStore = create<ColourChallengeState>((set, get) => ({
  roundIndex: 0,
  totalRounds: TOTAL_COLOUR_ROUNDS,
  rounds: [],
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: Date.now(),
  attempts: [],
  isSessionActive: false,

  startSession: (rounds: ColorRound[]) => {
    set({
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_COLOUR_ROUNDS,
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
    const newAttempt: ColorAttempt = {
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

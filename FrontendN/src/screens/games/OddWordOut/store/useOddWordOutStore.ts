/**
 * Purpose: Session state store for Odd Word Out using Zustand.
 * Module: Odd Word Out — Store
 * Folder: frontend/src/screens/games/OddWordOut/store
 */

import { create } from 'zustand';
import { OddWordQuestion, OddWordAttempt } from '../types';
import { TOTAL_ODD_WORD_OUT_ROUNDS } from '../logic/questionGenerator';

export interface OddWordOutState {
  sessionId: string;
  sessionStartTime: number;
  rounds: OddWordQuestion[];
  roundIndex: number;
  totalRounds: number;
  itemsCorrect: number;
  itemsAttempted: number;
  score: number;
  attempts: OddWordAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: OddWordQuestion[]) => void;
  recordAttempt: (attempt: OddWordAttempt) => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useOddWordOutStore = create<OddWordOutState>((set) => ({
  sessionId: '',
  sessionStartTime: 0,
  rounds: [],
  roundIndex: 0,
  totalRounds: TOTAL_ODD_WORD_OUT_ROUNDS,
  itemsCorrect: 0,
  itemsAttempted: 0,
  score: 0,
  attempts: [],
  isSessionActive: false,

  startSession: (rounds: OddWordQuestion[]) => {
    const sessionId = `owo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set({
      sessionId,
      sessionStartTime: Date.now(),
      rounds,
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_ODD_WORD_OUT_ROUNDS,
      itemsCorrect: 0,
      itemsAttempted: 0,
      score: 0,
      attempts: [],
      isSessionActive: true,
    });
  },

  recordAttempt: (attempt: OddWordAttempt) => {
    set((state) => {
      const isNewSuccess =
        attempt.isCorrect &&
        !state.attempts.some(
          (a) => a.roundNumber === attempt.roundNumber && a.isCorrect
        );
      const xpToAdd = attempt.isCorrect
        ? attempt.attemptCount === 1
          ? 15
          : 10
        : 0;

      return {
        attempts: [...state.attempts, attempt],
        itemsAttempted: state.itemsAttempted + 1,
        itemsCorrect: isNewSuccess ? state.itemsCorrect + 1 : state.itemsCorrect,
        score: state.score + xpToAdd,
      };
    });
  },

  nextRound: () => {
    set((state) => ({
      roundIndex: Math.min(state.roundIndex + 1, state.rounds.length),
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
      isSessionActive: false,
    });
  },
}));

/**
 * Purpose: Session state store for Find the Correct Word using Zustand.
 * Module: Find the Correct Word — Store
 * Folder: frontend/src/screens/games/FindTheCorrectWord/store
 */

import { create } from 'zustand';
import { CorrectWordQuestion, WordChoiceAttempt } from '../types';
import { TOTAL_FIND_CORRECT_WORD_ROUNDS } from '../logic/questionGenerator';

export interface FindTheCorrectWordState {
  sessionId: string;
  sessionStartTime: number;
  rounds: CorrectWordQuestion[];
  roundIndex: number;
  totalRounds: number;
  itemsCorrect: number;
  itemsAttempted: number;
  score: number;
  attempts: WordChoiceAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: CorrectWordQuestion[]) => void;
  recordAttempt: (attempt: WordChoiceAttempt) => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useFindTheCorrectWordStore = create<FindTheCorrectWordState>((set) => ({
  sessionId: '',
  sessionStartTime: 0,
  rounds: [],
  roundIndex: 0,
  totalRounds: TOTAL_FIND_CORRECT_WORD_ROUNDS,
  itemsCorrect: 0,
  itemsAttempted: 0,
  score: 0,
  attempts: [],
  isSessionActive: false,

  startSession: (rounds: CorrectWordQuestion[]) => {
    const sessionId = `fcw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set({
      sessionId,
      sessionStartTime: Date.now(),
      rounds,
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_FIND_CORRECT_WORD_ROUNDS,
      itemsCorrect: 0,
      itemsAttempted: 0,
      score: 0,
      attempts: [],
      isSessionActive: true,
    });
  },

  recordAttempt: (attempt: WordChoiceAttempt) => {
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

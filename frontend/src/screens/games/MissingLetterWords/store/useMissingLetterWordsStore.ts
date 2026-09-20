/**
 * Purpose: Session state store for Missing Letter Words using Zustand.
 * Module: Missing Letter Words — Store
 * Folder: frontend/src/screens/games/MissingLetterWords/store
 */

import { create } from 'zustand';
import { WordQuestion, WordAttempt } from '../types';
import { TOTAL_MISSING_LETTER_WORDS_ROUNDS } from '../logic/questionGenerator';

export interface MissingLetterWordsState {
  sessionId: string;
  sessionStartTime: number;
  rounds: WordQuestion[];
  roundIndex: number;
  totalRounds: number;
  itemsCorrect: number;
  itemsAttempted: number;
  score: number;
  attempts: WordAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: WordQuestion[]) => void;
  recordAttempt: (attempt: WordAttempt) => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useMissingLetterWordsStore = create<MissingLetterWordsState>((set) => ({
  sessionId: '',
  sessionStartTime: 0,
  rounds: [],
  roundIndex: 0,
  totalRounds: TOTAL_MISSING_LETTER_WORDS_ROUNDS,
  itemsCorrect: 0,
  itemsAttempted: 0,
  score: 0,
  attempts: [],
  isSessionActive: false,

  startSession: (rounds: WordQuestion[]) => {
    const sessionId = `mlw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set({
      sessionId,
      sessionStartTime: Date.now(),
      rounds,
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_MISSING_LETTER_WORDS_ROUNDS,
      itemsCorrect: 0,
      itemsAttempted: 0,
      score: 0,
      attempts: [],
      isSessionActive: true,
    });
  },

  recordAttempt: (attempt: WordAttempt) => {
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

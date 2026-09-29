/**
 * Purpose: Session state store for Missing Letters (Age 5).
 * Module: Missing Letters — Store
 * Folder: frontend/src/screens/games/MissingLetters/store
 */

import { create } from 'zustand';
import { MissingLettersRound, MissingLettersAttempt } from '../types';

export interface MissingLettersState {
  sessionId: string;
  sessionStartTime: number;
  rounds: MissingLettersRound[];
  roundIndex: number;
  itemsCorrect: number;
  itemsAttempted: number;
  score: number;
  attempts: MissingLettersAttempt[];
  roundResults: Array<'correct' | 'wrong' | 'pending'>;
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: MissingLettersRound[]) => void;
  recordAttempt: (attempt: MissingLettersAttempt) => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useMissingLettersStore = create<MissingLettersState>((set) => ({
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

  startSession: (rounds: MissingLettersRound[]) => {
    const sessionId = `ml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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

  recordAttempt: (attempt: MissingLettersAttempt) => {
    set((state) => {
      const isFirstTry = attempt.attemptCount === 1;
      const updatedResults = [...state.roundResults];
      if (updatedResults[state.roundIndex] === 'pending') {
        updatedResults[state.roundIndex] = attempt.isCorrect ? 'correct' : 'wrong';
      }

      return {
        attempts: [...state.attempts, attempt],
        itemsAttempted: state.itemsAttempted + 1,
        itemsCorrect: attempt.isCorrect && isFirstTry ? state.itemsCorrect + 1 : state.itemsCorrect,
        score: attempt.isCorrect ? state.score + 10 : state.score,
        roundResults: updatedResults,
      };
    });
  },

  nextRound: () => {
    set((state) => ({
      roundIndex: Math.min(state.roundIndex + 1, state.rounds.length - 1),
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

/**
 * Purpose: Session state store for Guess the Shape using Zustand.
 * Module: Guess the Shape — Store
 * Folder: frontend/src/screens/games/GuessTheShape/store
 */

import { create } from 'zustand';
import { ShapeQuestion, ShapeGuessAttempt } from '../types';
import { TOTAL_GUESS_SHAPE_ROUNDS } from '../logic/questionGenerator';

export interface GuessTheShapeState {
  sessionId: string;
  sessionStartTime: number;
  rounds: ShapeQuestion[];
  roundIndex: number;
  totalRounds: number;
  itemsCorrect: number;
  itemsAttempted: number;
  score: number;
  attempts: ShapeGuessAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (rounds: ShapeQuestion[]) => void;
  recordAttempt: (attempt: ShapeGuessAttempt) => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useGuessTheShapeStore = create<GuessTheShapeState>((set) => ({
  sessionId: '',
  sessionStartTime: 0,
  rounds: [],
  roundIndex: 0,
  totalRounds: TOTAL_GUESS_SHAPE_ROUNDS,
  itemsCorrect: 0,
  itemsAttempted: 0,
  score: 0,
  attempts: [],
  isSessionActive: false,

  startSession: (rounds: ShapeQuestion[]) => {
    const sessionId = `gts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set({
      sessionId,
      sessionStartTime: Date.now(),
      rounds,
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_GUESS_SHAPE_ROUNDS,
      itemsCorrect: 0,
      itemsAttempted: 0,
      score: 0,
      attempts: [],
      isSessionActive: true,
    });
  },

  recordAttempt: (attempt: ShapeGuessAttempt) => {
    set((state) => {
      const isNewSuccess = attempt.isCorrect && !state.attempts.some(
        (a) => a.roundNumber === attempt.roundNumber && a.isCorrect
      );
      const xpToAdd = attempt.isCorrect ? (attempt.attemptCount === 1 ? 15 : 10) : 0;

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

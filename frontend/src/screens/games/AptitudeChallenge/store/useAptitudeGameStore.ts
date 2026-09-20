/**
 * Purpose: Session state store for Aptitude & Logical Thinking games using Zustand.
 * Module: Aptitude Challenge — Store
 * Folder: frontend/src/screens/games/AptitudeChallenge/store
 */

import { create } from 'zustand';
import { AptitudeGameType, AptitudeRound, AptitudeAttempt } from '../types';
import { TOTAL_APTITUDE_ROUNDS } from '../logic/questionGenerator';

export interface AptitudeGameState {
  gameType: AptitudeGameType;
  roundIndex: number;
  totalRounds: number;
  rounds: AptitudeRound[];
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number;
  attempts: AptitudeAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (gameType: AptitudeGameType, rounds: AptitudeRound[]) => void;
  recordAttempt: (attempt: Omit<AptitudeAttempt, 'timestamp'>) => void;
  nextRound: () => void;
  resetSession: () => void;
}

export const useAptitudeGameStore = create<AptitudeGameState>((set) => ({
  gameType: 'pattern_match',
  roundIndex: 0,
  totalRounds: TOTAL_APTITUDE_ROUNDS,
  rounds: [],
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: Date.now(),
  attempts: [],
  isSessionActive: false,

  startSession: (gameType: AptitudeGameType, rounds: AptitudeRound[]) => {
    set({
      gameType,
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_APTITUDE_ROUNDS,
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
    const newAttempt: AptitudeAttempt = {
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

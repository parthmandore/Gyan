/**
 * Purpose: Session state store for Basic Grammar Games using Zustand.
 * Module: Grammar Challenge — Store
 * Folder: frontend/src/screens/games/GrammarChallenge/store
 */

import { create } from 'zustand';
import { GrammarTopic, GrammarRound, GrammarAttempt } from '../types';
import { TOTAL_GRAMMAR_ROUNDS } from '../logic/questionGenerator';

export interface GrammarGameState {
  topic: GrammarTopic;
  roundIndex: number;
  totalRounds: number;
  rounds: GrammarRound[];
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  sessionStartTime: number;
  attempts: GrammarAttempt[];
  isSessionActive: boolean;

  // Actions
  startSession: (topic: GrammarTopic, rounds: GrammarRound[]) => void;
  recordAttempt: (attempt: Omit<GrammarAttempt, 'timestamp'>) => void;
  nextRound: () => void;
  resetSession: () => void;
}

export const useGrammarGameStore = create<GrammarGameState>((set) => ({
  topic: 'noun_or_verb',
  roundIndex: 0,
  totalRounds: TOTAL_GRAMMAR_ROUNDS,
  rounds: [],
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  sessionStartTime: Date.now(),
  attempts: [],
  isSessionActive: false,

  startSession: (topic: GrammarTopic, rounds: GrammarRound[]) => {
    set({
      topic,
      roundIndex: 0,
      totalRounds: rounds.length || TOTAL_GRAMMAR_ROUNDS,
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
    const newAttempt: GrammarAttempt = {
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

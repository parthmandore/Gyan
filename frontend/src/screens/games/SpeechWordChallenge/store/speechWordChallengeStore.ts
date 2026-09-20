/**
 * Purpose: Zustand state store for Speech Word Challenge.
 *          Tracks round progress, scores, and detailed session attempt records for the Speech Report.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/store
 */

import { create } from 'zustand';
import {
  SpeechChallengeItem,
  SpeechWordChallengeState,
  RecordingState,
  SpeechRoundAttempt,
} from '../types';

export const useSpeechWordChallengeStore = create<SpeechWordChallengeState>((set) => ({
  // Session Metrics
  roundIndex: 0,
  sessionLength: 10,
  score: 0,
  itemsAttempted: 0,
  itemsCorrect: 0,
  roundResults: Array(10).fill('pending'),
  sessionAttempts: [],
  sessionStartTime: null,

  // Round State
  currentItem: null,
  recordingState: 'idle',
  lastRecognizedText: null,
  lastMatchResult: null,
  attemptCount: 0,
  roundLocked: false,

  setRoundItem: (item: SpeechChallengeItem) =>
    set({
      currentItem: item,
      recordingState: 'idle',
      lastRecognizedText: null,
      lastMatchResult: null,
      attemptCount: 0,
      roundLocked: false,
    }),

  setRecordingState: (recordingState: RecordingState) => set({ recordingState }),

  recordAnswer: (recognized: string, isCorrect: boolean) =>
    set((state) => {
      const newAttemptCount = state.attemptCount + 1;
      const newRoundResults = [...state.roundResults];

      if (isCorrect) {
        newRoundResults[state.roundIndex] = 'correct';
      } else if (newAttemptCount >= 2) {
        newRoundResults[state.roundIndex] = 'wrong';
      }

      return {
        lastRecognizedText: recognized,
        lastMatchResult: isCorrect ? 'correct' : 'wrong',
        attemptCount: newAttemptCount,
        score: isCorrect ? state.score + 1 : state.score,
        itemsAttempted: state.itemsAttempted + 1,
        itemsCorrect: isCorrect ? state.itemsCorrect + 1 : state.itemsCorrect,
        roundResults: newRoundResults,
        roundLocked: isCorrect || newAttemptCount >= 2,
      };
    }),

  recordDetailedAttempt: (attempt: SpeechRoundAttempt) =>
    set((state) => ({
      sessionAttempts: [...state.sessionAttempts, attempt],
    })),

  recordEmptyAttempt: () =>
    set({
      lastMatchResult: 'empty',
      recordingState: 'idle',
    }),

  incrementScore: () => set((state) => ({ score: state.score + 1 })),

  nextRound: () =>
    set((state) => ({
      roundIndex: state.roundIndex + 1,
      currentItem: null,
      recordingState: 'idle',
      lastRecognizedText: null,
      lastMatchResult: null,
      attemptCount: 0,
      roundLocked: false,
    })),

  setSessionStartTime: (sessionStartTime: number) => set({ sessionStartTime }),

  resetSession: () =>
    set({
      roundIndex: 0,
      sessionLength: 10,
      score: 0,
      itemsAttempted: 0,
      itemsCorrect: 0,
      roundResults: Array(10).fill('pending'),
      sessionAttempts: [],
      sessionStartTime: null,
      currentItem: null,
      recordingState: 'idle',
      lastRecognizedText: null,
      lastMatchResult: null,
      attemptCount: 0,
      roundLocked: false,
    }),
}));

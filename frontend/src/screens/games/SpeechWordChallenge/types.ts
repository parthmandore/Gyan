/**
 * Purpose: Type definitions for the Speech Word Challenge game module.
 *          Supports both Letter Speech Mode (Age 5) and Word Speech Mode (Age 6),
 *          along with detailed speech reporting.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge
 */

export interface SpeechChallengeItem {
  id: string;
  image: string;              // Educational image / emoji (e.g. '🍎', '⚽', '🐱')
  expectedWord: string;       // Normalized expected answer (e.g. "a", "apple", "क", "कमल")
  displayWord: string;        // Display word (hidden on screen during age 6 gameplay)
  displayLetter?: string;     // Big hero letter shown for age 5 (e.g. "A", "क", "अ")
  spokenPrompt: string;       // Spoken guidance prompt for child (e.g. "Say the letter A" / "What is this? Say the word.")
  phoneticHint: string;       // Spoken hint / guidance
  acceptedVariants: string[]; // Variations that count as correct
  category: 'fruits' | 'animals' | 'objects' | 'nature';
  mode?: 'letters' | 'words';
}

export type RecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'transcribing'
  | 'evaluating'
  | 'permission_denied';

export interface SpeechRoundAttempt {
  roundNumber: number;
  expectedAnswer: string;
  displayLabel: string;
  image: string;
  recognizedAnswer: string;
  isCorrect: boolean;
  language: string;
  age: number;
  timestamp: number;
  attemptCount: number;
  durationSeconds?: number;
}

export interface SpeechWordChallengeState {
  // Session progress
  roundIndex: number;
  sessionLength: number;
  score: number;
  itemsAttempted: number;
  itemsCorrect: number;
  roundResults: Array<'correct' | 'wrong' | 'pending'>;
  sessionAttempts: SpeechRoundAttempt[];
  sessionStartTime: number | null;

  // Round State
  currentItem: SpeechChallengeItem | null;
  recordingState: RecordingState;
  lastRecognizedText: string | null;
  lastMatchResult: 'correct' | 'wrong' | 'empty' | null;
  attemptCount: number; // 0, 1, 2
  roundLocked: boolean;

  // Actions
  setRoundItem: (item: SpeechChallengeItem) => void;
  setRecordingState: (state: RecordingState) => void;
  recordAnswer: (recognized: string, isCorrect: boolean) => void;
  recordDetailedAttempt: (attempt: SpeechRoundAttempt) => void;
  recordEmptyAttempt: () => void;
  nextRound: () => void;
  incrementScore: () => void;
  setSessionStartTime: (time: number) => void;
  resetSession: () => void;
}

export type SpeechWordChallengeStackParamList = {
  SpeechWordChallengeIntro: undefined;
  SpeechWordChallengeGame: undefined;
  SpeechWordChallengeSessionComplete: {
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    durationSeconds: number;
  } | undefined;
};

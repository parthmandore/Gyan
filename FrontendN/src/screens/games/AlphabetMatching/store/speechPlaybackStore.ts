/**
 * Purpose: Zustand store slice for tracking speech/audio playback state.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching/store
 *
 * This store tracks whether audio is currently loading or playing,
 * so the UI can show a subtle loading indicator (e.g. animated speaker icon)
 * on the audio cue card without revealing the target letter visually.
 */

import { create } from 'zustand';

export interface SpeechPlaybackState {
  /** Whether audio is currently being prepared or played */
  isPlaying: boolean;
  /** Whether audio loading/preparation is in progress */
  isLoading: boolean;
  /** Whether the initial auto-play for this round has completed */
  hasPlayedOnce: boolean;
  /** Tracks consecutive playback failures for retry logic */
  failureCount: number;

  setPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setHasPlayedOnce: (played: boolean) => void;
  incrementFailure: () => void;
  resetPlaybackState: () => void;
}

export const useSpeechPlaybackStore = create<SpeechPlaybackState>((set) => ({
  isPlaying: false,
  isLoading: false,
  hasPlayedOnce: false,
  failureCount: 0,

  setPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setHasPlayedOnce: (played: boolean) => set({ hasPlayedOnce: played }),
  incrementFailure: () => set((state) => ({ failureCount: state.failureCount + 1 })),
  resetPlaybackState: () =>
    set({
      isPlaying: false,
      isLoading: false,
      hasPlayedOnce: false,
      failureCount: 0,
    }),
}));

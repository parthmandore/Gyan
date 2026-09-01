/**
 * Purpose: In-memory development-only diagnostic store for evaluating Speech-to-Text performance.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/store
 */

import { create } from 'zustand';

export interface SpeechAttemptDiagnostic {
  id: string;
  timestamp: number;
  expectedWord: string;
  recognizedText: string;
  selectedLanguage: 'en' | 'hi' | 'mr';
  languageReturned: string;
  recordingDurationSec: number;
  apiLatencyMs: number;
  result: 'CORRECT' | 'INCORRECT' | 'EMPTY' | 'API_ERROR';
  errorMessage?: string;
}

export interface LanguageStat {
  language: 'en' | 'hi' | 'mr';
  attempts: number;
  correct: number;
  avgLatencyMs: number;
}

export interface MisrecognizedEntry {
  expected: string;
  heard: string;
  language: string;
  count: number;
}

export interface SpeechDiagnosticsState {
  attempts: SpeechAttemptDiagnostic[];
  maxEntries: number;

  // Actions
  recordAttemptDiagnostic: (entry: Omit<SpeechAttemptDiagnostic, 'id' | 'timestamp'>) => void;
  clearDiagnostics: () => void;

  // Computed metrics
  getTotalAttempts: () => number;
  getCorrectCount: () => number;
  getIncorrectCount: () => number;
  getEmptyCount: () => number;
  getApiErrorCount: () => number;
  getAverageLatencyMs: () => number;
  getLanguageBreakdown: () => LanguageStat[];
  getMisrecognizedAnswers: () => MisrecognizedEntry[];
}

export const useSpeechDiagnosticsStore = create<SpeechDiagnosticsState>((set, get) => ({
  attempts: [],
  maxEntries: 100,

  recordAttemptDiagnostic: (entry) =>
    set((state) => {
      const newEntry: SpeechAttemptDiagnostic = {
        ...entry,
        id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...state.attempts].slice(0, state.maxEntries);
      return { attempts: updated };
    }),

  clearDiagnostics: () => set({ attempts: [] }),

  getTotalAttempts: () => get().attempts.length,

  getCorrectCount: () => get().attempts.filter((a) => a.result === 'CORRECT').length,

  getIncorrectCount: () => get().attempts.filter((a) => a.result === 'INCORRECT').length,

  getEmptyCount: () => get().attempts.filter((a) => a.result === 'EMPTY').length,

  getApiErrorCount: () => get().attempts.filter((a) => a.result === 'API_ERROR').length,

  getAverageLatencyMs: () => {
    const validAttempts = get().attempts.filter((a) => a.apiLatencyMs > 0);
    if (validAttempts.length === 0) return 0;
    const sum = validAttempts.reduce((acc, a) => acc + a.apiLatencyMs, 0);
    return Math.round(sum / validAttempts.length);
  },

  getLanguageBreakdown: () => {
    const attempts = get().attempts;
    const languages: ('en' | 'hi' | 'mr')[] = ['en', 'hi', 'mr'];

    return languages.map((lang) => {
      const langAttempts = attempts.filter((a) => a.selectedLanguage === lang);
      const correct = langAttempts.filter((a) => a.result === 'CORRECT').length;
      const validLatency = langAttempts.filter((a) => a.apiLatencyMs > 0);
      const avgLatencyMs =
        validLatency.length > 0
          ? Math.round(validLatency.reduce((acc, a) => acc + a.apiLatencyMs, 0) / validLatency.length)
          : 0;

      return {
        language: lang,
        attempts: langAttempts.length,
        correct,
        avgLatencyMs,
      };
    });
  },

  getMisrecognizedAnswers: () => {
    const incorrect = get().attempts.filter(
      (a) => a.result === 'INCORRECT' && a.recognizedText && a.recognizedText.trim()
    );
    const map = new Map<string, MisrecognizedEntry>();

    incorrect.forEach((a) => {
      const key = `${a.selectedLanguage}_${a.expectedWord}_${a.recognizedText.toLowerCase()}`;
      if (map.has(key)) {
        map.get(key)!.count += 1;
      } else {
        map.set(key, {
          expected: a.expectedWord,
          heard: a.recognizedText,
          language: a.selectedLanguage,
          count: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10);
  },
}));

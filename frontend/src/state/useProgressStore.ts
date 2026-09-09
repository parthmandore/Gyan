/**
 * Purpose: Local-first Persistent User Progress & XP Store using Zustand & AsyncStorage.
 *          Provides child data isolation, deterministic level progression, session modeling,
 *          and event-level anti-duplication protection.
 * Module: State Management
 * Folder: frontend/src/state
 */

import { create } from 'zustand';
import { calculateLevelProgress, LevelProgressInfo, XPEventType } from '../config/xpConfig';

export interface GameSessionRecord {
  sessionId: string;
  userId?: string;
  gameId: string;
  category?: string;
  learningLanguage: string;
  motherTongue: string;
  age: number;
  timestamp: number;
  itemsAttempted: number;
  itemsCorrect: number;
  accuracy: number;
  starsEarned: number;
  xpEarned: number;
  durationSeconds: number;
}

export interface ProgressSummary extends LevelProgressInfo {
  totalStars: number;
  completedGamesCount: number;
}

export interface ProgressState extends ProgressSummary {
  activeChildId: string;
  history: GameSessionRecord[];
  processedEventIds: string[];
  isInitialized: boolean;

  initProgress: (childId?: string) => Promise<void>;
  setActiveChild: (childId: string) => Promise<void>;
  recordXPEvent: (event: {
    eventId: string;
    sessionId: string;
    eventType: XPEventType;
    xpAmount: number;
    metadata?: Record<string, any>;
  }) => Promise<{
    xpAdded: number;
    newTotalXp: number;
    leveledUp: boolean;
    newLevel: number;
    alreadyProcessed: boolean;
  }>;
  recordSessionCompletion: (
    session: Omit<GameSessionRecord, 'sessionId' | 'timestamp'> & {
      sessionId?: string;
      timestamp?: number;
      xpToAdd?: number;
    }
  ) => Promise<{
    xpAdded: number;
    newTotalXp: number;
    leveledUp: boolean;
    newLevel: number;
    alreadyRecorded: boolean;
  }>;
  resetProgress: (childId?: string) => Promise<void>;
}

const DEFAULT_CHILD_ID = 'default_child';
const ACTIVE_CHILD_KEY = '@gyan_active_child';

const getChildStorageKey = (childId: string) => `@gyan_progress_${childId || DEFAULT_CHILD_ID}`;

const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(key);
  } catch (err) {
    console.warn(`[useProgressStore] Error reading storage key ${key}:`, err);
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[useProgressStore] Error writing storage key ${key}:`, err);
  }
};

const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`[useProgressStore] Error removing storage key ${key}:`, err);
  }
};

// Re-export calculateLevelInfo for backward compatibility with existing tests
export const calculateLevelInfo = (totalXp: number) => {
  const info = calculateLevelProgress(totalXp);
  return {
    currentLevel: info.currentLevel,
    xpInCurrentLevel: info.xpInCurrentLevel,
    xpToNextLevel: info.xpToNextLevel,
  };
};

const initialLevelInfo = calculateLevelProgress(0);

export const useProgressStore = create<ProgressState>((set, get) => ({
  activeChildId: DEFAULT_CHILD_ID,
  totalStars: 0,
  completedGamesCount: 0,
  ...initialLevelInfo,
  history: [],
  processedEventIds: [],
  isInitialized: false,

  initProgress: async (requestedChildId?: string) => {
    try {
      let childId = requestedChildId;
      if (!childId) {
        const savedChild = await getStorageItem(ACTIVE_CHILD_KEY);
        childId = savedChild || DEFAULT_CHILD_ID;
      }

      const storageKey = getChildStorageKey(childId);
      let stored = await getStorageItem(storageKey);

      // Legacy fallback: check old storage key '@gyan_user_progress' if default child has no data
      if (!stored && childId === DEFAULT_CHILD_ID) {
        stored = await getStorageItem('@gyan_user_progress');
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        const totalXp = Number(parsed.totalXp) || 0;
        const totalStars = Number(parsed.totalStars) || 0;
        const history: GameSessionRecord[] = Array.isArray(parsed.history) ? parsed.history : [];
        const processedEventIds: string[] = Array.isArray(parsed.processedEventIds) ? parsed.processedEventIds : [];
        const completedGamesCount = Number(parsed.completedGamesCount) || history.length;
        const levelInfo = calculateLevelProgress(totalXp);

        set({
          activeChildId: childId,
          totalStars,
          completedGamesCount,
          history,
          processedEventIds,
          ...levelInfo,
          isInitialized: true,
        });
        return;
      }

      // New profile with 0 XP
      const zeroLevelInfo = calculateLevelProgress(0);
      set({
        activeChildId: childId,
        totalStars: 0,
        completedGamesCount: 0,
        history: [],
        processedEventIds: [],
        ...zeroLevelInfo,
        isInitialized: true,
      });
    } catch (err) {
      console.warn('[useProgressStore] Error initializing progress:', err);
      set({ isInitialized: true });
    }
  },

  setActiveChild: async (newChildId: string) => {
    if (!newChildId || newChildId === get().activeChildId) return;
    await setStorageItem(ACTIVE_CHILD_KEY, newChildId);
    await get().initProgress(newChildId);
  },

  recordXPEvent: async (event) => {
    const state = get();
    const { eventId, sessionId, eventType, xpAmount, metadata } = event;
    const safeAmount = Math.max(0, Math.floor(xpAmount || 0));

    // 1. Anti-duplication check: if eventId already processed, award 0 XP
    if (state.processedEventIds.includes(eventId)) {
      return {
        xpAdded: 0,
        newTotalXp: state.totalXp,
        leveledUp: false,
        newLevel: state.currentLevel,
        alreadyProcessed: true,
      };
    }

    // 2. Add eventId to processed list (capped at 500 items)
    const newProcessedEvents = [eventId, ...state.processedEventIds].slice(0, 500);
    const newTotalXp = state.totalXp + safeAmount;
    const oldLevel = state.currentLevel;
    const newLevelInfo = calculateLevelProgress(newTotalXp);
    const leveledUp = newLevelInfo.currentLevel > oldLevel;

    // 3. Update store state
    set({
      processedEventIds: newProcessedEvents,
      ...newLevelInfo,
    });

    // 4. Save to AsyncStorage
    const storageKey = getChildStorageKey(state.activeChildId);
    await setStorageItem(
      storageKey,
      JSON.stringify({
        totalXp: newTotalXp,
        totalStars: state.totalStars,
        completedGamesCount: state.completedGamesCount,
        history: state.history,
        processedEventIds: newProcessedEvents,
      })
    );

    // 5. Asynchronously sync event with Backend API (non-blocking, graceful fallback)
    try {
      const { apiClient } = require('../services/apiClient');
      apiClient.post('/api/progress/event', {
        event_id: eventId,
        user_id: state.activeChildId,
        session_id: sessionId,
        event_type: eventType,
        xp_amount: safeAmount,
        metadata,
      }).catch(() => {});
    } catch {}

    return {
      xpAdded: safeAmount,
      newTotalXp,
      leveledUp,
      newLevel: newLevelInfo.currentLevel,
      alreadyProcessed: false,
    };
  },

  recordSessionCompletion: async (sessionInput) => {
    const state = get();
    const sessionId =
      sessionInput.sessionId ||
      `${sessionInput.gameId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Anti-duplication check for session:
    const completionEventId = `${sessionId}_completion`;
    const existing = state.history.find((h) => h.sessionId === sessionId);
    if (existing || state.processedEventIds.includes(completionEventId)) {
      return {
        xpAdded: 0,
        newTotalXp: state.totalXp,
        leveledUp: false,
        newLevel: state.currentLevel,
        alreadyRecorded: true,
      };
    }

    const newRecord: GameSessionRecord = {
      ...sessionInput,
      sessionId,
      userId: state.activeChildId,
      timestamp: sessionInput.timestamp || Date.now(),
    };

    const xpToAdd = sessionInput.xpToAdd !== undefined
      ? Math.max(0, Math.floor(sessionInput.xpToAdd))
      : Math.max(0, Math.floor(sessionInput.xpEarned || 0));
    const starsToAdd = Math.max(0, Math.floor(sessionInput.starsEarned || 0));
    const newTotalXp = state.totalXp + xpToAdd;
    const newTotalStars = state.totalStars + starsToAdd;
    const newCompletedCount = state.completedGamesCount + 1;
    const newHistory = [newRecord, ...state.history].slice(0, 100);

    const oldLevel = state.currentLevel;
    const levelInfo = calculateLevelProgress(newTotalXp);
    const leveledUp = levelInfo.currentLevel > oldLevel;

    // Mark completion event as processed
    const newProcessedEvents = state.processedEventIds.includes(completionEventId)
      ? state.processedEventIds
      : [completionEventId, ...state.processedEventIds].slice(0, 500);

    set({
      totalStars: newTotalStars,
      ...levelInfo,
      completedGamesCount: newCompletedCount,
      history: newHistory,
      processedEventIds: newProcessedEvents,
    });

    // Save to persistence
    const storageKey = getChildStorageKey(state.activeChildId);
    await setStorageItem(
      storageKey,
      JSON.stringify({
        totalXp: newTotalXp,
        totalStars: newTotalStars,
        completedGamesCount: newCompletedCount,
        history: newHistory,
        processedEventIds: newProcessedEvents,
      })
    );

    // Asynchronously sync session to Backend API
    try {
      const { apiClient } = require('../services/apiClient');
      apiClient.post('/api/progress/session', {
        session_id: sessionId,
        user_id: state.activeChildId,
        game_id: newRecord.gameId,
        category: newRecord.category || null,
        age_level: newRecord.age,
        mother_tongue: newRecord.motherTongue,
        learning_language: newRecord.learningLanguage,
        started_at: newRecord.timestamp - (newRecord.durationSeconds * 1000),
        completed_at: newRecord.timestamp,
        total_questions: newRecord.itemsAttempted,
        correct_answers: newRecord.itemsCorrect,
        attempts: newRecord.itemsAttempted,
        accuracy: newRecord.accuracy,
        xp_earned: xpToAdd,
      }).catch(() => {});
    } catch {}

    return {
      xpAdded: xpToAdd,
      newTotalXp,
      leveledUp,
      newLevel: levelInfo.currentLevel,
      alreadyRecorded: false,
    };
  },

  resetProgress: async (childIdToReset?: string) => {
    const childId = childIdToReset || get().activeChildId;
    const storageKey = getChildStorageKey(childId);
    await removeStorageItem(storageKey);

    if (childId === DEFAULT_CHILD_ID) {
      await removeStorageItem('@gyan_user_progress');
    }

    const zeroLevelInfo = calculateLevelProgress(0);
    set({
      totalStars: 0,
      completedGamesCount: 0,
      history: [],
      processedEventIds: [],
      ...zeroLevelInfo,
    });

    // Reset on backend as well
    try {
      const { apiClient } = require('../services/apiClient');
      apiClient.post(`/api/progress/reset/${childId}`).catch(() => {});
    } catch {}
  },
}));

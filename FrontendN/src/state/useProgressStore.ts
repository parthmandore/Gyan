/**
 * Purpose: Local-first Persistent User Progress & XP Store using Zustand & AsyncStorage.
 *          Provides child data isolation, deterministic level progression,
 *          session modeling, anti-duplication protection, and backend progress sync.
 * Module: State Management
 * Folder: frontend/src/state
 */

import { create } from 'zustand';
import {
  calculateLevelProgress,
  LevelProgressInfo,
  XPEventType,
} from '../config/xpConfig';
import { apiClient } from '../services/apiClient';

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

  difficulty?: number;
  mode?: string;
}

export interface XPEvent {
  id: string;
  type: XPEventType;
  xp: number;
  timestamp: number;
  gameId?: string;
}

export interface ProgressSummary extends LevelProgressInfo {
  totalStars: number;
  completedGamesCount: number;
}

export interface XPEventResult {
  xpAdded: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  alreadyProcessed: boolean;
}

export interface SessionCompletionResult {
  xpAdded: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  alreadyRecorded: boolean;
}

export interface ProgressState extends ProgressSummary {
  activeChildId: string;

  history: GameSessionRecord[];

  xpEvents: XPEvent[];

  processedEventIds: string[];

  submittedSessionIds: string[];

  isInitialized: boolean;

  initProgress: (childId?: string) => Promise<void>;

  hydrate: (childId?: string) => Promise<void>;

  setActiveChild: (childId: string) => Promise<void>;

  recordXPEvent: (
    event: {
      eventId: string;
      sessionId: string;
      eventType: XPEventType;
      xpAmount: number;
      metadata?: Record<string, any>;
    },
  ) => Promise<XPEventResult>;

  recordSessionCompletion: (
    session: Omit<GameSessionRecord, 'sessionId' | 'timestamp'> & {
      sessionId?: string;
      timestamp?: number;
      xpToAdd?: number;
    },
  ) => Promise<SessionCompletionResult>;

  getProgressSummary: () => ProgressSummary;

  resetProgress: (childId?: string) => Promise<void>;

  clearLocalProgress: (childId?: string) => Promise<void>;
}

const DEFAULT_CHILD_ID = 'default_child';

const ACTIVE_CHILD_KEY = '@gyan_active_child';

const LEGACY_PROGRESS_KEY = '@gyan_user_progress';

const getChildStorageKey = (childId: string) =>
  `@gyan_progress_${childId || DEFAULT_CHILD_ID}`;

/* -------------------------------------------------------------------------- */
/* Storage helpers                                                            */
/* -------------------------------------------------------------------------- */

const getStorageItem = async (
  key: string,
): Promise<string | null> => {
  try {
    if (
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      return window.localStorage.getItem(key);
    }

    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;

    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn(
      `[useProgressStore] Error reading storage key ${key}:`,
      error,
    );

    return null;
  }
};

const setStorageItem = async (
  key: string,
  value: string,
): Promise<void> => {
  try {
    if (
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      window.localStorage.setItem(key, value);
      return;
    }

    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;

    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(
      `[useProgressStore] Error writing storage key ${key}:`,
      error,
    );
  }
};

const removeStorageItem = async (
  key: string,
): Promise<void> => {
  try {
    if (
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      window.localStorage.removeItem(key);
      return;
    }

    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;

    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(
      `[useProgressStore] Error removing storage key ${key}:`,
      error,
    );
  }
};

/* -------------------------------------------------------------------------- */
/* Backward compatibility                                                     */
/* -------------------------------------------------------------------------- */

export const calculateLevelInfo = (totalXp: number) => {
  const info = calculateLevelProgress(totalXp);

  return {
    currentLevel: info.currentLevel,
    xpInCurrentLevel: info.xpInCurrentLevel,
    xpToNextLevel: info.xpToNextLevel,
  };
};

const initialLevelInfo = calculateLevelProgress(0);

/* -------------------------------------------------------------------------- */
/* Persistence                                                                */
/* -------------------------------------------------------------------------- */

const persistState = async (
  childId: string,
  state: {
    totalXp: number;
    totalStars: number;
    completedGamesCount: number;
    history: GameSessionRecord[];
    xpEvents: XPEvent[];
    processedEventIds: string[];
    submittedSessionIds: string[];
  },
) => {
  const storageKey = getChildStorageKey(childId);

  await setStorageItem(
    storageKey,
    JSON.stringify({
      totalXp: state.totalXp,
      totalStars: state.totalStars,
      completedGamesCount: state.completedGamesCount,
      history: state.history,
      xpEvents: state.xpEvents,
      processedEventIds: state.processedEventIds,
      submittedSessionIds: state.submittedSessionIds,
    }),
  );
};

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

export const useProgressStore =
  create<ProgressState>((set, get) => ({
    activeChildId: DEFAULT_CHILD_ID,

    totalStars: 0,

    completedGamesCount: 0,

    ...initialLevelInfo,

    history: [],

    xpEvents: [],

    processedEventIds: [],

    submittedSessionIds: [],

    isInitialized: false,

    /* ---------------------------------------------------------------------- */
    /* Initialize / hydrate                                                   */
    /* ---------------------------------------------------------------------- */

    initProgress: async (
      requestedChildId?: string,
    ) => {
      try {
        let childId = requestedChildId;

        if (!childId) {
          const savedChild =
            await getStorageItem(ACTIVE_CHILD_KEY);

          childId =
            savedChild || DEFAULT_CHILD_ID;
        }

        const storageKey =
          getChildStorageKey(childId);

        let stored =
          await getStorageItem(storageKey);

        /*
         * Backward compatibility with the old
         * single-user storage key.
         */
        if (
          !stored &&
          childId === DEFAULT_CHILD_ID
        ) {
          stored =
            await getStorageItem(
              LEGACY_PROGRESS_KEY,
            );
        }

        if (stored) {
          try {
            const parsed = JSON.parse(stored);

            const totalXp =
              Number(parsed.totalXp) || 0;

            const totalStars =
              Number(parsed.totalStars) || 0;

            const history: GameSessionRecord[] =
              Array.isArray(parsed.history)
                ? parsed.history
                : [];

            const xpEvents: XPEvent[] =
              Array.isArray(parsed.xpEvents)
                ? parsed.xpEvents
                : [];

            const processedEventIds: string[] =
              Array.isArray(
                parsed.processedEventIds,
              )
                ? parsed.processedEventIds
                : [];

            const submittedSessionIds: string[] =
              Array.isArray(
                parsed.submittedSessionIds,
              )
                ? parsed.submittedSessionIds
                : [];

            const completedGamesCount =
              Number(
                parsed.completedGamesCount,
              ) || history.length;

            /*
             * IMPORTANT:
             * Level information always comes from
             * the centralized XP configuration.
             */
            const levelInfo =
              calculateLevelProgress(totalXp);

            set({
              activeChildId: childId,
              totalStars,
              completedGamesCount,
              history,
              xpEvents,
              processedEventIds,
              submittedSessionIds,
              ...levelInfo,
              isInitialized: true,
            });

            return;
          } catch (parseError) {
            console.warn(
              '[useProgressStore] Invalid stored progress. Starting fresh.',
              parseError,
            );
          }
        }

        /*
         * New profile with zero XP.
         */
        const zeroLevelInfo =
          calculateLevelProgress(0);

        set({
          activeChildId: childId,
          totalStars: 0,
          completedGamesCount: 0,
          history: [],
          xpEvents: [],
          processedEventIds: [],
          submittedSessionIds: [],
          ...zeroLevelInfo,
          isInitialized: true,
        });
      } catch (error) {
        console.warn(
          '[useProgressStore] Error initializing progress:',
          error,
        );

        set({
          isInitialized: true,
        });
      }
    },

    /*
     * Alias used by services/components that call hydrate().
     */
    hydrate: async (
      childId?: string,
    ) => {
      await get().initProgress(childId);
    },

    /* ---------------------------------------------------------------------- */
    /* Active child                                                            */
    /* ---------------------------------------------------------------------- */

    setActiveChild: async (
      newChildId: string,
    ) => {
      if (!newChildId) {
        return;
      }

      if (
        newChildId ===
        get().activeChildId
      ) {
        return;
      }

      await setStorageItem(
        ACTIVE_CHILD_KEY,
        newChildId,
      );

      await get().initProgress(
        newChildId,
      );
    },

    /* ---------------------------------------------------------------------- */
    /* Answer-level XP                                                         */
    /* ---------------------------------------------------------------------- */

    recordXPEvent: async (
      event,
    ): Promise<XPEventResult> => {
      const state = get();

      const {
        eventId,
        sessionId,
        eventType,
        xpAmount,
        metadata,
      } = event;

      const safeAmount = Math.max(
        0,
        Math.floor(xpAmount || 0),
      );

      /*
       * Deterministic anti-duplication.
       */
      if (
        state.processedEventIds.includes(
          eventId,
        )
      ) {
        return {
          xpAdded: 0,
          newTotalXp: state.totalXp,
          newLevel: state.currentLevel,
          leveledUp: false,
          alreadyProcessed: true,
        };
      }

      const newTotalXp =
        state.totalXp + safeAmount;

      const oldLevel =
        state.currentLevel;

      /*
       * ALWAYS use the centralized XP
       * progression configuration.
       */
      const newLevelInfo =
        calculateLevelProgress(
          newTotalXp,
        );

      const leveledUp =
        newLevelInfo.currentLevel >
        oldLevel;

      const newProcessedEventIds = [
        eventId,
        ...state.processedEventIds,
      ].slice(0, 500);

      const newXPEvent: XPEvent = {
        id: eventId,
        type: eventType,
        xp: safeAmount,
        timestamp: Date.now(),
      };

      if (
        metadata &&
        typeof metadata.gameId === 'string'
      ) {
        newXPEvent.gameId =
          metadata.gameId;
      }

      const newXPEvents = [
        newXPEvent,
        ...state.xpEvents,
      ].slice(0, 500);

      set({
        ...newLevelInfo,
        processedEventIds:
          newProcessedEventIds,
        xpEvents: newXPEvents,
      });

      await persistState(
        state.activeChildId,
        {
          totalXp: newTotalXp,
          totalStars:
            state.totalStars,
          completedGamesCount:
            state.completedGamesCount,
          history: state.history,
          xpEvents: newXPEvents,
          processedEventIds:
            newProcessedEventIds,
          submittedSessionIds:
            state.submittedSessionIds,
        },
      );

      /*
       * There is currently no verified
       * /api/progress/event backend endpoint.
       *
       * Answer-level XP therefore remains
       * local and deterministic.
       *
       * The completed game itself is sent to
       * the verified /api/progress/submit
       * endpoint by recordSessionCompletion().
       */
      void sessionId;

      return {
        xpAdded: safeAmount,
        newTotalXp,
        newLevel:
          newLevelInfo.currentLevel,
        leveledUp,
        alreadyProcessed: false,
      };
    },

    /* ---------------------------------------------------------------------- */
    /* Session completion                                                      */
    /* ---------------------------------------------------------------------- */

    recordSessionCompletion: async (
      sessionInput,
    ): Promise<SessionCompletionResult> => {
      const state = get();

      const sessionId =
        sessionInput.sessionId ||
        `${sessionInput.gameId}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}`;

      /*
       * Session-level anti-duplication.
       */
      const alreadyExists =
        state.history.some(
          (item) =>
            item.sessionId ===
            sessionId,
        );

      const alreadySubmitted =
        state.submittedSessionIds.includes(
          sessionId,
        );

      if (
        alreadyExists ||
        alreadySubmitted
      ) {
        return {
          xpAdded: 0,
          newTotalXp: state.totalXp,
          newLevel: state.currentLevel,
          leveledUp: false,
          alreadyRecorded: true,
        };
      }

      const safeItemsAttempted =
        Math.max(
          0,
          Math.floor(
            sessionInput.itemsAttempted ||
              0,
          ),
        );

      const safeItemsCorrect =
        Math.min(
          safeItemsAttempted,
          Math.max(
            0,
            Math.floor(
              sessionInput.itemsCorrect ||
                0,
            ),
          ),
        );

      const safeAccuracy =
        safeItemsAttempted > 0
          ? Math.min(
              100,
              Math.max(
                0,
                (safeItemsCorrect /
                  safeItemsAttempted) *
                  100,
              ),
            )
          : 0;

      const safeDuration =
        Math.max(
          0,
          Math.floor(
            sessionInput.durationSeconds ||
              0,
          ),
        );

      const safeStars =
        Math.max(
          0,
          Math.floor(
            sessionInput.starsEarned ||
              0,
          ),
        );

      const safeLocalXp =
        Math.max(
          0,
          Math.floor(
            sessionInput.xpToAdd !==
              undefined
              ? sessionInput.xpToAdd
              : sessionInput.xpEarned ||
                  0,
          ),
        );

      const timestamp =
        sessionInput.timestamp ||
        Date.now();

      const newRecord: GameSessionRecord =
        {
          ...sessionInput,
          sessionId,
          userId:
            state.activeChildId,
          timestamp,
          itemsAttempted:
            safeItemsAttempted,
          itemsCorrect:
            safeItemsCorrect,
          accuracy:
            safeAccuracy,
          starsEarned:
            safeStars,
          xpEarned:
            safeLocalXp,
          durationSeconds:
            safeDuration,
        };

      /*
       * Local XP remains deterministic and is
       * calculated by xpService using XP_RULES.
       */
      const newTotalXp =
  state.totalXp + safeLocalXp;

      const oldLevel =
        state.currentLevel;

      const newLevelInfo =
        calculateLevelProgress(
          newTotalXp,
        );

      const leveledUp =
        newLevelInfo.currentLevel >
        oldLevel;

      const newTotalStars =
        state.totalStars +
        safeStars;

      const newCompletedCount =
        state.completedGamesCount +
        1;

      const newHistory = [
        newRecord,
        ...state.history,
      ].slice(0, 100);

      const newSubmittedSessionIds = [
        sessionId,
        ...state.submittedSessionIds,
      ].slice(0, 500);

      /*
       * Update local state immediately.
       */
      set({
        ...newLevelInfo,
        totalStars:
          newTotalStars,
        completedGamesCount:
          newCompletedCount,
        history:
          newHistory,
        submittedSessionIds:
          newSubmittedSessionIds,
      });

      await persistState(
        state.activeChildId,
        {
          totalXp: newTotalXp,
          totalStars:
            newTotalStars,
          completedGamesCount:
            newCompletedCount,
          history:
            newHistory,
          xpEvents:
            state.xpEvents,
          processedEventIds:
            state.processedEventIds,
          submittedSessionIds:
            newSubmittedSessionIds,
        },
      );

      /*
       * VERIFIED BACKEND CONTRACT:
       *
       * POST /api/progress/submit
       *
       * Required:
       *   game_type
       *   difficulty
       *   items_attempted
       *   items_correct
       *   time_taken_seconds
       *
       * Optional:
       *   language
       *   mode
       */
      try {
        await apiClient.post(
          '/api/progress/submit',
          {
            game_type:
              newRecord.gameId,

            difficulty:
              Math.min(
                5,
                Math.max(
                  1,
                  Math.floor(
                    newRecord.difficulty ||
                      1,
                  ),
                ),
              ),

            items_attempted:
              safeItemsAttempted,

            items_correct:
              safeItemsCorrect,

            time_taken_seconds:
              safeDuration,

            language:
              newRecord.learningLanguage ===
                'hi' ||
              newRecord.learningLanguage ===
                'mr'
                ? newRecord.learningLanguage
                : 'en',

            mode:
              newRecord.mode ||
              'game',
          },
        );
      } catch (error) {
        /*
         * Local progress remains available even
         * if the backend is temporarily unavailable.
         *
         * The session has still been recorded locally.
         */
        console.warn(
          '[useProgressStore] Backend progress sync failed. Local progress retained.',
          error,
        );
      }

      return {
        xpAdded: safeLocalXp,
        newTotalXp,
        newLevel:
          newLevelInfo.currentLevel,
        leveledUp,
        alreadyRecorded: false,
      };
    },

    /* ---------------------------------------------------------------------- */
    /* Progress summary                                                        */
    /* ---------------------------------------------------------------------- */

    getProgressSummary: () => {
      const state = get();

      return {
        currentLevel:
          state.currentLevel,

        totalXp:
          state.totalXp,

        xpInCurrentLevel:
          state.xpInCurrentLevel,

        xpToNextLevel:
          state.xpToNextLevel,

        currentLevelCost:
          state.currentLevelCost,

        progressRatio:
          state.progressRatio,

        progressPercent:
          state.progressPercent,

        totalStars:
          state.totalStars,

        completedGamesCount:
          state.completedGamesCount,
      };
    },

    /* ---------------------------------------------------------------------- */
    /* Reset progress                                                          */
    /* ---------------------------------------------------------------------- */

    resetProgress: async (
      childIdToReset?: string,
    ) => {
      const childId =
        childIdToReset ||
        get().activeChildId;

      await get().clearLocalProgress(
        childId,
      );
    },

    /* ---------------------------------------------------------------------- */
    /* Clear local progress                                                    */
    /* ---------------------------------------------------------------------- */

    clearLocalProgress: async (
      childIdToClear?: string,
    ) => {
      const childId =
        childIdToClear ||
        get().activeChildId;

      const storageKey =
        getChildStorageKey(childId);

      await removeStorageItem(
        storageKey,
      );

      if (
        childId ===
        DEFAULT_CHILD_ID
      ) {
        await removeStorageItem(
          LEGACY_PROGRESS_KEY,
        );
      }

      /*
       * Only reset the visible Zustand state
       * when clearing the currently active child.
       */
      if (
        childId ===
        get().activeChildId
      ) {
        const zeroLevelInfo =
          calculateLevelProgress(0);

        set({
          totalStars: 0,
          completedGamesCount: 0,
          history: [],
          xpEvents: [],
          processedEventIds: [],
          submittedSessionIds: [],
          ...zeroLevelInfo,
        });
      }
    },
  }));

export default useProgressStore;
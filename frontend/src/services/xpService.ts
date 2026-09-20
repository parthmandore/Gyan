/**
 * Purpose: Centralized XP Service for all educational games in Gyan.
 *          Governs learning event emissions, anti-duplication, rule evaluations,
 *          and session progress recording. Games interact exclusively through this service.
 * Module: Services
 * Folder: frontend/src/services
 */

import { XP_RULES, XPEventType } from '../config/xpConfig';
import { useProgressStore, GameSessionRecord, ProgressSummary } from '../state/useProgressStore';

export interface AnswerXPParams {
  sessionId: string;
  roundIndex: number;
  attemptNum: number;
  isCorrect: boolean;
  gameId: string;
  metadata?: Record<string, any>;
}

export interface AnswerXPResult {
  xpEarned: number;
  baseXp: number;
  bonusXp: number;
  isFirstTry: boolean;
  alreadyProcessed: boolean;
  newTotalXp: number;
  currentLevel: number;
}

export interface SessionXPParams {
  sessionId: string;
  gameId: string;
  category?: string;
  age: number;
  motherTongue: string;
  learningLanguage: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  durationSeconds: number;
  roundXpEarned?: number;
  metadata?: Record<string, any>;
}

export interface SessionXPResult {
  completionXp: number;
  perfectBonusXp: number;
  totalSessionXp: number;
  starsEarned: number;
  isPerfect: boolean;
  alreadyRecorded: boolean;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
}

export const xpService = {
  /**
   * Evaluates and records XP for an answer attempt in an educational game round.
   * - Strict Anti-Duplication: Every round has a deterministic `xpEventId`.
   * - Non-Learning Actions / Incorrect Answers: award strictly 0 XP.
   * - Correct on First Attempt: +10 XP base + 5 XP first-try bonus (+15 XP).
   * - Correct on Retry: +10 XP base.
   */
  recordAnswerXP: async (params: AnswerXPParams): Promise<AnswerXPResult> => {
    const { sessionId, roundIndex, attemptNum, isCorrect, gameId, metadata } = params;

    // 1. Incorrect attempt awards strictly 0 XP
    if (!isCorrect) {
      const state = useProgressStore.getState();
      return {
        xpEarned: 0,
        baseXp: 0,
        bonusXp: 0,
        isFirstTry: attemptNum === 1,
        alreadyProcessed: false,
        newTotalXp: state.totalXp,
        currentLevel: state.currentLevel,
      };
    }

    // 2. Deterministic event ID for this round's success
    const eventId = `${sessionId}_rnd_${roundIndex}_success`;
    const isFirstTry = attemptNum === 1;
    const baseXp = XP_RULES.CORRECT_ANSWER; // 10
    const bonusXp = isFirstTry ? XP_RULES.FIRST_TRY_BONUS : 0; // 5 if first try, 0 if retry
    const totalXpToAdd = baseXp + bonusXp;

    // 3. Dispatch to store (enforcing anti-duplication)
    const result = await useProgressStore.getState().recordXPEvent({
      eventId,
      sessionId,
      eventType: isFirstTry ? 'FIRST_TRY_BONUS' : 'CORRECT_ANSWER',
      xpAmount: totalXpToAdd,
      metadata: {
        gameId,
        roundIndex,
        attemptNum,
        isFirstTry,
        ...metadata,
      },
    });

    return {
      xpEarned: result.xpAdded,
      baseXp: result.xpAdded > 0 ? baseXp : 0,
      bonusXp: result.xpAdded > 0 ? bonusXp : 0,
      isFirstTry,
      alreadyProcessed: result.alreadyProcessed,
      newTotalXp: result.newTotalXp,
      currentLevel: result.newLevel,
    };
  },

  /**
   * Evaluates and records completion of a full educational session.
   * - Completion Base: +20 XP
   * - Perfect Session Bonus: +25 XP (if accuracy === 100%)
   * - Generates full persistent GameSessionRecord
   */
  recordSessionCompletionXP: async (params: SessionXPParams): Promise<SessionXPResult> => {
    const {
      sessionId,
      gameId,
      category,
      age,
      motherTongue,
      learningLanguage,
      totalQuestions,
      correctAnswers,
      accuracy,
      durationSeconds,
      roundXpEarned,
    } = params;

    const safeAccuracy = Math.min(100, Math.max(0, Math.round(accuracy || 0)));
    const isPerfect = safeAccuracy === 100 || (totalQuestions > 0 && correctAnswers === totalQuestions);

    const completionXp = XP_RULES.GAME_COMPLETION; // 20
    const perfectBonusXp = isPerfect ? XP_RULES.PERFECT_SESSION_BONUS : 0; // 25
    const sessionBonusXp = completionXp + perfectBonusXp; // 20 or 45

    let totalSessionXp: number;
    let xpToAdd: number;

    if (roundXpEarned !== undefined) {
      // Rounds were already awarded live via recordAnswerXP
      totalSessionXp = roundXpEarned + sessionBonusXp;
      xpToAdd = sessionBonusXp;
    } else {
      // Rounds were not awarded live; calculate deterministically from rules
      const roundBaseXp = correctAnswers * XP_RULES.CORRECT_ANSWER;
      const firstTryCount = isPerfect ? correctAnswers : Math.round(correctAnswers * (safeAccuracy / 100));
      const firstTryBonusXp = firstTryCount * XP_RULES.FIRST_TRY_BONUS;
      const totalRoundXp = roundBaseXp + firstTryBonusXp;

      totalSessionXp = totalRoundXp + sessionBonusXp;
      xpToAdd = totalSessionXp;
    }

    // Calculate stars: 3 stars for >= 90%, 2 stars for >= 70%, 1 star otherwise
    const starsEarned = safeAccuracy >= 90 ? 3 : safeAccuracy >= 70 ? 2 : 1;

    const sessionRecord = {
      sessionId,
      gameId,
      category,
      age,
      motherTongue,
      learningLanguage,
      itemsAttempted: totalQuestions,
      itemsCorrect: correctAnswers,
      accuracy: safeAccuracy,
      starsEarned,
      xpEarned: totalSessionXp,
      xpToAdd,
      durationSeconds: Math.max(1, Math.round(durationSeconds || 0)),
    };

    const storeResult = await useProgressStore.getState().recordSessionCompletion(sessionRecord);

    return {
      completionXp,
      perfectBonusXp,
      totalSessionXp,
      starsEarned,
      isPerfect,
      alreadyRecorded: storeResult.alreadyRecorded,
      newTotalXp: storeResult.newTotalXp,
      newLevel: storeResult.newLevel,
      leveledUp: storeResult.leveledUp,
    };
  },

  /**
   * Retrieves current progress summary for the active child.
   */
  getProgressSummary: (): ProgressSummary => {
    const state = useProgressStore.getState();
    return {
      totalXp: state.totalXp,
      totalStars: state.totalStars,
      currentLevel: state.currentLevel,
      xpInCurrentLevel: state.xpInCurrentLevel,
      xpToNextLevel: state.xpToNextLevel,
      currentLevelCost: state.currentLevelCost,
      progressRatio: state.progressRatio,
      progressPercent: state.progressPercent,
      completedGamesCount: state.completedGamesCount,
    };
  },

  /**
   * Switches the active child profile (ensuring strict data isolation).
   */
  setActiveChild: async (childId: string): Promise<void> => {
    await useProgressStore.getState().setActiveChild(childId);
  },
};

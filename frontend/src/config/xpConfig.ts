/**
 * Purpose: Centralized XP Rules and Deterministic Level Progression Configuration.
 * Module: Config
 * Folder: frontend/src/config
 */

export const XP_RULES = {
  // Base XP awarded for answering correctly
  CORRECT_ANSWER: 10,

  // Bonus XP awarded if answered correctly on the very first attempt (attemptNum === 1)
  FIRST_TRY_BONUS: 5,

  // XP awarded upon completing all rounds of an educational session
  GAME_COMPLETION: 20,

  // Bonus XP awarded if the session had 100% accuracy (itemsCorrect === totalQuestions)
  PERFECT_SESSION_BONUS: 25,

  // Incorrect answers or invalid actions award strictly 0 XP
  INCORRECT_ANSWER: 0,
} as const;

export type XPEventType =
  | 'CORRECT_ANSWER'
  | 'FIRST_TRY_BONUS'
  | 'GAME_COMPLETION'
  | 'PERFECT_SESSION_BONUS';

export interface LevelProgressInfo {
  currentLevel: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  currentLevelCost: number;
  progressRatio: number; // 0.0 to 1.0
  progressPercent: number; // 0 to 100
}

/**
 * Calculates deterministic level progress from lifetime total XP.
 * Level 1: 0 - 100 XP (threshold: 100)
 * Level 2: 100 - 250 XP (threshold: 150)
 * Level 3: 250 - 450 XP (threshold: 200)
 * Level N: Previous + 100 + (N - 1) * 50 XP
 */
export const calculateLevelProgress = (totalXp: number): LevelProgressInfo => {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));

  let level = 1;
  let accumulatedThreshold = 0;
  let currentLevelCost = 100;

  while (safeXp >= accumulatedThreshold + currentLevelCost) {
    accumulatedThreshold += currentLevelCost;
    level += 1;
    currentLevelCost = 100 + (level - 1) * 50;
  }

  const xpInCurrentLevel = safeXp - accumulatedThreshold;
  const xpToNextLevel = currentLevelCost - xpInCurrentLevel;
  const progressRatio = Math.min(1, Math.max(0, xpInCurrentLevel / currentLevelCost));
  const progressPercent = Math.round(progressRatio * 100);

  return {
    currentLevel: level,
    totalXp: safeXp,
    xpInCurrentLevel,
    xpToNextLevel,
    currentLevelCost,
    progressRatio,
    progressPercent,
  };
};

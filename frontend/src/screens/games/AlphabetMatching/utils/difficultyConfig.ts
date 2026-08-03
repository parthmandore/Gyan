/**
 * Purpose: Difficulty-driven grid configuration logic for Alphabet Matching.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching/utils
 *
 * Drives option grid size and confusable letter pair inclusion based on difficulty tier (1-5).
 */

/** Sensible default difficulty tier when Backend difficulty is not specified */
export const DEFAULT_DIFFICULTY_TIER = 1;

/**
 * Calculates the number of letter options shown per round for a given difficulty tier.
 *
 * Rules (per contract available_difficulties 1-5):
 * - Tier 1: 4 options (2x2 grid)
 * - Tier 2: 4 options (2x2 grid)
 * - Tier 3: 6 options (2x3 grid)
 * - Tier 4: 6 options (2x3 grid)
 * - Tier 5: 8 options (2x4 grid)
 *
 * @param difficulty - Difficulty tier (1-5). Clamped safely between 1 and 5.
 * @returns Number of options (4, 6, or 8).
 */
export const getGridSizeForDifficulty = (difficulty: number): number => {
  const clamped = Math.max(1, Math.min(5, Math.floor(difficulty)));
  switch (clamped) {
    case 1:
    case 2:
      return 4;
    case 3:
    case 4:
      return 6;
    case 5:
      return 8;
    default:
      return 4;
  }
};

/**
 * Determines whether confusable letter pairs (b/d, p/q, m/w, n/u, o/q) should be
 * deliberately included in a round's option set for a given difficulty tier.
 *
 * Rules:
 * - Tier 1-2 (Beginner): false — exclude confusable pairs to prevent cognitive overload.
 * - Tier 3-5 (Advanced): true — deliberately include confusable pairs for discrimination practice.
 *
 * @param difficulty - Difficulty tier (1-5).
 * @returns boolean indicating whether confusable pairs should be included.
 */
export const shouldIncludeConfusablePairs = (difficulty: number): boolean => {
  const clamped = Math.max(1, Math.min(5, Math.floor(difficulty)));
  return clamped >= 3;
};

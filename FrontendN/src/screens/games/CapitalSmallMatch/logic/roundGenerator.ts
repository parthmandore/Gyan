/**
 * Purpose: Round generator — selects 4 random letter-case pairs per round
 *          and produces genuinely independently-shuffled capital and lowercase row orderings,
 *          applying confusable-letter separation within each row and avoiding vertical alignment.
 * Module: Capital Small Match — Logic
 * Folder: frontend/src/screens/games/CapitalSmallMatch/logic
 *
 * Pure, testable function with zero side effects.
 * Reuses arrangeGridAvoidingConfusion from Game 1's gridArrangement.ts
 * to ensure confusable letters (b/d, p/q, m/w, n/u) are not placed
 * adjacently within a single row.
 */

import { LetterCasePair, RoundState } from '../types';
import { arrangeGridAvoidingConfusion } from '../../AlphabetMatching/utils/gridArrangement';

const PAIRS_PER_ROUND = 4;

/**
 * Fisher-Yates shuffle (immutable — returns a new array).
 */
function shuffleArray<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates one round of 4 pairs drawn randomly from `allPairs`,
 * optionally excluding pairs whose capital is in `excludeCapitals`
 * (to avoid immediate repetition across consecutive rounds).
 *
 * Returns a `RoundState` with genuinely independently-shuffled row orderings.
 */
export const generateRound = (
  allPairs: readonly LetterCasePair[],
  excludeCapitals: readonly string[] = [],
): RoundState => {
  // 1. Filter out recently-used pairs, fall back to full pool if too few remain.
  let candidatePool = allPairs.filter((p) => !excludeCapitals.includes(p.capital));
  if (candidatePool.length < PAIRS_PER_ROUND) {
    candidatePool = [...allPairs];
  }

  // 2. Draw PAIRS_PER_ROUND random pairs.
  const selectedPairs = shuffleArray(candidatePool).slice(0, PAIRS_PER_ROUND);

  // 3. Capital row: shuffle then apply confusable avoidance
  const capitalLetters = selectedPairs.map((p) => p.capital);
  const shuffledCapitals = shuffleArray(capitalLetters);
  const arrangedCapitals = arrangeGridAvoidingConfusion(shuffledCapitals, PAIRS_PER_ROUND);

  // 4. Lowercase row: independent shuffle with check against vertical alignment
  const lowercaseLetters = selectedPairs.map((p) => p.lowercase);
  let arrangedLowercase = arrangeGridAvoidingConfusion(shuffleArray(lowercaseLetters), PAIRS_PER_ROUND);

  // Ensure lowercase row order is not identically vertically aligned with capital row
  let attempts = 0;
  while (attempts < 10) {
    const alignedCount = arrangedCapitals.filter((cap, idx) => {
      const pair = selectedPairs.find((p) => p.capital === cap);
      return pair && pair.lowercase === arrangedLowercase[idx];
    }).length;

    // If 2 or more pairs happen to align vertically, reshuffle lowercase row
    if (alignedCount <= 1) break;
    arrangedLowercase = arrangeGridAvoidingConfusion(shuffleArray(lowercaseLetters), PAIRS_PER_ROUND);
    attempts++;
  }

  // 5. Convert arranged letter arrays back to index orderings into `selectedPairs`.
  const capitalRowOrder = arrangedCapitals.map((letter) =>
    selectedPairs.findIndex((p) => p.capital === letter)
  );
  const lowercaseRowOrder = arrangedLowercase.map((letter) =>
    selectedPairs.findIndex((p) => p.lowercase === letter)
  );

  return {
    pairs: selectedPairs,
    capitalRowOrder,
    lowercaseRowOrder,
  };
};

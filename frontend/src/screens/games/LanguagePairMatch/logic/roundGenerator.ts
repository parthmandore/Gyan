/**
 * Purpose: Deterministic progressive round generator with strict dual-column
 *          anti-correlation randomization for Language Pair Match.
 * Module: Language Pair Match — Logic
 * Folder: frontend/src/screens/games/LanguagePairMatch/logic
 */

import { ConceptItem, LanguageCode, LanguagePairMatchRound, MatchCard } from '../types';
import { CONCEPTS } from '../data/concepts';

export const ROUND_PAIR_COUNTS = [4, 3, 3] as const;
export const TOTAL_GAME_ROUNDS = ROUND_PAIR_COUNTS.length; // 3 rounds
export const TOTAL_SESSION_PAIRS = 10;

/**
 * Fisher-Yates array shuffle with guarantee of creating a new copy.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Derives a derangement (permutation where no element appears in its original index).
 * Used to guarantee that right-column target cards never mirror left-column source cards.
 */
export function createUncorrelatedOrder(length: number): number[] {
  if (length <= 1) return [0];

  const indices = Array.from({ length }, (_, i) => i);
  let shuffled = shuffleArray(indices);

  // If any item landed on identical index, perform cyclic swap to guarantee displacement
  let attempts = 0;
  while (attempts < 20) {
    let hasCollision = false;
    for (let i = 0; i < length; i++) {
      if (shuffled[i] === i) {
        hasCollision = true;
        const swapTarget = (i + 1) % length;
        [shuffled[i], shuffled[swapTarget]] = [shuffled[swapTarget], shuffled[i]];
      }
    }
    if (!hasCollision) break;
    attempts++;
  }

  // Final deterministic derangement fallback
  let stillHasCollision = false;
  for (let i = 0; i < length; i++) {
    if (shuffled[i] === i) stillHasCollision = true;
  }
  if (stillHasCollision) {
    // Shift every index by 1 position modulo length
    shuffled = indices.map((_, i) => (i + 1) % length);
  }

  return shuffled;
}

/**
 * Generates one round of Language Pair Match.
 *
 * @param roundIndex 0-indexed round number (0 to 5)
 * @param sourceLang Mother tongue / app language
 * @param targetLang Learning language
 * @param usedConceptIds Set of concept IDs used in previous rounds of this session
 */
export function generateLanguagePairRound(
  roundIndex: number,
  sourceLang: LanguageCode,
  targetLang: LanguageCode,
  usedConceptIds: Set<string> = new Set()
): LanguagePairMatchRound {
  const pairCount = ROUND_PAIR_COUNTS[roundIndex] || 3;

  // Prioritize concepts not yet seen in this session
  const unusedConcepts = CONCEPTS.filter((c) => !usedConceptIds.has(c.id));
  const candidatePool = unusedConcepts.length >= pairCount ? unusedConcepts : CONCEPTS;

  const shuffledPool = shuffleArray(candidatePool);
  const selectedConcepts = shuffledPool.slice(0, pairCount);

  // Shuffle source (left) column
  const sourceShuffledConcepts = shuffleArray(selectedConcepts);

  // Derive anti-correlated target (right) column so cards are never in the same row
  const rightColumnDerangement = createUncorrelatedOrder(pairCount);
  const targetShuffledConcepts = rightColumnDerangement.map((idx) => sourceShuffledConcepts[idx]);

  const sourceCards: MatchCard[] = sourceShuffledConcepts.map((concept, idx) => ({
    cardId: `src_${roundIndex}_${concept.id}_${idx}`,
    conceptId: concept.id,
    language: sourceLang,
    text: concept.translations[sourceLang] || concept.translations.en,
    image: concept.image,
    side: 'source',
  }));

  const targetCards: MatchCard[] = targetShuffledConcepts.map((concept, idx) => ({
    cardId: `tgt_${roundIndex}_${concept.id}_${idx}`,
    conceptId: concept.id,
    language: targetLang,
    text: concept.translations[targetLang] || concept.translations.en,
    side: 'target',
  }));

  return {
    roundNumber: roundIndex + 1,
    pairCount,
    sourceCards,
    targetCards,
  };
}

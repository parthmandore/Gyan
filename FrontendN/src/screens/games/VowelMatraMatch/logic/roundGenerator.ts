/**
 * Purpose: Round generator logic for Vowel & Matra Match game.
 *          Generates 3 rounds covering all 11 Devanagari vowel-matra pairs:
 *          Round 1: 4 pairs, Round 2: 4 pairs, Round 3: 3 pairs.
 *          Shuffles left (vowels) and right (matra forms) columns independently.
 * Module: Vowel Matra Match — Logic
 * Folder: frontend/src/screens/games/VowelMatraMatch/logic
 */

import { VowelMatraPairItem, GeneratedVowelMatraRound } from '../types';

/**
 * Fisher-Yates shuffle helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a single round of vowel-matra pairs.
 * Slices the appropriate pair set for roundIndex (0, 1, or 2) and shuffles columns independently.
 */
export function generateVowelMatraRound(
  allPairs: readonly VowelMatraPairItem[],
  roundIndex: number
): GeneratedVowelMatraRound {
  // Round sizing: Round 0 -> 4 pairs, Round 1 -> 4 pairs, Round 2 -> 3 pairs
  const roundSliceMap = [
    { start: 0, count: 4 },
    { start: 4, count: 4 },
    { start: 8, count: 3 },
  ];

  const sliceConfig = roundSliceMap[roundIndex % roundSliceMap.length];
  const selectedPairs = allPairs.slice(sliceConfig.start, sliceConfig.start + sliceConfig.count);

  const vowelOrderIndices = selectedPairs.map((_, idx) => idx);
  const matraOrderIndices = selectedPairs.map((_, idx) => idx);

  const shuffledVowelOrder = shuffleArray(vowelOrderIndices);
  let shuffledMatraOrder = shuffleArray(matraOrderIndices);

  // Prevent coincident vertical alignment across columns where possible
  if (selectedPairs.length > 1) {
    let attempts = 0;
    while (
      attempts < 10 &&
      shuffledVowelOrder.some((v, idx) => v === shuffledMatraOrder[idx])
    ) {
      shuffledMatraOrder = shuffleArray(matraOrderIndices);
      attempts++;
    }
  }

  return {
    pairs: [...selectedPairs],
    vowelColumnOrder: shuffledVowelOrder,
    matraColumnOrder: shuffledMatraOrder,
  };
}

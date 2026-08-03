/**
 * Purpose: Spatial grid layout algorithm that maximizes separation between visually confusable letter pairs (b/d, p/q, m/w, n/u).
 * Module: Alphabet Matching Utils
 * Folder: frontend/src/screens/games/AlphabetMatching/utils
 */

export const CONFUSABLE_PAIRS: Array<[string, string]> = [
  ['B', 'D'],
  ['b', 'd'],
  ['P', 'Q'],
  ['p', 'q'],
  ['M', 'W'],
  ['m', 'w'],
  ['N', 'U'],
  ['n', 'u'],
  ['O', 'Q'],
  ['o', 'q'],
];

export const areConfusable = (char1: string, char2: string): boolean => {
  const c1 = char1.toUpperCase();
  const c2 = char2.toUpperCase();
  return CONFUSABLE_PAIRS.some(
    ([a, b]) => (a === c1 && b === c2) || (a === c2 && b === c1)
  );
};

export const getSpatialViolationScore = (
  idx1: number,
  idx2: number,
  cols: number
): number => {
  const r1 = Math.floor(idx1 / cols);
  const c1 = idx1 % cols;
  const r2 = Math.floor(idx2 / cols);
  const c2 = idx2 % cols;

  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);

  // Orthogonal adjacent (up/down/left/right) = severe penalty (10)
  if (rowDiff + colDiff === 1) return 10;
  // Diagonal adjacent = medium penalty (5)
  if (rowDiff === 1 && colDiff === 1) return 5;
  // Non-adjacent = 0 penalty
  return 0;
};

export const isOrthogonallyAdjacent = (
  idx1: number,
  idx2: number,
  cols: number
): boolean => {
  return getSpatialViolationScore(idx1, idx2, cols) >= 10;
};

export const isSpatialViolation = (
  idx1: number,
  idx2: number,
  cols: number
): boolean => {
  return getSpatialViolationScore(idx1, idx2, cols) > 0;
};

export const arrangeGridAvoidingConfusion = (
  letters: string[],
  cols: number = 2
): string[] => {
  if (!letters || letters.length <= 1) return letters;

  const n = letters.length;
  let bestArrangement = [...letters];
  let minPenalty = Infinity;

  const permute = (arr: string[], start: number): boolean => {
    if (start === n) {
      let penalty = 0;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (areConfusable(arr[i], arr[j])) {
            penalty += getSpatialViolationScore(i, j, cols);
          }
        }
      }
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestArrangement = [...arr];
      }
      return penalty === 0;
    }

    for (let i = start; i < n; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      if (permute(arr, start + 1)) return true;
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
    return false;
  };

  permute([...letters], 0);
  return bestArrangement;
};

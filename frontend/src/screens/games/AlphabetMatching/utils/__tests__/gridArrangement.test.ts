/**
 * Unit test suite for gridArrangement spatial separation algorithm.
 */

import {
  areConfusable,
  isOrthogonallyAdjacent,
  isSpatialViolation,
  arrangeGridAvoidingConfusion,
} from '../gridArrangement';

export const runGridArrangementTests = (): { passed: boolean; results: string[] } => {
  const results: string[] = [];
  let allPassed = true;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      results.push(`✅ PASSED: ${testName}`);
    } else {
      results.push(`❌ FAILED: ${testName}`);
      allPassed = false;
    }
  };

  // Test 1: areConfusable logic
  assert(areConfusable('b', 'd'), 'areConfusable identifies b/d');
  assert(areConfusable('P', 'Q'), 'areConfusable identifies P/Q');
  assert(areConfusable('m', 'W'), 'areConfusable identifies m/W');
  assert(!areConfusable('A', 'B'), 'areConfusable correctly rejects A/B');

  // Test 2: Orthogonal & Spatial adjacency detection
  assert(isOrthogonallyAdjacent(0, 1, 2), 'isOrthogonallyAdjacent detects horizontal adjacency (0, 1)');
  assert(isOrthogonallyAdjacent(0, 2, 2), 'isOrthogonallyAdjacent detects vertical adjacency (0, 2)');
  assert(!isOrthogonallyAdjacent(0, 3, 2), 'isOrthogonallyAdjacent rejects diagonal separation (0, 3)');
  assert(isSpatialViolation(0, 3, 2), 'isSpatialViolation detects diagonal proximity (0, 3)');

  // Test 3: arrangeGridAvoidingConfusion for confusable pair [B, D, E, F] in 2-col grid
  const letters1 = ['B', 'D', 'E', 'F'];
  const arranged1 = arrangeGridAvoidingConfusion(letters1, 2);
  const bIdx1 = arranged1.indexOf('B');
  const dIdx1 = arranged1.indexOf('D');
  assert(
    !isOrthogonallyAdjacent(bIdx1, dIdx1, 2),
    `arrangeGridAvoidingConfusion eliminates orthogonal adjacency for B & D in 2-col grid (B=${bIdx1}, D=${dIdx1})`
  );

  // Test 4: arrangeGridAvoidingConfusion for multiple pairs [M, W, N, U, X, Y] in 3-col grid
  const letters2 = ['M', 'W', 'N', 'U', 'X', 'Y'];
  const arranged2 = arrangeGridAvoidingConfusion(letters2, 3);
  const mIdx = arranged2.indexOf('M');
  const wIdx = arranged2.indexOf('W');
  const nIdx = arranged2.indexOf('N');
  const uIdx = arranged2.indexOf('U');

  assert(
    !isSpatialViolation(mIdx, wIdx, 3),
    `arrangeGridAvoidingConfusion achieves zero spatial violation for M & W in 3-col grid (M=${mIdx}, W=${wIdx})`
  );
  assert(
    !isSpatialViolation(nIdx, uIdx, 3),
    `arrangeGridAvoidingConfusion achieves zero spatial violation for N & U in 3-col grid (N=${nIdx}, U=${uIdx})`
  );

  // Test 5 (NEW): 8-option 2x4 grid layout with multiple confusable pairs (B/D, M/W, P/Q)
  const letters3 = ['B', 'D', 'M', 'W', 'P', 'Q', 'X', 'Y'];
  const arranged3 = arrangeGridAvoidingConfusion(letters3, 4); // 2 rows x 4 cols
  const bIdx3 = arranged3.indexOf('B');
  const dIdx3 = arranged3.indexOf('D');
  const mIdx3 = arranged3.indexOf('M');
  const wIdx3 = arranged3.indexOf('W');
  const pIdx3 = arranged3.indexOf('P');
  const qIdx3 = arranged3.indexOf('Q');

  assert(
    !isOrthogonallyAdjacent(bIdx3, dIdx3, 4),
    `Tier 5 8-option grid eliminates orthogonal adjacency for B & D (B=${bIdx3}, D=${dIdx3})`
  );
  assert(
    !isOrthogonallyAdjacent(mIdx3, wIdx3, 4),
    `Tier 5 8-option grid eliminates orthogonal adjacency for M & W (M=${mIdx3}, W=${wIdx3})`
  );
  assert(
    !isOrthogonallyAdjacent(pIdx3, qIdx3, 4),
    `Tier 5 8-option grid eliminates orthogonal adjacency for P & Q (P=${pIdx3}, Q=${qIdx3})`
  );

  return { passed: allPassed, results };
};

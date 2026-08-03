/**
 * Unit test suite for difficultyConfig utility functions and dynamic mock content generator.
 */

import {
  getGridSizeForDifficulty,
  shouldIncludeConfusablePairs,
} from '../difficultyConfig';
import {
  ensureTargetInOptions,
  generateDynamicMockContent,
} from '../../../../../services/alphabetMatchingContentService';

export const runDifficultyConfigTests = (): { passed: boolean; results: string[] } => {
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

  // === Test getGridSizeForDifficulty across all 5 tiers (7 assertions) ===
  assert(getGridSizeForDifficulty(1) === 4, 'Tier 1 returns 4 options (2x2 grid)');
  assert(getGridSizeForDifficulty(2) === 4, 'Tier 2 returns 4 options (2x2 grid)');
  assert(getGridSizeForDifficulty(3) === 6, 'Tier 3 returns 6 options (2x3 grid)');
  assert(getGridSizeForDifficulty(4) === 6, 'Tier 4 returns 6 options (2x3 grid)');
  assert(getGridSizeForDifficulty(5) === 8, 'Tier 5 returns 8 options (2x4 grid)');
  assert(getGridSizeForDifficulty(0) === 4, 'Out-of-bounds low tier (0) clamps to Tier 1 (4 options)');
  assert(getGridSizeForDifficulty(99) === 8, 'Out-of-bounds high tier (99) clamps to Tier 5 (8 options)');

  // === Test shouldIncludeConfusablePairs across all 5 tiers (5 assertions) ===
  assert(shouldIncludeConfusablePairs(1) === false, 'Tier 1 excludes confusable pairs (false)');
  assert(shouldIncludeConfusablePairs(2) === false, 'Tier 2 excludes confusable pairs (false)');
  assert(shouldIncludeConfusablePairs(3) === true, 'Tier 3 includes confusable pairs (true)');
  assert(shouldIncludeConfusablePairs(4) === true, 'Tier 4 includes confusable pairs (true)');
  assert(shouldIncludeConfusablePairs(5) === true, 'Tier 5 includes confusable pairs (true)');

  // === Test ensureTargetInOptions target letter guarantee (2 assertions) ===
  const opts1 = ['X', 'Y', 'Z', 'W'];
  const fixed1 = ensureTargetInOptions('B', opts1);
  assert(fixed1.includes('B'), 'ensureTargetInOptions inserts target letter if missing');

  const opts2 = ['A', 'B', 'C', 'D'];
  const fixed2 = ensureTargetInOptions('A', opts2);
  assert(fixed2.includes('A') && fixed2.length === 4, 'ensureTargetInOptions preserves options when target letter is present');

  // === Test generateDynamicMockContent (4 assertions) ===
  const tier1Mock = generateDynamicMockContent(1);
  assert(tier1Mock.rounds.length === 10, 'generateDynamicMockContent creates 10 rounds');
  assert(
    tier1Mock.rounds.every((r) => r.options.length === 4 && r.options.includes(r.target_letter)),
    'Tier 1 dynamic rounds all have 4 options and include target letter'
  );

  const tier5Mock = generateDynamicMockContent(5);
  assert(
    tier5Mock.rounds.every((r) => r.options.length === 8 && r.options.includes(r.target_letter)),
    'Tier 5 dynamic rounds all have 8 options and include target letter'
  );

  // Check confusable exclusion in Tier 1 for letter B
  const bRoundTier1 = tier1Mock.rounds.find((r) => r.target_letter === 'B');
  if (bRoundTier1) {
    assert(!bRoundTier1.options.includes('D'), 'Tier 1 dynamic mock excludes confusable partner D for target B');
  } else {
    assert(true, 'Tier 1 dynamic mock excludes confusable partner D for target B (skipped - B not in targets)');
  }

  return { passed: allPassed, results };
};

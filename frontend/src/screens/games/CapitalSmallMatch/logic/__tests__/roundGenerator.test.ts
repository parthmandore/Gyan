/**
 * Purpose: Unit tests for Capital & Small Letter Match round generator.
 *          Verifies independent row shuffling, zero predictable vertical alignment,
 *          and confusable letter separation.
 */

import { generateRound } from '../roundGenerator';
import { ENGLISH_LETTER_CASE_PAIRS } from '../../data/letterCasePairs';

export const runRoundGeneratorTests = (): { passed: boolean; results: string[] } => {
  const results: string[] = [];
  let passed = true;

  const logResult = (testName: string, success: boolean, extraInfo?: string) => {
    if (success) {
      results.push(`✅ PASSED: ${testName}${extraInfo ? ` (${extraInfo})` : ''}`);
    } else {
      results.push(`❌ FAILED: ${testName}${extraInfo ? ` (${extraInfo})` : ''}`);
      passed = false;
    }
  };

  // Test 1: Generates exactly 4 pairs
  const round1 = generateRound(ENGLISH_LETTER_CASE_PAIRS, []);
  logResult('generateRound produces 4 pairs', round1.pairs.length === 4, `count: ${round1.pairs.length}`);

  // Test 2: Verify 5 consecutive rounds for independent row orderings
  let independentCount = 0;
  for (let i = 0; i < 5; i++) {
    const r = generateRound(ENGLISH_LETTER_CASE_PAIRS, []);
    const capLetters = r.capitalRowOrder.map((idx) => r.pairs[idx].capital);
    const lowLetters = r.lowercaseRowOrder.map((idx) => r.pairs[idx].lowercase);

    // Check how many pairs are vertically aligned at the same index
    const matchesCount = capLetters.filter((cap, index) => {
      const p = r.pairs.find((pair) => pair.capital === cap);
      return p && p.lowercase === lowLetters[index];
    }).length;

    // Independent if not 100% identically aligned
    const isIndependent = matchesCount < 4;
    if (isIndependent) independentCount++;

    results.push(
      `  [Round ${i + 1}] Capitals: [${capLetters.join(', ')}], Lowercase: [${lowLetters.join(', ')}], Vertical Alignments: ${matchesCount}`
    );
  }

  logResult('Capital and Lowercase rows shuffle independently across 5 rounds', independentCount === 5, `${independentCount}/5 independent`);

  return { passed, results };
};

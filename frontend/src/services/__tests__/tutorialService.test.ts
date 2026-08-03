/**
 * Purpose: Unit test for tutorialService.ts — verifies AsyncStorage persistence,
 *          tutorial_seen:{gameId} flag setting, checking, and resetting.
 */

import { isTutorialSeen, markTutorialSeen, resetTutorialSeen } from '../tutorialService';

export const runTutorialServiceTests = async (): Promise<{ passed: boolean; results: string[] }> => {
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

  const testGameId = 'test_capital_small_match';

  // Step 1: Initially reset flag
  await resetTutorialSeen(testGameId);
  const initialSeen = await isTutorialSeen(testGameId);
  logResult('isTutorialSeen returns false before being marked', !initialSeen);

  // Step 2: Mark tutorial as seen
  await markTutorialSeen(testGameId);
  const afterMarkSeen = await isTutorialSeen(testGameId);
  logResult('isTutorialSeen returns true after markTutorialSeen', afterMarkSeen);

  // Step 3: Reset flag
  await resetTutorialSeen(testGameId);
  const afterResetSeen = await isTutorialSeen(testGameId);
  logResult('isTutorialSeen returns false after resetTutorialSeen', !afterResetSeen);

  return { passed, results };
};

import { runGridArrangementTests } from './src/screens/games/AlphabetMatching/utils/__tests__/gridArrangement.test';
import { runDifficultyConfigTests } from './src/screens/games/AlphabetMatching/utils/__tests__/difficultyConfig.test';
import { runRoundGeneratorTests } from './src/screens/games/CapitalSmallMatch/logic/__tests__/roundGenerator.test';
import { runTutorialServiceTests } from './src/services/__tests__/tutorialService.test';

async function main() {
  console.log('=== GRID ARRANGEMENT UNIT TEST RESULTS ===');
  const gridResult = runGridArrangementTests();
  gridResult.results.forEach((r) => console.log(r));

  console.log('\n=== DIFFICULTY CONFIG UNIT TEST RESULTS ===');
  const diffResult = runDifficultyConfigTests();
  diffResult.results.forEach((r) => console.log(r));

  console.log('\n=== CAPITAL SMALL MATCH ROUND GENERATOR TEST RESULTS ===');
  const roundResult = runRoundGeneratorTests();
  roundResult.results.forEach((r) => console.log(r));

  console.log('\n=== TUTORIAL SERVICE TEST RESULTS ===');
  const tutorialResult = await runTutorialServiceTests();
  tutorialResult.results.forEach((r) => console.log(r));

  const overallPassed = gridResult.passed && diffResult.passed && roundResult.passed && tutorialResult.passed;
  console.log('\nOVERALL STATUS:', overallPassed ? 'PASSED' : 'FAILED');
  if (!overallPassed) {
    process.exit(1);
  }
}

main();

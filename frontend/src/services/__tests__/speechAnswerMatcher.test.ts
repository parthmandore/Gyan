/**
 * Unit test runner for speechAnswerMatcher multilingual matching logic, dataset verification,
 * and Speech Diagnostics Store metrics.
 */

import {
  isAnswerCorrect,
  normalizeSpeechText,
} from '../../screens/games/SpeechWordChallenge/utils/speechAnswerMatcher';
import { SpeechChallengeItem } from '../../screens/games/SpeechWordChallenge/types';
import { EN_WORDS } from '../../screens/games/SpeechWordChallenge/datasets/enWords';
import { HI_WORDS } from '../../screens/games/SpeechWordChallenge/datasets/hiWords';
import { MR_WORDS } from '../../screens/games/SpeechWordChallenge/datasets/mrWords';
import { useSpeechDiagnosticsStore } from '../../screens/games/SpeechWordChallenge/store/speechDiagnosticsStore';

export const runSpeechAnswerMatcherTests = (): { passed: boolean; results: string[] } => {
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

  // Test 1: Normalization
  assert(
    normalizeSpeechText('  Apple, please!  ') === 'apple please',
    'normalizeSpeechText cleans punctuation and whitespace in English'
  );
  assert(
    normalizeSpeechText('सूर्य पूर्व में उगता है।') === 'सूर्य पूर्व में उगता है',
    'normalizeSpeechText cleans Devanagari danda'
  );
  assert(
    normalizeSpeechText('   APPLE.  ') === 'apple',
    'normalizeSpeechText handles all-caps and trailing period'
  );

  // Test 2: English Dataset Verification (All 15 words)
  EN_WORDS.forEach((item) => {
    assert(
      isAnswerCorrect(item.expectedWord, item).isCorrect,
      `[English Dataset] Accepts primary word "${item.expectedWord}" for ${item.id}`
    );
    assert(
      isAnswerCorrect(item.displayWord.toUpperCase(), item).isCorrect,
      `[English Dataset] Accepts uppercase "${item.displayWord.toUpperCase()}" for ${item.id}`
    );
    assert(
      !isAnswerCorrect('completely_wrong_answer_xyz', item).isCorrect,
      `[English Dataset] Rejects wrong answer for ${item.id}`
    );
  });

  // Test 3: Hindi Dataset Verification (All 15 words)
  HI_WORDS.forEach((item) => {
    assert(
      isAnswerCorrect(item.expectedWord, item).isCorrect,
      `[Hindi Dataset] Accepts primary word "${item.expectedWord}" for ${item.id}`
    );
    assert(
      isAnswerCorrect(`${item.expectedWord}।`, item).isCorrect,
      `[Hindi Dataset] Accepts word with danda "${item.expectedWord}।" for ${item.id}`
    );
    assert(
      !isAnswerCorrect('अशुद्ध_उत्तर', item).isCorrect,
      `[Hindi Dataset] Rejects wrong answer for ${item.id}`
    );
  });

  // Test 4: Marathi Dataset Verification (All 15 words)
  MR_WORDS.forEach((item) => {
    assert(
      isAnswerCorrect(item.expectedWord, item).isCorrect,
      `[Marathi Dataset] Accepts primary word "${item.expectedWord}" for ${item.id}`
    );
    assert(
      isAnswerCorrect(`${item.expectedWord}।`, item).isCorrect,
      `[Marathi Dataset] Accepts word with danda "${item.expectedWord}।" for ${item.id}`
    );
    assert(
      !isAnswerCorrect('चुकीचे_उत्तर', item).isCorrect,
      `[Marathi Dataset] Rejects wrong answer for ${item.id}`
    );
  });

  // Test 5: Speech Diagnostics Store Tests
  const diagStore = useSpeechDiagnosticsStore.getState();
  diagStore.clearDiagnostics();
  assert(diagStore.getTotalAttempts() === 0, 'Diagnostics store clears successfully');

  diagStore.recordAttemptDiagnostic({
    expectedWord: 'apple',
    recognizedText: 'apple',
    selectedLanguage: 'en',
    languageReturned: 'en',
    recordingDurationSec: 1.4,
    apiLatencyMs: 620,
    result: 'CORRECT',
  });

  diagStore.recordAttemptDiagnostic({
    expectedWord: 'कमल',
    recognizedText: 'कमल',
    selectedLanguage: 'hi',
    languageReturned: 'hi',
    recordingDurationSec: 1.2,
    apiLatencyMs: 540,
    result: 'CORRECT',
  });

  diagStore.recordAttemptDiagnostic({
    expectedWord: 'सफरचंद',
    recognizedText: 'केळे',
    selectedLanguage: 'mr',
    languageReturned: 'mr',
    recordingDurationSec: 1.5,
    apiLatencyMs: 610,
    result: 'INCORRECT',
  });

  diagStore.recordAttemptDiagnostic({
    expectedWord: 'ball',
    recognizedText: '',
    selectedLanguage: 'en',
    languageReturned: 'en',
    recordingDurationSec: 0.8,
    apiLatencyMs: 0,
    result: 'EMPTY',
  });

  assert(diagStore.getTotalAttempts() === 4, 'Diagnostic total attempts matches');
  assert(diagStore.getCorrectCount() === 2, 'Diagnostic correct count matches');
  assert(diagStore.getIncorrectCount() === 1, 'Diagnostic incorrect count matches');
  assert(diagStore.getEmptyCount() === 1, 'Diagnostic empty count matches');
  assert(diagStore.getAverageLatencyMs() === 590, 'Diagnostic average latency calculates properly (590ms)');

  const breakdown = diagStore.getLanguageBreakdown();
  const enStat = breakdown.find((b) => b.language === 'en');
  const hiStat = breakdown.find((b) => b.language === 'hi');
  const mrStat = breakdown.find((b) => b.language === 'mr');
  assert(enStat?.attempts === 2 && enStat?.correct === 1, 'English language diagnostic breakdown matches');
  assert(hiStat?.attempts === 1 && hiStat?.correct === 1, 'Hindi language diagnostic breakdown matches');
  assert(mrStat?.attempts === 1 && mrStat?.correct === 0, 'Marathi language diagnostic breakdown matches');

  const misrecognized = diagStore.getMisrecognizedAnswers();
  assert(
    misrecognized.length === 1 && misrecognized[0].expected === 'सफरचंद' && misrecognized[0].heard === 'केळे',
    'Misrecognized answer aggregation matches'
  );

  return { passed: allPassed, results };
};

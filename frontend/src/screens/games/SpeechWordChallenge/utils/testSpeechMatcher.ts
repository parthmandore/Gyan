/**
 * Purpose: Comprehensive test runner for SpeechAnswerMatcher validating
 *          accent tolerance, Devanagari dialectal forms, and confusable word protection.
 */

import { isAnswerCorrect } from './speechAnswerMatcher';
import { SpeechChallengeItem } from '../types';

interface TestCase {
  name: string;
  item: SpeechChallengeItem;
  recognizedText: string;
  expectedResult: boolean;
}

const tests: TestCase[] = [
  // 1. Exact matches
  {
    name: 'Exact match English: bowl',
    item: { id: '1', expectedWord: 'bowl', displayWord: 'Bowl', acceptedVariants: ['a bowl'], image: '🥣', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'bowl',
    expectedResult: true,
  },
  {
    name: 'Exact match Hindi: सूरज',
    item: { id: '2', expectedWord: 'सूरज', displayWord: 'सूरज', acceptedVariants: ['सूर्य'], image: '☀️', spokenPrompt: '', phoneticHint: '', category: 'nature' },
    recognizedText: 'सूरज',
    expectedResult: true,
  },
  {
    name: 'Exact match Marathi: कमळ',
    item: { id: '3', expectedWord: 'कमळ', displayWord: 'कमळ', acceptedVariants: ['कमल'], image: '🪷', spokenPrompt: '', phoneticHint: '', category: 'nature' },
    recognizedText: 'कमळ',
    expectedResult: true,
  },

  // 2. Confusable word protections (MUST BE REJECTED)
  {
    name: 'Strict protection: "ball" should NOT match "bowl"',
    item: { id: '1', expectedWord: 'bowl', displayWord: 'Bowl', acceptedVariants: [], image: '🥣', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'ball',
    expectedResult: false,
  },
  {
    name: 'Strict protection: "bye" should NOT match "bowl"',
    item: { id: '1', expectedWord: 'bowl', displayWord: 'Bowl', acceptedVariants: [], image: '🥣', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'bye',
    expectedResult: false,
  },
  {
    name: 'Strict protection: "bad" should NOT match "bed"',
    item: { id: '4', expectedWord: 'bed', displayWord: 'Bed', acceptedVariants: [], image: '🛏️', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'bad',
    expectedResult: false,
  },
  {
    name: 'Strict protection: "sheep" should NOT match "ship"',
    item: { id: '5', expectedWord: 'ship', displayWord: 'Ship', acceptedVariants: [], image: '🚢', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'sheep',
    expectedResult: false,
  },
  {
    name: 'Strict protection: "bat" should NOT match "cat"',
    item: { id: '6', expectedWord: 'cat', displayWord: 'Cat', acceptedVariants: [], image: '🐱', spokenPrompt: '', phoneticHint: '', category: 'animals' },
    recognizedText: 'bat',
    expectedResult: false,
  },
  {
    name: 'Strict protection: "van" should NOT match "fan"',
    item: { id: '7', expectedWord: 'fan', displayWord: 'Fan', acceptedVariants: [], image: '🌀', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'van',
    expectedResult: false,
  },

  // 3. Indian English accent & child articulation tolerance (MUST BE ACCEPTED)
  {
    name: 'Accent tolerance: "gat" for "cat"',
    item: { id: '6', expectedWord: 'cat', displayWord: 'Cat', acceptedVariants: ['gat', 'kat'], image: '🐱', spokenPrompt: '', phoneticHint: '', category: 'animals' },
    recognizedText: 'gat',
    expectedResult: true,
  },
  {
    name: 'Accent tolerance: "cheer" for "chair"',
    item: { id: '8', expectedWord: 'chair', displayWord: 'Chair', acceptedVariants: ['cheer'], image: '🪑', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'cheer',
    expectedResult: true,
  },
  {
    name: 'Accent tolerance: "bin" for "pen"',
    item: { id: '9', expectedWord: 'pen', displayWord: 'Pen', acceptedVariants: ['bin', 'pan'], image: '🖊️', spokenPrompt: '', phoneticHint: '', category: 'objects' },
    recognizedText: 'bin',
    expectedResult: true,
  },

  // 4. Devanagari dialectal & linguistic equivalents (MUST BE ACCEPTED)
  {
    name: 'Devanagari retroflex equivalence: "पानी" for "पाणी"',
    item: { id: '10', expectedWord: 'पाणी', displayWord: 'पाणी', acceptedVariants: [], image: '💧', spokenPrompt: '', phoneticHint: '', category: 'nature' },
    recognizedText: 'पानी',
    expectedResult: true,
  },
  {
    name: 'Devanagari retroflex equivalence: "कमल" for "कमळ"',
    item: { id: '3', expectedWord: 'कमळ', displayWord: 'कमळ', acceptedVariants: [], image: '🪷', spokenPrompt: '', phoneticHint: '', category: 'nature' },
    recognizedText: 'कमल',
    expectedResult: true,
  },
  {
    name: 'Devanagari nukta equivalence: "पेड़" vs "पेड"',
    item: { id: '11', expectedWord: 'पेड़', displayWord: 'पेड़', acceptedVariants: [], image: '🌳', spokenPrompt: '', phoneticHint: '', category: 'nature' },
    recognizedText: 'पेड',
    expectedResult: true,
  },
  {
    name: 'Devanagari matra shift: "सीब" for "सेब"',
    item: { id: '12', expectedWord: 'सेब', displayWord: 'सेब', acceptedVariants: ['सीब'], image: '🍎', spokenPrompt: '', phoneticHint: '', category: 'fruits' },
    recognizedText: 'सीब',
    expectedResult: true,
  },
  {
    name: 'Devanagari variant: "सप्फर्चंदू" for "सफरचंद"',
    item: { id: '13', expectedWord: 'सफरचंद', displayWord: 'सफरचंद', acceptedVariants: [], image: '🍎', spokenPrompt: '', phoneticHint: '', category: 'fruits' },
    recognizedText: 'सप्फर्चंदू',
    expectedResult: true,
  },
];

let passed = 0;
let failed = 0;

console.log('====================================================');
console.log('  RUNNING SPEECH ANSWER MATCHER REGRESSION TESTS');
console.log('====================================================\n');

for (const tc of tests) {
  const result = isAnswerCorrect(tc.recognizedText, tc.item);
  const ok = result.isCorrect === tc.expectedResult;
  if (ok) {
    passed++;
    console.log(`  [PASS] ${tc.name}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${tc.name} -> Expected: ${tc.expectedResult}, Got: ${result.isCorrect}`);
  }
}

console.log(`\n====================================================`);
console.log(`  RESULTS: ${passed}/${tests.length} passed (${((passed / tests.length) * 100).toFixed(1)}%) | Failed: ${failed}`);
console.log(`====================================================`);

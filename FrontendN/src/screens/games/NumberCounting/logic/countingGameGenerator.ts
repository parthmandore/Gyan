/**
 * Purpose: Game logic and progressive question generation for Number Counting (Age 5).
 * Module: Number Counting — Logic Generator
 * Folder: frontend/src/screens/games/NumberCounting/logic
 */

import {
  CountableObjectItem,
  CountingOption,
  CountingQuestion,
  SupportedLanguage,
} from '../types';
import { COUNTABLE_OBJECTS } from '../datasets/countableObjects';

export const TOTAL_COUNTING_ROUNDS = 10;

// Progressive count ranges for Age 5 (10 rounds)
export const ROUND_COUNT_RANGES: Array<{ min: number; max: number }> = [
  { min: 1, max: 3 }, // Round 1: 1–3
  { min: 1, max: 3 }, // Round 2: 1–3
  { min: 2, max: 4 }, // Round 3: 2–4
  { min: 2, max: 5 }, // Round 4: 2–5
  { min: 3, max: 5 }, // Round 5: 3–5
  { min: 3, max: 6 }, // Round 6: 3–6
  { min: 4, max: 7 }, // Round 7: 4–7
  { min: 4, max: 8 }, // Round 8: 4–8
  { min: 5, max: 9 }, // Round 9: 5–9
  { min: 5, max: 10 }, // Round 10: 5–10
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates 3 distinct options: 1 correct and 2 plausible distractors.
 */
export function generateOptions(correctCount: number): CountingOption[] {
  const optionsSet = new Set<number>([correctCount]);

  // Candidate pool prioritizing near neighbors (±1, ±2)
  const candidateDeltas = [-1, 1, -2, 2, -3, 3];
  shuffleArray(candidateDeltas);

  for (const delta of candidateDeltas) {
    if (optionsSet.size >= 3) break;
    const candidate = correctCount + delta;
    if (candidate >= 1 && candidate <= 10 && !optionsSet.has(candidate)) {
      optionsSet.add(candidate);
    }
  }

  // Fallback if needed: any number 1..10 not yet chosen
  while (optionsSet.size < 3) {
    const fallback = getRandomInt(1, 10);
    optionsSet.add(fallback);
  }

  const shuffledNumbers = shuffleArray(Array.from(optionsSet));

  return shuffledNumbers.map((num, idx) => ({
    id: `opt_${correctCount}_${num}_${idx}`,
    number: num,
    label: num.toString(),
    isCorrect: num === correctCount,
  }));
}

/**
 * Builds localized question texts for the countable item and count.
 */
export function buildQuestionText(
  item: CountableObjectItem,
  count: number
): Record<SupportedLanguage, string> {
  const enNoun = item.names.en.plural;
  const hiNoun = item.names.hi.plural;
  const mrNoun = item.names.mr.plural;

  // Specific Hindi interrogative (कितनी vs कितने based on feminine plural ending)
  const isHiFeminine =
    ['बत्तखें', 'मछलियाँ', 'गाड़ियाँ', 'गेंदें', 'स्ट्रॉबेरी'].includes(hiNoun);
  const hiQuestion = isHiFeminine ? `कितनी ${hiNoun} हैं?` : `कितने ${hiNoun} हैं?`;

  return {
    en: `How many ${enNoun}?`,
    hi: hiQuestion,
    mr: `किती ${mrNoun} आहेत?`,
  };
}

/**
 * Builds spoken audio instructions for text-to-speech.
 */
export function buildSpokenPhrase(
  item: CountableObjectItem,
  count: number
): Record<SupportedLanguage, string> {
  const enNoun = item.names.en.plural;
  const hiNoun = item.names.hi.plural;
  const mrNoun = item.names.mr.plural;

  const isHiFeminine =
    ['बत्तखें', 'मछलियाँ', 'गाड़ियाँ', 'गेंदें', 'स्ट्रॉबेरी'].includes(hiNoun);
  const hiInterrogative = isHiFeminine ? 'कितनी' : 'कितने';

  return {
    en: `How many ${enNoun} do you see? Count them!`,
    hi: `आपको ${hiInterrogative} ${hiNoun} दिख रहे हैं? गिनकर बताओ!`,
    mr: `तुम्हाला किती ${mrNoun} दिसत आहेत? मोजून सांगा!`,
  };
}

/**
 * Generates a 5-round game session with progressive difficulty and distinct objects.
 */
export function generateCountingSession(): CountingQuestion[] {
  const shuffledItems = shuffleArray(COUNTABLE_OBJECTS);
  const selectedItems = shuffledItems.slice(0, TOTAL_COUNTING_ROUNDS);

  const usedCounts: number[] = [];

  return selectedItems.map((item, index) => {
    const range = ROUND_COUNT_RANGES[index] || { min: 1, max: 10 };
    let targetCount = getRandomInt(range.min, range.max);

    // Try to avoid the exact same target count in consecutive rounds if possible
    if (usedCounts.length > 0 && targetCount === usedCounts[usedCounts.length - 1]) {
      const candidates = [];
      for (let c = range.min; c <= range.max; c++) {
        if (c !== targetCount) candidates.push(c);
      }
      if (candidates.length > 0) {
        targetCount = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    usedCounts.push(targetCount);

    const options = generateOptions(targetCount);
    const questionText = buildQuestionText(item, targetCount);
    const spokenPhrase = buildSpokenPhrase(item, targetCount);

    return {
      id: `counting_q_${index + 1}_${item.id}_${Date.now()}`,
      roundNumber: index + 1,
      targetCount,
      objectItem: item,
      options,
      questionText,
      spokenPhrase,
    };
  });
}

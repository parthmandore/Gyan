/**
 * Purpose: Two-stage principled educational answer matcher for Speech Word Challenge.
 *          Tolerant of natural Indian English accents, child articulation variations,
 *          and Devanagari phonetic/matra equivalents without accepting confusable words.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/utils
 */

import { SpeechChallengeItem } from '../types';

/**
 * Confusable word pairs: Distinct words that sound somewhat similar but represent
 * completely different concepts and must NEVER be accepted as matches.
 */
const CONFUSABLE_PROTECTION_MAP: Record<string, string[]> = {
  bowl: ['ball', 'bye', 'bull', 'bell', 'boy', 'bow', 'boil', 'doll'],
  ball: ['bowl', 'bull', 'bell', 'boy', 'bald', 'doll', 'call'],
  bye: ['bowl', 'ball', 'boy', 'buy', 'pie'],
  cat: ['bat', 'rat', 'hat', 'mat', 'cap', 'car', 'can', 'cut'],
  bat: ['cat', 'hat', 'rat', 'mat', 'bad', 'bet', 'bit', 'bot'],
  hat: ['cat', 'bat', 'rat', 'mat', 'hot', 'hut', 'hit'],
  dog: ['dot', 'fog', 'log', 'dug', 'dig', 'bog'],
  sun: ['son', 'sin', 'run', 'gun', 'fun', 'sum'],
  fish: ['dish', 'wish', 'fist', 'fit'],
  book: ['cook', 'look', 'hook', 'back', 'buck'],
  tree: ['three', 'free', 'tea', 'try'],
  bed: ['bad', 'bud', 'red', 'fed'],
  bad: ['bed', 'bud', 'dad', 'bag'],
  ship: ['sheep', 'chip', 'shop', 'sip'],
  sheep: ['ship', 'cheap', 'sheet', 'seep'],
  fan: ['van', 'fun', 'pan', 'man'],
  van: ['fan', 'pan', 'man', 'can'],
  red: ['bed', 'read', 'rid', 'rod'],
  pen: ['pan', 'pin', 'pun', 'pet', 'ten'],
};

/**
 * Normalizes Devanagari script for child educational evaluation:
 * - NFC Unicode normalization
 * - Nukta normalization (ड़ -> ड, फ़ -> फ, etc.)
 * - Chandrabindu to Anusvara (ँ -> ं)
 * - Retroflex to Dental equivalence (ण -> न, ळ -> ल)
 * - Strips punctuation, dandas, and extra spaces
 * - Collapses conjunct geminates (e.g. प्फ -> फ, क्क -> क)
 */
export const normalizeDevanagari = (text: string): string => {
  if (!text) return '';
  let cleaned = text.normalize('NFC').trim();
  // Strip punctuation and dandas
  cleaned = cleaned.replace(/[।॥\.,!?:;\"'()\[\]{}–—\-_/\\*~`#@%^&+=<>|]/g, ' ');
  // Normalize nukta forms to base characters
  cleaned = cleaned.replace(/ड़/g, 'ड').replace(/ढ़/g, 'ढ').replace(/फ़/g, 'फ').replace(/ज़/g, 'ज').replace(/ख़/g, 'ख').replace(/ग़/g, 'ग');
  // Chandrabindu to Anusvara
  cleaned = cleaned.replace(/ँ/g, 'ं');
  // Retroflex to dental canonicalization
  cleaned = cleaned.replace(/ण/g, 'न').replace(/ळ/g, 'ल');
  // Collapse Devanagari conjunct geminations
  cleaned = cleaned.replace(/([क-ह])्\1/g, '$1').replace(/प्फ/g, 'फ').replace(/क्ख/g, 'ख').replace(/त्थ/g, 'थ');
  // Collapse whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Computes phonetic consonant skeleton for English words (Soundex-like)
 */
export const getEnglishPhoneticKey = (word: string): string => {
  if (!word) return '';
  let w = word.toLowerCase().trim();
  w = w.replace(/[^a-z]/g, '');
  if (!w) return '';

  // Consonant sound groups (treating similar articulatory plosives/fricatives as related)
  let key = w
    .replace(/ph/g, 'f')
    .replace(/sh|ch/g, 'X')
    .replace(/th/g, '0')
    .replace(/ck|qu/g, 'k')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k')
    .replace(/wr/g, 'r')
    .replace(/kn/g, 'n');

  // Strip duplicate adjacent consonants
  let dedup = '';
  for (let i = 0; i < key.length; i++) {
    if (i === 0 || key[i] !== key[i - 1]) {
      dedup += key[i];
    }
  }

  return dedup;
};

/**
 * Standard Levenshtein distance
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Cleans and normalizes general text:
 * - NFC normalization
 * - Lowercase
 * - Strip punctuation & dandas
 * - Collapse whitespace
 */
export const normalizeSpeechText = (text: string): string => {
  if (!text) return '';
  let cleaned = text.normalize('NFC').trim().toLowerCase();
  cleaned = cleaned.replace(/[।॥\.,!?:;\"'()\[\]{}–—\-_/\\*~`#@%^&+=<>|]/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Evaluates whether the spoken input matches the expected educational target.
 */
export const isAnswerCorrect = (
  recognizedText: string,
  targetItem: SpeechChallengeItem
): { isCorrect: boolean; matchedVariant?: string } => {
  const normRecognized = normalizeSpeechText(recognizedText);
  if (!normRecognized) {
    return { isCorrect: false };
  }

  const expectedLower = targetItem.expectedWord.toLowerCase().trim();
  const candidateTargets = [
    targetItem.expectedWord,
    targetItem.displayWord,
    ...(targetItem.acceptedVariants || []),
  ].map(normalizeSpeechText).filter(Boolean);

  const recognizedWords = normRecognized.split(' ');

  // -------------------------------------------------------------------------
  // 1. CONFUSABLE PROTECTION: Block known confusable words
  // -------------------------------------------------------------------------
  const confusableList = CONFUSABLE_PROTECTION_MAP[expectedLower];
  if (confusableList) {
    for (const recWord of recognizedWords) {
      if (confusableList.includes(recWord) && recWord !== expectedLower) {
        return { isCorrect: false };
      }
    }
    if (confusableList.includes(normRecognized) && normRecognized !== expectedLower) {
      return { isCorrect: false };
    }
  }

  // -------------------------------------------------------------------------
  // 2. EXACT & SUBSTRING MATCHING
  // -------------------------------------------------------------------------
  for (const target of candidateTargets) {
    if (normRecognized === target) {
      return { isCorrect: true, matchedVariant: target };
    }
    if (recognizedWords.includes(target)) {
      return { isCorrect: true, matchedVariant: target };
    }
    if (normRecognized.includes(target) && target.length >= 3) {
      return { isCorrect: true, matchedVariant: target };
    }
  }

  // -------------------------------------------------------------------------
  // 3. DEVANAGARI LINGUISTIC & DIALECTAL MATCHING (Hindi / Marathi)
  // -------------------------------------------------------------------------
  const devanagariRecognized = normalizeDevanagari(recognizedText);
  const devanagariWords = devanagariRecognized.split(' ');

  for (const target of candidateTargets) {
    const devTarget = normalizeDevanagari(target);
    if (devanagariRecognized === devTarget) {
      return { isCorrect: true, matchedVariant: target };
    }
    if (devanagariWords.includes(devTarget)) {
      return { isCorrect: true, matchedVariant: target };
    }

    // Levenshtein on Devanagari
    for (const recWord of devanagariWords) {
      const allowedDist = devTarget.length >= 6 ? 3 : devTarget.length >= 4 ? 1 : 0;
      if (allowedDist > 0) {
        const dist = levenshteinDistance(recWord, devTarget);
        if (dist <= allowedDist) {
          return { isCorrect: true, matchedVariant: target };
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. ENGLISH PHONETIC & ACCENT MATCHING
  // -------------------------------------------------------------------------
  const targetKey = getEnglishPhoneticKey(expectedLower);
  for (const recWord of recognizedWords) {
    const recKey = getEnglishPhoneticKey(recWord);

    // Phonetic key exact match (for words length >= 4)
    if (targetKey && recKey && targetKey === recKey && expectedLower.length >= 4) {
      return { isCorrect: true, matchedVariant: expectedLower };
    }

    // Levenshtein tolerance on English words (preventing 3-letter false positives)
    if (expectedLower.length >= 4 && recWord.length >= 3) {
      const dist = levenshteinDistance(recWord, expectedLower);
      if (dist <= 1) {
        return { isCorrect: true, matchedVariant: expectedLower };
      }
    } else if (expectedLower.length >= 6 && recWord.length >= 5) {
      const dist = levenshteinDistance(recWord, expectedLower);
      if (dist <= 2) {
        return { isCorrect: true, matchedVariant: expectedLower };
      }
    }
  }

  return { isCorrect: false };
};

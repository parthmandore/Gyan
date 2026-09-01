/**
 * Purpose: Rotated language-aware voice praise lines for correct-answer celebrations (EN, HI, MR).
 * Module: Services
 * Folder: frontend/src/services
 */

import { speakPhrase } from './speechService';

const PRAISE_PHRASES_MAP: Record<string, readonly string[]> = {
  english: [
    'Great job!',
    'Wonderful!',
    'You got it!',
    'Amazing!',
    'Super star!',
    'Well done!',
    'Fantastic!',
    'Keep it up!',
  ],
  hindi: [
    'बहुत अच्छा!',
    'शाबाश!',
    'उत्तम!',
    'बहुत बढ़िया!',
    'शानदार!',
    'वाह!',
  ],
  marathi: [
    'छान!',
    'खूप छान!',
    'उत्तम!',
    'शाब्बास!',
    'अप्रतिम!',
    'सुरेख!',
  ],
};

let praiseIndex = 0;

/**
 * Speaks a rotating language-aware praise phrase aloud.
 */
export const speakPraise = (): void => {
  let lang = 'english';
  try {
    const { LanguageManager } = require('../language/LanguageManager');
    lang = LanguageManager.getLanguage();
  } catch {
    lang = 'english';
  }

  const phrases = PRAISE_PHRASES_MAP[lang] || PRAISE_PHRASES_MAP.english;
  const phrase = phrases[praiseIndex % phrases.length];
  praiseIndex++;

  try {
    speakPhrase(phrase);
  } catch (error) {
    console.warn('[praiseService] praise audio failed:', error);
  }
};

export const resetPraiseRotation = (): void => {
  praiseIndex = 0;
};

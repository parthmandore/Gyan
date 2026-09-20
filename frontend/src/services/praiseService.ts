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
export const speakPraise = (overrideLang?: 'en' | 'hi' | 'mr' | string): void => {
  let lang = 'english';
  let speechCode: 'en' | 'hi' | 'mr' | undefined = undefined;

  if (overrideLang) {
    if (overrideLang === 'hi' || overrideLang === 'hindi') {
      lang = 'hindi';
      speechCode = 'hi';
    } else if (overrideLang === 'mr' || overrideLang === 'marathi') {
      lang = 'marathi';
      speechCode = 'mr';
    } else {
      lang = 'english';
      speechCode = 'en';
    }
  } else {
    try {
      const { useAppLanguageStore } = require('../state/appLanguageStore');
      const motherTongue = useAppLanguageStore.getState().motherTongue || 'en';
      if (motherTongue === 'hi') {
        lang = 'hindi';
        speechCode = 'hi';
      } else if (motherTongue === 'mr') {
        lang = 'marathi';
        speechCode = 'mr';
      } else {
        lang = 'english';
        speechCode = 'en';
      }
    } catch {
      lang = 'english';
      speechCode = 'en';
    }
  }

  const phrases = PRAISE_PHRASES_MAP[lang] || PRAISE_PHRASES_MAP.english;
  const phrase = phrases[praiseIndex % phrases.length];
  praiseIndex++;

  try {
    speakPhrase(phrase, speechCode ? { language: speechCode } : undefined);
  } catch (error) {
    console.warn('[praiseService] praise audio failed:', error);
  }
};

export const resetPraiseRotation = (): void => {
  praiseIndex = 0;
};

/**
 * Purpose: Audio service for Capital & Small Letter Match — Simplified single-utterance speech dispatches.
 *          Capital selection: "Capital [Letter]"
 *          Lowercase selection: "Small [letter]"
 *          Correct match: SILENT (pure visual feedback)
 *          Wrong match reveal: "This is [letter]"
 * Module: Capital Small Match — Services
 * Folder: frontend/src/screens/games/CapitalSmallMatch/services
 */

import { speakPhrase, stopSpeech } from '../../../../services/speechService';
import { speakPraise } from '../../../../services/praiseService';

let matchPhraseIndex = 0;

const REVEAL_TEACHING_PATTERNS: Record<string, string> = {
  english: 'This is {lowercase}',
  hindi: 'यह {lowercase} है',
  marathi: 'हे {lowercase} आहे',
};

function getInstructionLanguage(): 'english' | 'hindi' | 'marathi' {
  try {
    const { useAppLanguageStore } = require('../../../../state/appLanguageStore');
    const motherTongue = useAppLanguageStore.getState().motherTongue;
    if (motherTongue === 'hi') return 'hindi';
    if (motherTongue === 'mr') return 'marathi';
  } catch {}
  return 'english';
}

/**
 * Speaks a single capital or lowercase letter with concise phrasing.
 * Capital letter: "Capital [Letter]" (e.g. "Capital A")
 * Lowercase letter: "Small [letter]" (e.g. "Small a")
 */
export const playTileLetterAudio = async (
  letter: string,
  isCapital?: boolean,
  cancelPrevious: boolean = true
): Promise<void> => {
  try {
    const { useAppLanguageStore } = require('../../../../state/appLanguageStore');
    const motherTongue = useAppLanguageStore.getState().motherTongue || 'en';
    const isCap = isCapital !== undefined ? isCapital : letter === letter.toUpperCase();

    let spokenText = isCap ? `Capital ${letter}` : `Small ${letter}`;
    if (motherTongue === 'hi') {
      spokenText = isCap ? `बड़ा अक्षर ${letter}` : `छोटा अक्षर ${letter}`;
    } else if (motherTongue === 'mr') {
      spokenText = isCap ? `मोठे अक्षर ${letter}` : `लहान अक्षर ${letter}`;
    }

    await speakPhrase(spokenText, { cancelPrevious, language: motherTongue });
  } catch (err) {
    console.warn('[matchAudioService] Tile letter audio failed:', err);
  }
};

/**
 * Correct match is SILENT per design requirements (pure visual feedback).
 */
export const playCorrectMatchAudio = async (): Promise<void> => {
  // Silent on correct match — no speech dispatch
};

/**
 * Speaks a single short teaching phrase when revealing a pair after a wrong attempt.
 * e.g. "This is a"
 */
export const playWrongMatchRevealAudio = async (
  lowercase: string,
  cancelPrevious: boolean = true
): Promise<void> => {
  try {
    const { useAppLanguageStore } = require('../../../../state/appLanguageStore');
    const motherTongue = useAppLanguageStore.getState().motherTongue || 'en';
    const lang = getInstructionLanguage();
    const pattern = REVEAL_TEACHING_PATTERNS[lang] || REVEAL_TEACHING_PATTERNS.english;
    const phrase = pattern.replace('{lowercase}', lowercase);

    await speakPhrase(phrase, { cancelPrevious, language: motherTongue });
  } catch (err) {
    console.warn('[matchAudioService] playWrongMatchRevealAudio exception:', err);
  }
};

/**
 * Speaks a round-complete celebratory praise phrase (non-blocking).
 */
export const playRoundCompleteAudio = (): void => {
  try {
    speakPraise();
  } catch (err) {
    console.warn('[matchAudioService] Round complete audio failed:', err);
  }
};

export const resetMatchAudioRotation = (): void => {
  matchPhraseIndex = 0;
};

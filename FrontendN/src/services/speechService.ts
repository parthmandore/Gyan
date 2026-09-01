/**
 * Purpose: Airtight language-aware speech service with precise locale voice resolution (EN, HI, MR),
 *          Marathi-to-Hindi fallback, phonetic transliteration for platforms lacking Devanagari voices,
 *          and detailed diagnostic logging.
 * Module: Services
 * Folder: frontend/src/services
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface PlaybackResult {
  success: boolean;
  source: 'cached_url' | 'local_tts_fallback';
  error?: string;
}

export interface VoiceInfo {
  locale: string;
  name?: string;
  hasNativeVoice: boolean;
}

/*
 * LETTER_PHONETIC_NAMES has been removed.
 * Single Latin characters (A-Z) are passed directly as uppercase single letters to native TTS,
 * preventing homophone word substitutions like "U" -> "You", "I" -> "Eye", or "Q" -> "Queue".
 */
const NUMBER_WORDS: Record<string, string> = {
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
};

/*
 * DEVANAGARI_PHONETIC_FALLBACK has been intentionally removed.
 * Rationale: An incorrect English-phonetic pronunciation is worse for a
 * language-learning app than no audio at all. When no native hi-IN / mr-IN
 * TTS voice is installed, speech calls now fail gracefully and silently.
 * Production audio will be served by the Backend AI4Bharat TTS pipeline.
 */

let _speechSessionId = 0;

/**
 * Detects and returns the best matching TTS voice for the active learning language.
 */
export const getVoiceForLanguage = async (targetLang: 'english' | 'hindi' | 'marathi'): Promise<VoiceInfo> => {
  let preferredLocales: string[] = [];
  if (targetLang === 'hindi') {
    preferredLocales = ['hi-IN', 'hi_IN', 'hi'];
  } else if (targetLang === 'marathi') {
    // Rule: Try Marathi first; if unavailable, automatically fallback to Hindi TTS
    preferredLocales = ['mr-IN', 'mr_IN', 'mr', 'hi-IN', 'hi_IN', 'hi'];
  } else {
    preferredLocales = ['en-IN', 'en-GB', 'en-US', 'en'];
  }

  try {
    let availableVoices: Array<{ language?: string; lang?: string; name?: string; identifier?: string }> = [];

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        availableVoices = window.speechSynthesis.getVoices();
      }
    } else {
      availableVoices = await Speech.getAvailableVoicesAsync();
    }

    console.log(`[speechService] Device reports ${availableVoices.length} total TTS voices.`);

    if (availableVoices.length > 0) {
      for (const pref of preferredLocales) {
        const match = availableVoices.find((v) => {
          const vLang = (v.language || v.lang || '').toLowerCase();
          const vName = (v.name || '').toLowerCase();

          const targetPref = pref.toLowerCase();
          const isLangMatch = vLang === targetPref || vLang.startsWith(`${targetPref}-`) || vLang.startsWith(`${targetPref}_`);
          const isNameMatch = targetLang !== 'english'
            ? (vName.includes('hindi') || vName.includes('marathi') || vName.includes('swara') || vName.includes('hemant') || vName.includes('kalpana'))
            : (vName.includes('english') || vName.includes('david') || vName.includes('mark') || vName.includes('zira'));

          return isLangMatch || isNameMatch;
        });

        if (match) {
          const matchedLocale = match.language || match.lang || preferredLocales[0];
          console.log(`[speechService] Found native TTS voice: "${match.name || 'Default'}" (${matchedLocale}) for language "${targetLang}"`);
          return {
            locale: matchedLocale,
            name: match.name || match.identifier,
            hasNativeVoice: true,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[speechService] Voice detection exception:', err);
  }

  const fallbackLocale = targetLang === 'marathi' || targetLang === 'hindi' ? 'hi-IN' : 'en-IN';
  console.log(`[speechService] No native TTS voice installed for "${targetLang}". Audio will be silently skipped.`);
  return {
    locale: fallbackLocale,
    hasNativeVoice: false,
  };
};

/**
 * Stops any currently playing or in-flight speech audio immediately.
 */
export const stopSpeech = (): void => {
  _speechSessionId++;
  try {
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    console.warn('[speechService] Error stopping speech:', error);
  }
};

/**
 * Speaks a single letter/symbol aloud using dataset spoken text, native voice, or phonetic fallback.
 */
export const speakLetter = async (
  letter: string,
  cachedAudioUrl?: string | null,
): Promise<PlaybackResult> => {
  stopSpeech();
  const sessionForThisCall = _speechSessionId;

  try {
    let lang: 'english' | 'hindi' | 'marathi' = 'english';
    try {
      const { LanguageManager } = require('../language/LanguageManager');
      lang = LanguageManager.getLanguage();
    } catch {
      lang = 'english';
    }

    const voiceInfo = await getVoiceForLanguage(lang);

    if (_speechSessionId !== sessionForThisCall) {
      return { success: false, source: 'local_tts_fallback', error: 'Cancelled' };
    }

    // If no native voice exists for Devanagari languages, fail gracefully and silently.
    // Do NOT attempt phonetic transliteration — an incorrect pronunciation is worse
    // than no audio for a language-learning app.
    if (!voiceInfo.hasNativeVoice && lang !== 'english') {
      console.log(`[speechService] No native voice for "${lang}". Skipping audio for "${letter}" — visual content only.`);
      return { success: true, source: 'local_tts_fallback' };
    }

    let spokenText = letter;
    try {
      const { getDataset } = require('../screens/games/AlphabetMatching/datasets');
      const dataset = getDataset();
      if (dataset && typeof dataset.getSpokenText === 'function') {
        spokenText = dataset.getSpokenText(letter);
      } else {
        spokenText = NUMBER_WORDS[letter] || letter.toUpperCase();
      }
    } catch {
      spokenText = NUMBER_WORDS[letter] || letter.toUpperCase();
    }

    console.log(`[speechService] Dispatching speakLetter: Symbol="${letter}" | Text="${spokenText}" | Lang="${lang}" | Locale="${voiceInfo.locale}" | Voice="${voiceInfo.name || 'Default'}"`);

    return new Promise<PlaybackResult>((resolve) => {
      if (_speechSessionId !== sessionForThisCall) {
        console.log('[speechService] Cancelled by newer speech request.');
        resolve({ success: false, source: 'local_tts_fallback', error: 'Cancelled' });
        return;
      }

      const options: Speech.SpeechOptions = {
        language: voiceInfo.locale,
        pitch: 1.1,
        rate: 0.55,
        onDone: () => {
          console.log(`[speechService] Audio playback DONE for "${spokenText}"`);
          resolve({ success: true, source: 'local_tts_fallback' });
        },
        onError: (error) => {
          console.warn(`[speechService] Audio playback ERROR for "${spokenText}":`, error);
          resolve({ success: false, source: 'local_tts_fallback', error: String(error) });
        },
      };

      if (voiceInfo.name && voiceInfo.hasNativeVoice) {
        options.voice = voiceInfo.name;
      }

      Speech.speak(spokenText, options);
    });
  } catch (error) {
    console.warn('[speechService] speakLetter exception:', error);
    return { success: false, source: 'local_tts_fallback', error: String(error) };
  }
};

/**
 * Speaks a custom teaching or praise phrase using locale-aware voice dispatches.
 */
export const speakPhrase = async (
  phrase: string,
  options?: { cancelPrevious?: boolean }
): Promise<PlaybackResult> => {
  const shouldCancel = options?.cancelPrevious ?? true;
  if (shouldCancel) {
    stopSpeech();
  }
  const sessionForThisCall = _speechSessionId;

  try {
    let lang: 'english' | 'hindi' | 'marathi' = 'english';
    try {
      const { LanguageManager } = require('../language/LanguageManager');
      lang = LanguageManager.getLanguage();
    } catch {
      lang = 'english';
    }

    const voiceInfo = await getVoiceForLanguage(lang);

    if (_speechSessionId !== sessionForThisCall) {
      return { success: false, source: 'local_tts_fallback', error: 'Cancelled' };
    }

    // If no native voice exists for Devanagari languages, fail gracefully and silently.
    if (!voiceInfo.hasNativeVoice && lang !== 'english') {
      console.log(`[speechService] No native voice for "${lang}". Skipping phrase "${phrase}" — visual content only.`);
      return { success: true, source: 'local_tts_fallback' };
    }

    console.log(`[speechService] Dispatching speakPhrase: Phrase="${phrase}" | Lang="${lang}" | Locale="${voiceInfo.locale}" | Voice="${voiceInfo.name || 'Default'}"`);

    return new Promise<PlaybackResult>((resolve) => {
      if (_speechSessionId !== sessionForThisCall) {
        resolve({ success: false, source: 'local_tts_fallback', error: 'Cancelled' });
        return;
      }

      const options: Speech.SpeechOptions = {
        language: voiceInfo.locale,
        pitch: 1.15,
        rate: 0.65,
        onDone: () => {
          console.log(`[speechService] Phrase playback DONE: "${phrase}"`);
          resolve({ success: true, source: 'local_tts_fallback' });
        },
        onError: (error) => {
          console.warn(`[speechService] Phrase playback ERROR for "${phrase}":`, error);
          resolve({ success: false, source: 'local_tts_fallback', error: String(error) });
        },
      };

      if (voiceInfo.name && voiceInfo.hasNativeVoice) {
        options.voice = voiceInfo.name;
      }

      Speech.speak(phrase, options);
    });
  } catch (error) {
    console.error('[speechService] speakPhrase exception:', error);
    return { success: false, source: 'local_tts_fallback', error: String(error) };
  }
};

export const isSpeaking = async (): Promise<boolean> => {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
};

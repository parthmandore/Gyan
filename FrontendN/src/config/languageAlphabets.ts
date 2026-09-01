/**
 * Purpose: Central Language Alphabets Configuration mapping language codes to letter pools and confusable pairs.
 * Module: Config
 * Folder: frontend/src/config
 */

import type { AppLanguage } from '../state/appLanguageStore';

export interface LanguageAlphabetConfig {
  code: AppLanguage;
  name: string;
  nativeName: string;
  capitalLetters: readonly string[];
  smallLetters: readonly string[];
  numbers: readonly string[];
  swar?: readonly string[];
  vyanjan?: readonly string[];
  barakhadi?: readonly string[];
  confusableMap: Record<string, string>;
}

export const LANGUAGE_ALPHABETS: Record<AppLanguage, LanguageAlphabetConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    capitalLetters: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ],
    smallLetters: [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    ],
    numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    confusableMap: {
      b: 'd', d: 'b',
      p: 'q', q: 'p',
      m: 'w', w: 'm',
      n: 'u', u: 'n',
      B: 'D', D: 'B',
      P: 'Q', Q: 'P',
      M: 'W', W: 'M',
      N: 'U', U: 'N',
    },
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    capitalLetters: [
      'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ',
    ],
    smallLetters: [
      'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ',
    ],
    numbers: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
    swar: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'],
    vyanjan: [
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ',
    ],
    confusableMap: {
      'ब': 'व', 'व': 'ब',
      'घ': 'ध', 'ध': 'घ',
      'म': 'भ', 'भ': 'म',
      'र': 'स', 'स': 'र',
    },
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    capitalLetters: [
      'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह', 'ळ', 'क्ष', 'ज्ञ',
    ],
    smallLetters: [
      'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह', 'ळ', 'क्ष', 'ज्ञ',
    ],
    numbers: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
    swar: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'],
    vyanjan: [
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह', 'ळ', 'क्ष', 'ज्ञ',
    ],
    barakhadi: ['क', 'का', 'कि', 'की', 'कु', 'कू', 'के', 'कै', 'को', 'कौ', 'कं', 'कः'],
    confusableMap: {
      'ब': 'व', 'व': 'ब',
      'घ': 'ध', 'ध': 'घ',
      'म': 'भ', 'भ': 'म',
      'ल': 'ळ', 'ळ': 'ल',
    },
  },
};

export const getAlphabetConfig = (lang?: AppLanguage | null): LanguageAlphabetConfig => {
  const activeLang = lang || 'en';
  return LANGUAGE_ALPHABETS[activeLang] || LANGUAGE_ALPHABETS.en;
};

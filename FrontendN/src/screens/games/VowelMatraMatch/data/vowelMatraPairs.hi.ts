/**
 * Purpose: Vowel-Matra dataset for Hindi using 'क' as the fixed reference consonant.
 * Module: Vowel Matra Match — Data
 * Folder: frontend/src/screens/games/VowelMatraMatch/data
 *
 * STARTING HYPOTHESIS: Requires literacy-background confirmation prior to production release.
 */

export interface VowelMatraPair {
  vowel: string;       // Independent vowel form (e.g. 'आ')
  matraForm: string;   // Consonant + Matra combined form (e.g. 'का')
  vowelName: string;   // Spoken name / phoneme label
  matraName: string;   // Matra sign description
}

export const HINDI_VOWEL_MATRA_PAIRS: readonly VowelMatraPair[] = [
  { vowel: 'अ', matraForm: 'क',  vowelName: 'अ', matraName: 'मुक्ता (अ)' }, // Inherent "a" sound (no matra sign)
  { vowel: 'आ', matraForm: 'का', vowelName: 'आ', matraName: 'आ ची मात्रा (ा)' },
  { vowel: 'इ', matraForm: 'कि', vowelName: 'इ', matraName: 'इ ची मात्रा (ि)' },
  { vowel: 'ई', matraForm: 'की', vowelName: 'ई', matraName: 'ई ची मात्रा (ी)' },
  { vowel: 'उ', matraForm: 'कु', vowelName: 'उ', matraName: 'उ ची मात्रा (ु)' },
  { vowel: 'ऊ', matraForm: 'कू', vowelName: 'ऊ', matraName: 'ऊ ची मात्रा (ू)' },
  { vowel: 'ऋ', matraForm: 'कृ', vowelName: 'ऋ', matraName: 'ऋ ची मात्रा (ृ)' },
  { vowel: 'ए', matraForm: 'के', vowelName: 'ए', matraName: 'ए ची मात्रा (े)' },
  { vowel: 'ऐ', matraForm: 'कै', vowelName: 'ऐ', matraName: 'ऐ ची मात्रा (ै)' },
  { vowel: 'ओ', matraForm: 'को', vowelName: 'ओ', matraName: 'ओ ची मात्रा (ो)' },
  { vowel: 'औ', matraForm: 'कौ', vowelName: 'औ', matraName: 'औ ची मात्रा (ौ)' },
] as const;

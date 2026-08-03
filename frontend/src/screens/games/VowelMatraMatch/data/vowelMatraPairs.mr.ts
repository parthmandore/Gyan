/**
 * Purpose: Vowel-Matra dataset for Marathi using 'क' as the fixed reference consonant.
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

export const MARATHI_VOWEL_MATRA_PAIRS: readonly VowelMatraPair[] = [
  { vowel: 'अ', matraForm: 'क',  vowelName: 'अ', matraName: 'अकार (अ)' }, // Inherent "a" sound (no matra sign)
  { vowel: 'आ', matraForm: 'का', vowelName: 'आ', matraName: 'आकार (ा)' },
  { vowel: 'इ', matraForm: 'कि', vowelName: 'इ', matraName: 'इकार (ि)' },
  { vowel: 'ई', matraForm: 'की', vowelName: 'ई', matraName: 'ईकार (ी)' },
  { vowel: 'उ', matraForm: 'कु', vowelName: 'उ', matraName: 'उकार (ु)' },
  { vowel: 'ऊ', matraForm: 'कू', vowelName: 'ऊ', matraName: 'ऊकार (ू)' },
  { vowel: 'ऋ', matraForm: 'कृ', vowelName: 'ऋ', matraName: 'ऋकार (ृ)' },
  { vowel: 'ए', matraForm: 'के', vowelName: 'ए', matraName: 'एकार (े)' },
  { vowel: 'ऐ', matraForm: 'कै', vowelName: 'ऐ', matraName: 'ऐकार (ै)' },
  { vowel: 'ओ', matraForm: 'को', vowelName: 'ओ', matraName: 'ओकार (ो)' },
  { vowel: 'औ', matraForm: 'कौ', vowelName: 'औ', matraName: 'औकार (ौ)' },
] as const;

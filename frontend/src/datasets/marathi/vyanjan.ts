/**
 * Purpose: Marathi Vyanjan (व्यंजन / Consonants) dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/marathi
 */

import { MarathiDatasetItem } from './types';

const MARATHI_VYANJAN_SYMBOLS = [
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह', 'ळ', 'क्ष', 'ज्ञ',
];

const MARATHI_VYANJAN_CONFUSABLE_MAP: Record<string, string> = {
  'ख': 'ग', 'ग': 'घ', 'ट': 'ठ', 'ड': 'ढ', 'त': 'थ', 'द': 'ध', 'प': 'फ', 'ब': 'भ', 'श': 'ष', 'ळ': 'ल',
};

export const MarathiVyanjanDataset: MarathiDatasetItem = {
  id: 'small',
  title: 'व्यंजन',
  subtitle: 'क ते ज्ञ शिका',
  icon: '🔠',
  bgColor: '#72C240',
  bevelColor: '#4A941C',
  symbols: MARATHI_VYANJAN_SYMBOLS,
  confusableMap: MARATHI_VYANJAN_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => symbol,
  getTeachingText: (symbol: string) => `हे अक्षर ${symbol} आहे`,
};

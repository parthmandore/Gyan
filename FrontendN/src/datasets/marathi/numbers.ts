/**
 * Purpose: Marathi Numbers (संख्या / ०-९) dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/marathi
 */

import { MarathiDatasetItem } from './types';

const MARATHI_NUMBER_SYMBOLS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

const MARATHI_NUMBER_WORDS: Record<string, string> = {
  '०': 'शून्य',
  '१': 'एक',
  '२': 'दोन',
  '३': 'तीन',
  '४': 'चार',
  '५': 'पाच',
  '६': 'सहा',
  '७': 'सात',
  '८': 'आठ',
  '९': 'नऊ',
};

const MARATHI_NUMBER_CONFUSABLE_MAP: Record<string, string> = {
  '१': '७', '७': '१', '२': '३', '३': '२', '६': '९', '९': '६',
};

export const MarathiNumbersDataset: MarathiDatasetItem = {
  id: 'numbers',
  title: 'संख्या',
  subtitle: '० ते ९ अंक शिका',
  icon: '🔢',
  bgColor: '#9D3597',
  bevelColor: '#6D1567',
  symbols: MARATHI_NUMBER_SYMBOLS,
  confusableMap: MARATHI_NUMBER_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => MARATHI_NUMBER_WORDS[symbol] || symbol,
  getTeachingText: (symbol: string) => `ही ${symbol} संख्या आहे`,
};

/**
 * Purpose: Hindi Numbers (संख्याएं / ०-९) dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/hindi
 */

import { HindiDatasetItem } from './types';

const HINDI_NUMBER_SYMBOLS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

const HINDI_NUMBER_WORDS: Record<string, string> = {
  '०': 'शून्य',
  '१': 'एक',
  '२': 'दो',
  '३': 'तीन',
  '४': 'चार',
  '५': 'पाँच',
  '६': 'छह',
  '७': 'सात',
  '८': 'आठ',
  '९': 'नौ',
};

const HINDI_NUMBER_CONFUSABLE_MAP: Record<string, string> = {
  '१': '७', '७': '१', '२': '३', '३': '२', '६': '९', '९': '६',
};

export const HindiNumbersDataset: HindiDatasetItem = {
  id: 'numbers',
  title: 'संख्याएं',
  subtitle: '० से ९ तक सीखें',
  icon: '🔢',
  bgColor: '#9D3597',
  bevelColor: '#6D1567',
  symbols: HINDI_NUMBER_SYMBOLS,
  confusableMap: HINDI_NUMBER_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => HINDI_NUMBER_WORDS[symbol] || symbol,
  getTeachingText: (symbol: string) => `यह संख्या ${symbol} है`,
};

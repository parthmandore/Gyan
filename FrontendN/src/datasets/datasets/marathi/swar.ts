/**
 * Purpose: Marathi Swar (स्वर / Vowels) dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/marathi
 */

import { MarathiDatasetItem } from './types';

const MARATHI_SWAR_SYMBOLS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'];

const MARATHI_SWAR_CONFUSABLE_MAP: Record<string, string> = {
  'इ': 'ई', 'ई': 'इ', 'उ': 'ऊ', 'ऊ': 'उ', 'ए': 'ऐ', 'ऐ': 'ए', 'ओ': 'औ', 'औ': 'ओ',
};

export const MarathiSwarDataset: MarathiDatasetItem = {
  id: 'capital',
  title: 'स्वर',
  subtitle: 'अ ते अः शिका',
  icon: '🔤',
  bgColor: '#EE7A38',
  bevelColor: '#C45012',
  symbols: MARATHI_SWAR_SYMBOLS,
  confusableMap: MARATHI_SWAR_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => symbol,
  getTeachingText: (symbol: string) => `हे ${symbol} आहे`,
};

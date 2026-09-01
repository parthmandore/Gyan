/**
 * Purpose: Hindi Swar (Vowels / स्वर) dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/hindi
 */

import { HindiDatasetItem } from './types';

const SWAR_SYMBOLS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'];

const SWAR_CONFUSABLE_MAP: Record<string, string> = {
  'इ': 'ई', 'ई': 'इ', 'उ': 'ऊ', 'ऊ': 'उ', 'ए': 'ऐ', 'ऐ': 'ए', 'ओ': 'औ', 'औ': 'ओ',
};

export const SwarDataset: HindiDatasetItem = {
  id: 'capital',
  title: 'स्वर',
  subtitle: 'अ से अः तक सीखें',
  icon: '🔤',
  bgColor: '#EE7A38',
  bevelColor: '#C45012',
  symbols: SWAR_SYMBOLS,
  confusableMap: SWAR_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => symbol,
  getTeachingText: (symbol: string) => `यह ${symbol} है`,
};

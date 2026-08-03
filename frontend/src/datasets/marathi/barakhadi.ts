/**
 * Purpose: Marathi Barakhadi (बाराखडी) dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/marathi
 */

import { MarathiDatasetItem } from './types';

const BARAKHADI_SYMBOLS = ['क', 'का', 'कि', 'की', 'कु', 'कू', 'के', 'कै', 'को', 'कौ', 'कं', 'कः'];

const BARAKHADI_CONFUSABLE_MAP: Record<string, string> = {
  'कि': 'की', 'की': 'कि', 'कु': 'कू', 'कू': 'कु', 'के': 'कै', 'कै': 'के', 'को': 'कौ', 'कौ': 'को',
};

export const BarakhadiDataset: MarathiDatasetItem = {
  id: 'barakhadi',
  title: 'बाराखडी',
  subtitle: 'क ते कः मात्रा शिका',
  icon: '✍️',
  bgColor: '#2563EB',
  bevelColor: '#1D4ED8',
  symbols: BARAKHADI_SYMBOLS,
  confusableMap: BARAKHADI_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => symbol,
  getTeachingText: (symbol: string) => `ही बाराखडीतील ${symbol} मात्रा आहे`,
};

/**
 * Purpose: Hindi Vyanjan (Consonants / व्यंजन) dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/hindi
 */

import { HindiDatasetItem } from './types';

const VYANJAN_SYMBOLS = [
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह',
];

const VYANJAN_CONFUSABLE_MAP: Record<string, string> = {
  'ख': 'ग', 'ग': 'घ', 'ट': 'ठ', 'ड': 'ढ', 'त': 'थ', 'द': 'ध', 'प': 'फ', 'ब': 'भ', 'श': 'ष',
};

export const VyanjanDataset: HindiDatasetItem = {
  id: 'small',
  title: 'व्यंजन',
  subtitle: 'क से ह तक सीखें',
  icon: '🔠',
  bgColor: '#72C240',
  bevelColor: '#4A941C',
  symbols: VYANJAN_SYMBOLS,
  confusableMap: VYANJAN_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => symbol,
  getTeachingText: (symbol: string) => `यह ${symbol} है`,
};

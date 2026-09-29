/**
 * Purpose: English Small Letters dataset implementation.
 * Module: Datasets
 * Folder: frontend/src/datasets/english
 */

import { EnglishDatasetItem } from './types';

const SMALL_SYMBOLS = 'abcdefghijklmnopqrstuvwxyz'.split('');

const SMALL_PHONETIC_NAMES: Record<string, string> = {
  a: 'Ay', b: 'Bee', c: 'See', d: 'Dee', e: 'Eee',
  f: 'Eff', g: 'Jee', h: 'Aitch', i: 'Eye', j: 'Jay',
  k: 'Kay', l: 'Ell', m: 'Emm', n: 'Enn', o: 'Oh',
  p: 'Pee', q: 'Queue', r: 'Aar', s: 'Ess', t: 'Tee',
  u: 'You', v: 'Vee', w: 'Double You', x: 'Ex', y: 'Why',
  z: 'Zed',
};

const SMALL_CONFUSABLE_MAP: Record<string, string> = {
  b: 'd', d: 'b', p: 'q', q: 'p', m: 'w', w: 'm', n: 'u', u: 'n', o: 'q',
};

export const SmallDataset: EnglishDatasetItem = {
  id: 'small',
  title: 'Small Letters',
  subtitle: 'Find the small letters',
  icon: '🔡',
  bgColor: '#72C240',
  bevelColor: '#4A941C',
  symbols: SMALL_SYMBOLS,
  confusableMap: SMALL_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => SMALL_PHONETIC_NAMES[symbol.toLowerCase()] || symbol,
  getTeachingText: (symbol: string) => `This is the letter ${symbol}`,
};

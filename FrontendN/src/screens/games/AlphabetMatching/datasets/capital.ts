/**
 * Purpose: Capital Letters dataset implementation for Alphabet Matching.
 * Module: Alphabet Matching Datasets
 * Folder: frontend/src/screens/games/AlphabetMatching/datasets
 */

import { GameDataset } from './types';

const CAPITAL_SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CAPITAL_PHONETIC_NAMES: Record<string, string> = {
  A: 'Ay', B: 'Bee', C: 'See', D: 'Dee', E: 'Ee',
  F: 'Eff', G: 'Jee', H: 'Aitch', I: 'Eye', J: 'Jay',
  K: 'Kay', L: 'Ell', M: 'Em', N: 'En', O: 'Oh',
  P: 'Pee', Q: 'Queue', R: 'Aar', S: 'Ess', T: 'Tee',
  U: 'You', V: 'Vee', W: 'Double You', X: 'Ex', Y: 'Why',
  Z: 'Zed',
};

const CAPITAL_CONFUSABLE_MAP: Record<string, string> = {
  B: 'D', D: 'B', P: 'Q', Q: 'P', M: 'W', W: 'M', N: 'U', U: 'N', O: 'Q',
};

export const CapitalDataset: GameDataset = {
  id: 'capital',
  title: 'Capital Letters',
  subtitle: 'Find the big letters',
  icon: '🔠',
  bgColor: '#EE7A38',
  bevelColor: '#C45012',
  symbols: CAPITAL_SYMBOLS,
  confusableMap: CAPITAL_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => CAPITAL_PHONETIC_NAMES[symbol.toUpperCase()] || symbol,
  getTeachingText: (symbol: string) => `This is the letter ${symbol.toUpperCase()}`,
};

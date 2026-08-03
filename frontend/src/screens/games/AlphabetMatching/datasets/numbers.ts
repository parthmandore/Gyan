/**
 * Purpose: Numbers dataset implementation for Alphabet Matching.
 * Module: Alphabet Matching Datasets
 * Folder: frontend/src/screens/games/AlphabetMatching/datasets
 */

import { GameDataset } from './types';

const NUMBER_SYMBOLS = '0123456789'.split('');

const NUMBER_WORDS: Record<string, string> = {
  '0': 'Zero',
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
};

const NUMBER_CONFUSABLE_MAP: Record<string, string> = {
  '6': '9', '9': '6', '1': '7', '7': '1', '3': '8', '8': '3',
};

export const NumbersDataset: GameDataset = {
  id: 'numbers',
  title: 'Numbers',
  subtitle: 'Find the numbers',
  icon: '🔢',
  bgColor: '#9D3597',
  bevelColor: '#6D1567',
  symbols: NUMBER_SYMBOLS,
  confusableMap: NUMBER_CONFUSABLE_MAP,
  getSpokenText: (symbol: string) => NUMBER_WORDS[symbol] || symbol,
  getTeachingText: (symbol: string) => `This is number ${symbol}`,
};

/**
 * Purpose: Central dataset registry and lookup helpers for dataset-driven game engine.
 * Module: Alphabet Matching Datasets
 * Folder: frontend/src/screens/games/AlphabetMatching/datasets
 */

import { GameMode } from '../types';
import { GameDataset } from './types';
import { CapitalDataset } from './capital';
import { SmallDataset } from './small';
import { NumbersDataset } from './numbers';
import { HINDI_DATASETS } from '../../../../datasets/hindi';
import { MARATHI_DATASETS } from '../../../../datasets/marathi';

export * from './types';
export * from './capital';
export * from './small';
export * from './numbers';

/**
 * Dynamically retrieves all available datasets for the current learning language.
 */
export const getLanguageDatasets = (): GameDataset[] => {
  try {
    const { LanguageManager } = require('../../../../language/LanguageManager');
    const lang = LanguageManager.getLanguage();
    if (lang === 'hindi') {
      return HINDI_DATASETS as unknown as GameDataset[];
    }
    if (lang === 'marathi') {
      return MARATHI_DATASETS as unknown as GameDataset[];
    }
  } catch {
    // Node environment fallback
  }
  return [CapitalDataset, SmallDataset, NumbersDataset];
};

/**
 * Retrieves the active GameDataset for a given mode and current learning language.
 */
export const getDataset = (mode?: GameMode): GameDataset => {
  const datasets = getLanguageDatasets();
  const targetMode = mode || 'capital';
  const found = datasets.find((d) => d.id === targetMode);
  if (found) return found;
  return datasets[0] || CapitalDataset;
};

/** Backwards-compatibility dynamic proxy for static imports */
export const ALL_DATASETS: GameDataset[] = new Proxy([], {
  get(_target, prop) {
    const list = getLanguageDatasets();
    if (prop === 'map') return list.map.bind(list);
    if (prop === 'length') return list.length;
    if (prop === 'forEach') return list.forEach.bind(list);
    if (prop === Symbol.iterator) return list[Symbol.iterator].bind(list);
    const index = Number(prop);
    if (!isNaN(index)) return list[index];
    return (list as any)[prop];
  },
});

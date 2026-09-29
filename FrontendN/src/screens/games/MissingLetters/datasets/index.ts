/**
 * Purpose: Export language datasets for Missing Letters.
 * Module: Missing Letters — Datasets Index
 * Folder: frontend/src/screens/games/MissingLetters/datasets
 */

import { EN_SEQUENCES } from './enSequences';
import { HI_SEQUENCES } from './hiSequences';
import { MR_SEQUENCES } from './mrSequences';
import { SequenceItem } from '../types';

export { EN_SEQUENCES, HI_SEQUENCES, MR_SEQUENCES };

export const getDatasetForLanguage = (language: string): SequenceItem[] => {
  switch (language) {
    case 'hi':
      return HI_SEQUENCES;
    case 'mr':
      return MR_SEQUENCES;
    case 'en':
    default:
      return EN_SEQUENCES;
  }
};

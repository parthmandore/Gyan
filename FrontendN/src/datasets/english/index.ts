/**
 * Purpose: English datasets entry point referencing registered datasets.
 * Module: Datasets
 * Folder: frontend/src/datasets/english
 */

import { CapitalDataset } from './capital';
import { SmallDataset } from './small';
import { NumbersDataset } from './numbers';
import { EnglishDatasetItem } from './types';

export * from './types';
export * from './capital';
export * from './small';
export * from './numbers';

export const ENGLISH_DATASETS: EnglishDatasetItem[] = [
  CapitalDataset,
  SmallDataset,
  NumbersDataset,
];

export default ENGLISH_DATASETS;

/**
 * Purpose: Hindi datasets entry point registering Swar, Vyanjan, and Numbers.
 * Module: Datasets
 * Folder: frontend/src/datasets/hindi
 */

import { SwarDataset } from './swar';
import { VyanjanDataset } from './vyanjan';
import { HindiNumbersDataset } from './numbers';
import { HindiDatasetItem } from './types';

export * from './types';
export * from './swar';
export * from './vyanjan';
export * from './numbers';

export const HINDI_DATASETS: HindiDatasetItem[] = [
  SwarDataset,
  VyanjanDataset,
  HindiNumbersDataset,
];

export default HINDI_DATASETS;

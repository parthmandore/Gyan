/**
 * Purpose: Marathi datasets entry point registering Swar, Vyanjan, Barakhadi, and Numbers.
 * Module: Datasets
 * Folder: frontend/src/datasets/marathi
 */

import { MarathiSwarDataset } from './swar';
import { MarathiVyanjanDataset } from './vyanjan';
import { BarakhadiDataset } from './barakhadi';
import { MarathiNumbersDataset } from './numbers';
import { MarathiDatasetItem } from './types';

export * from './types';
export * from './swar';
export * from './vyanjan';
export * from './barakhadi';
export * from './numbers';

export const MARATHI_DATASETS: MarathiDatasetItem[] = [
  MarathiSwarDataset,
  MarathiVyanjanDataset,
  BarakhadiDataset,
  MarathiNumbersDataset,
];

export default MARATHI_DATASETS;

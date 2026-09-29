/**
 * Purpose: Dataset interface for Marathi learning datasets.
 * Module: Datasets
 * Folder: frontend/src/datasets/marathi
 */

export interface MarathiDatasetItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  bevelColor: string;
  symbols: string[];
  confusableMap?: Record<string, string>;
  getSpokenText: (symbol: string) => string;
  getTeachingText: (symbol: string) => string;
}

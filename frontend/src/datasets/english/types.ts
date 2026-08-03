/**
 * Purpose: Dataset interface for English learning datasets.
 * Module: Datasets
 * Folder: frontend/src/datasets/english
 */

export interface EnglishDatasetItem {
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

/**
 * Purpose: Dataset interface for Hindi learning datasets.
 * Module: Datasets
 * Folder: frontend/src/datasets/hindi
 */

export interface HindiDatasetItem {
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

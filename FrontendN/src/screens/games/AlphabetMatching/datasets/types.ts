/**
 * Purpose: Dataset interface for dataset-driven game engine architecture.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching/datasets
 */

import { GameMode } from '../types';

export interface GameDataset {
  /** Unique dataset / mode identifier */
  id: GameMode;
  /** Human-readable title for mode selection card */
  title: string;
  /** Human-readable subtitle for mode selection card */
  subtitle: string;
  /** Display emoji icon for mode selection card */
  icon: string;
  /** Card background color */
  bgColor: string;
  /** Card 3D bevel rim color */
  bevelColor: string;
  /** List of symbols for game rounds */
  symbols: string[];
  /** Optional confusable symbol pairings for difficulty scaling */
  confusableMap?: Record<string, string>;
  /** Audio text label for speech pronunciation (e.g. '0' -> 'Zero') */
  getSpokenText: (symbol: string) => string;
  /** Text description for instruction/teaching popups (e.g. 'This is the letter A' or 'This is number 7') */
  getTeachingText: (symbol: string) => string;
}

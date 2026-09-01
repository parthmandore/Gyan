/**
 * Purpose: Complete A↔a through Z↔z letter-case pair dataset for English.
 * Module: Capital Small Match — Data
 * Folder: frontend/src/screens/games/CapitalSmallMatch/data
 *
 * This dataset is the single source of truth for all 26 English letter-case
 * pairs consumed by roundGenerator.ts. It is intentionally separated from
 * game logic so future languages can provide their own pair datasets
 * through the same interface.
 */

import { LetterCasePair } from '../types';

export const ENGLISH_LETTER_CASE_PAIRS: readonly LetterCasePair[] = [
  { capital: 'A', lowercase: 'a' },
  { capital: 'B', lowercase: 'b' },
  { capital: 'C', lowercase: 'c' },
  { capital: 'D', lowercase: 'd' },
  { capital: 'E', lowercase: 'e' },
  { capital: 'F', lowercase: 'f' },
  { capital: 'G', lowercase: 'g' },
  { capital: 'H', lowercase: 'h' },
  { capital: 'I', lowercase: 'i' },
  { capital: 'J', lowercase: 'j' },
  { capital: 'K', lowercase: 'k' },
  { capital: 'L', lowercase: 'l' },
  { capital: 'M', lowercase: 'm' },
  { capital: 'N', lowercase: 'n' },
  { capital: 'O', lowercase: 'o' },
  { capital: 'P', lowercase: 'p' },
  { capital: 'Q', lowercase: 'q' },
  { capital: 'R', lowercase: 'r' },
  { capital: 'S', lowercase: 's' },
  { capital: 'T', lowercase: 't' },
  { capital: 'U', lowercase: 'u' },
  { capital: 'V', lowercase: 'v' },
  { capital: 'W', lowercase: 'w' },
  { capital: 'X', lowercase: 'x' },
  { capital: 'Y', lowercase: 'y' },
  { capital: 'Z', lowercase: 'z' },
] as const;

/**
 * Purpose: Hindi Devanagari letter tracing dataset with normalized reference stroke coordinates [0, 100] x [0, 100].
 * Module: Letter Tracing — Data
 * Folder: frontend/src/screens/games/LetterTracing/data
 */

import { LetterItem } from '../types';

export const HI_LETTERS: LetterItem[] = [
  {
    id: 'hi_a',
    char: 'अ',
    displayChar: 'अ',
    name: 'अ (a)',
    phoneticHint: 'uh',
    language: 'hi',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 30, y: 26 },
        endPoint: { x: 45, y: 46 },
        points: [{ x: 30, y: 26 }, { x: 48, y: 26 }, { x: 45, y: 46 }],
      },
      {
        startPoint: { x: 45, y: 46 },
        endPoint: { x: 26, y: 76 },
        points: [{ x: 45, y: 46 }, { x: 52, y: 65 }, { x: 26, y: 76 }],
      },
      {
        startPoint: { x: 45, y: 46 },
        endPoint: { x: 65, y: 46 },
        points: [{ x: 45, y: 46 }, { x: 55, y: 46 }, { x: 65, y: 46 }],
      },
      {
        startPoint: { x: 65, y: 18 },
        endPoint: { x: 65, y: 82 },
        points: [{ x: 65, y: 18 }, { x: 65, y: 50 }, { x: 65, y: 82 }],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 30, y: 26 },
      { x: 45, y: 46 },
      { x: 26, y: 76 },
      { x: 65, y: 18 },
      { x: 65, y: 82 },
    ],
  },
  {
    id: 'hi_aa',
    char: 'आ',
    displayChar: 'आ',
    name: 'आ (aa)',
    phoneticHint: 'aah',
    language: 'hi',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 18, y: 18 },
        endPoint: { x: 86, y: 18 },
        points: [{ x: 18, y: 18 }, { x: 52, y: 18 }, { x: 86, y: 18 }],
      },
      {
        startPoint: { x: 26, y: 26 },
        endPoint: { x: 42, y: 46 },
        points: [{ x: 26, y: 26 }, { x: 44, y: 26 }, { x: 42, y: 46 }],
      },
      {
        startPoint: { x: 42, y: 46 },
        endPoint: { x: 24, y: 76 },
        points: [{ x: 42, y: 46 }, { x: 48, y: 65 }, { x: 24, y: 76 }],
      },
      {
        startPoint: { x: 42, y: 46 },
        endPoint: { x: 58, y: 46 },
        points: [{ x: 42, y: 46 }, { x: 50, y: 46 }, { x: 58, y: 46 }],
      },
      {
        startPoint: { x: 58, y: 18 },
        endPoint: { x: 58, y: 82 },
        points: [{ x: 58, y: 18 }, { x: 58, y: 50 }, { x: 58, y: 82 }],
      },
      {
        startPoint: { x: 76, y: 18 },
        endPoint: { x: 76, y: 82 },
        points: [{ x: 76, y: 18 }, { x: 76, y: 50 }, { x: 76, y: 82 }],
      },
    ],
    anchorPoints: [
      { x: 18, y: 18 },
      { x: 86, y: 18 },
      { x: 26, y: 26 },
      { x: 42, y: 46 },
      { x: 24, y: 76 },
      { x: 58, y: 82 },
      { x: 76, y: 82 },
    ],
  },
  {
    id: 'hi_i',
    char: 'इ',
    displayChar: 'इ',
    name: 'इ (i)',
    phoneticHint: 'ee',
    language: 'hi',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 24, y: 18 },
        endPoint: { x: 76, y: 18 },
        points: [{ x: 24, y: 18 }, { x: 50, y: 18 }, { x: 76, y: 18 }],
      },
      {
        startPoint: { x: 50, y: 18 },
        endPoint: { x: 50, y: 28 },
        points: [{ x: 50, y: 18 }, { x: 50, y: 28 }],
      },
      {
        startPoint: { x: 50, y: 28 },
        endPoint: { x: 50, y: 72 },
        points: [
          { x: 50, y: 28 },
          { x: 34, y: 35 },
          { x: 50, y: 48 },
          { x: 66, y: 60 },
          { x: 50, y: 72 },
        ],
      },
      {
        startPoint: { x: 50, y: 72 },
        endPoint: { x: 38, y: 84 },
        points: [{ x: 50, y: 72 }, { x: 42, y: 76 }, { x: 38, y: 84 }],
      },
    ],
    anchorPoints: [
      { x: 24, y: 18 },
      { x: 76, y: 18 },
      { x: 50, y: 28 },
      { x: 34, y: 35 },
      { x: 50, y: 48 },
      { x: 66, y: 60 },
      { x: 38, y: 84 },
    ],
  },
  {
    id: 'hi_ka',
    char: 'क',
    displayChar: 'क',
    name: 'क (ka)',
    phoneticHint: 'kuh',
    language: 'hi',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 50, y: 18 },
        endPoint: { x: 50, y: 82 },
        points: [{ x: 50, y: 18 }, { x: 50, y: 50 }, { x: 50, y: 82 }],
      },
      {
        startPoint: { x: 50, y: 40 },
        endPoint: { x: 50, y: 60 },
        points: [
          { x: 50, y: 40 },
          { x: 30, y: 38 },
          { x: 28, y: 56 },
          { x: 50, y: 60 },
        ],
      },
      {
        startPoint: { x: 50, y: 44 },
        endPoint: { x: 74, y: 68 },
        points: [
          { x: 50, y: 44 },
          { x: 72, y: 44 },
          { x: 74, y: 68 },
        ],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 50, y: 18 },
      { x: 50, y: 82 },
      { x: 28, y: 48 },
      { x: 74, y: 68 },
    ],
  },
  {
    id: 'hi_ga',
    char: 'ग',
    displayChar: 'ग',
    name: 'ग (ga)',
    phoneticHint: 'guh',
    language: 'hi',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 38, y: 18 },
        endPoint: { x: 42, y: 56 },
        points: [
          { x: 38, y: 18 },
          { x: 38, y: 64 },
          { x: 26, y: 64 },
          { x: 42, y: 56 },
        ],
      },
      {
        startPoint: { x: 68, y: 18 },
        endPoint: { x: 68, y: 82 },
        points: [{ x: 68, y: 18 }, { x: 68, y: 50 }, { x: 68, y: 82 }],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 38, y: 18 },
      { x: 26, y: 64 },
      { x: 68, y: 18 },
      { x: 68, y: 82 },
    ],
  },
  {
    id: 'hi_cha',
    char: 'च',
    displayChar: 'च',
    name: 'च (cha)',
    phoneticHint: 'chuh',
    language: 'hi',
    minAge: 6,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 28, y: 50 },
        endPoint: { x: 65, y: 58 },
        points: [
          { x: 28, y: 50 },
          { x: 48, y: 50 },
          { x: 42, y: 68 },
          { x: 65, y: 58 },
        ],
      },
      {
        startPoint: { x: 65, y: 18 },
        endPoint: { x: 65, y: 82 },
        points: [{ x: 65, y: 18 }, { x: 65, y: 50 }, { x: 65, y: 82 }],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 28, y: 50 },
      { x: 42, y: 68 },
      { x: 65, y: 18 },
      { x: 65, y: 82 },
    ],
  },
  {
    id: 'hi_ta',
    char: 'त',
    displayChar: 'त',
    name: 'त (ta)',
    phoneticHint: 'tuh',
    language: 'hi',
    minAge: 6,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 65, y: 18 },
        endPoint: { x: 65, y: 82 },
        points: [{ x: 65, y: 18 }, { x: 65, y: 50 }, { x: 65, y: 82 }],
      },
      {
        startPoint: { x: 65, y: 48 },
        endPoint: { x: 38, y: 80 },
        points: [
          { x: 65, y: 48 },
          { x: 42, y: 48 },
          { x: 38, y: 80 },
        ],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 65, y: 18 },
      { x: 65, y: 82 },
      { x: 42, y: 48 },
      { x: 38, y: 80 },
    ],
  },
  {
    id: 'hi_pa',
    char: 'प',
    displayChar: 'प',
    name: 'प (pa)',
    phoneticHint: 'puh',
    language: 'hi',
    minAge: 6,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 36, y: 18 },
        endPoint: { x: 65, y: 54 },
        points: [
          { x: 36, y: 18 },
          { x: 36, y: 54 },
          { x: 65, y: 54 },
        ],
      },
      {
        startPoint: { x: 65, y: 18 },
        endPoint: { x: 65, y: 82 },
        points: [{ x: 65, y: 18 }, { x: 65, y: 50 }, { x: 65, y: 82 }],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 36, y: 18 },
      { x: 36, y: 54 },
      { x: 65, y: 18 },
      { x: 65, y: 82 },
    ],
  },
  {
    id: 'hi_ma',
    char: 'म',
    displayChar: 'म',
    name: 'म (ma)',
    phoneticHint: 'muh',
    language: 'hi',
    minAge: 6,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 36, y: 18 },
        endPoint: { x: 65, y: 54 },
        points: [
          { x: 36, y: 18 },
          { x: 36, y: 64 },
          { x: 24, y: 64 },
          { x: 36, y: 54 },
          { x: 65, y: 54 },
        ],
      },
      {
        startPoint: { x: 65, y: 18 },
        endPoint: { x: 65, y: 82 },
        points: [{ x: 65, y: 18 }, { x: 65, y: 50 }, { x: 65, y: 82 }],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 36, y: 18 },
      { x: 24, y: 64 },
      { x: 65, y: 18 },
      { x: 65, y: 82 },
    ],
  },
  {
    id: 'hi_ra',
    char: 'र',
    displayChar: 'र',
    name: 'र (ra)',
    phoneticHint: 'ruh',
    language: 'hi',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 25, y: 18 },
        endPoint: { x: 75, y: 18 },
        points: [{ x: 25, y: 18 }, { x: 50, y: 18 }, { x: 75, y: 18 }],
      },
      {
        startPoint: { x: 42, y: 18 },
        endPoint: { x: 50, y: 48 },
        points: [
          { x: 42, y: 18 },
          { x: 60, y: 26 },
          { x: 50, y: 48 },
        ],
      },
      {
        startPoint: { x: 50, y: 48 },
        endPoint: { x: 34, y: 82 },
        points: [{ x: 50, y: 48 }, { x: 42, y: 65 }, { x: 34, y: 82 }],
      },
    ],
    anchorPoints: [
      { x: 25, y: 18 },
      { x: 75, y: 18 },
      { x: 42, y: 18 },
      { x: 60, y: 26 },
      { x: 50, y: 48 },
      { x: 34, y: 82 },
    ],
  },
];

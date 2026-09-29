/**
 * Purpose: English letter tracing dataset with normalized reference stroke coordinates [0, 100] x [0, 100].
 * Module: Letter Tracing — Data
 * Folder: frontend/src/screens/games/LetterTracing/data
 */

import { LetterItem } from '../types';

export const EN_LETTERS: LetterItem[] = [
  {
    id: 'en_a',
    char: 'A',
    displayChar: 'A',
    name: 'Letter A',
    phoneticHint: 'ay',
    language: 'en',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 50, y: 15 },
        endPoint: { x: 20, y: 85 },
        points: [{ x: 50, y: 15 }, { x: 35, y: 50 }, { x: 20, y: 85 }],
      },
      {
        startPoint: { x: 50, y: 15 },
        endPoint: { x: 80, y: 85 },
        points: [{ x: 50, y: 15 }, { x: 65, y: 50 }, { x: 80, y: 85 }],
      },
      {
        startPoint: { x: 32, y: 58 },
        endPoint: { x: 68, y: 58 },
        points: [{ x: 32, y: 58 }, { x: 50, y: 58 }, { x: 68, y: 58 }],
      },
    ],
    anchorPoints: [
      { x: 50, y: 15 },
      { x: 20, y: 85 },
      { x: 80, y: 85 },
      { x: 32, y: 58 },
      { x: 68, y: 58 },
    ],
  },
  {
    id: 'en_l',
    char: 'L',
    displayChar: 'L',
    name: 'Letter L',
    phoneticHint: 'el',
    language: 'en',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 30, y: 15 },
        endPoint: { x: 30, y: 85 },
        points: [{ x: 30, y: 15 }, { x: 30, y: 50 }, { x: 30, y: 85 }],
      },
      {
        startPoint: { x: 30, y: 85 },
        endPoint: { x: 75, y: 85 },
        points: [{ x: 30, y: 85 }, { x: 52, y: 85 }, { x: 75, y: 85 }],
      },
    ],
    anchorPoints: [
      { x: 30, y: 15 },
      { x: 30, y: 85 },
      { x: 75, y: 85 },
    ],
  },
  {
    id: 'en_o',
    char: 'O',
    displayChar: 'O',
    name: 'Letter O',
    phoneticHint: 'oh',
    language: 'en',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 50, y: 15 },
        endPoint: { x: 50, y: 15 },
        points: [
          { x: 50, y: 15 },
          { x: 25, y: 30 },
          { x: 20, y: 50 },
          { x: 25, y: 70 },
          { x: 50, y: 85 },
          { x: 75, y: 70 },
          { x: 80, y: 50 },
          { x: 75, y: 30 },
          { x: 50, y: 15 },
        ],
      },
    ],
    anchorPoints: [
      { x: 50, y: 15 },
      { x: 20, y: 50 },
      { x: 50, y: 85 },
      { x: 80, y: 50 },
    ],
  },
  {
    id: 'en_t',
    char: 'T',
    displayChar: 'T',
    name: 'Letter T',
    phoneticHint: 'tee',
    language: 'en',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 20, y: 18 },
        endPoint: { x: 80, y: 18 },
        points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 80, y: 18 }],
      },
      {
        startPoint: { x: 50, y: 18 },
        endPoint: { x: 50, y: 85 },
        points: [{ x: 50, y: 18 }, { x: 50, y: 52 }, { x: 50, y: 85 }],
      },
    ],
    anchorPoints: [
      { x: 20, y: 18 },
      { x: 80, y: 18 },
      { x: 50, y: 18 },
      { x: 50, y: 85 },
    ],
  },
  {
    id: 'en_c',
    char: 'C',
    displayChar: 'C',
    name: 'Letter C',
    phoneticHint: 'see',
    language: 'en',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 75, y: 25 },
        endPoint: { x: 75, y: 75 },
        points: [
          { x: 75, y: 25 },
          { x: 50, y: 15 },
          { x: 25, y: 35 },
          { x: 22, y: 50 },
          { x: 25, y: 65 },
          { x: 50, y: 85 },
          { x: 75, y: 75 },
        ],
      },
    ],
    anchorPoints: [
      { x: 75, y: 25 },
      { x: 50, y: 15 },
      { x: 22, y: 50 },
      { x: 50, y: 85 },
      { x: 75, y: 75 },
    ],
  },
  {
    id: 'en_e',
    char: 'E',
    displayChar: 'E',
    name: 'Letter E',
    phoneticHint: 'ee',
    language: 'en',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 28, y: 15 },
        endPoint: { x: 28, y: 85 },
        points: [{ x: 28, y: 15 }, { x: 28, y: 50 }, { x: 28, y: 85 }],
      },
      {
        startPoint: { x: 28, y: 15 },
        endPoint: { x: 72, y: 15 },
        points: [{ x: 28, y: 15 }, { x: 50, y: 15 }, { x: 72, y: 15 }],
      },
      {
        startPoint: { x: 28, y: 50 },
        endPoint: { x: 65, y: 50 },
        points: [{ x: 28, y: 50 }, { x: 46, y: 50 }, { x: 65, y: 50 }],
      },
      {
        startPoint: { x: 28, y: 85 },
        endPoint: { x: 75, y: 85 },
        points: [{ x: 28, y: 85 }, { x: 52, y: 85 }, { x: 75, y: 85 }],
      },
    ],
    anchorPoints: [
      { x: 28, y: 15 },
      { x: 28, y: 85 },
      { x: 72, y: 15 },
      { x: 65, y: 50 },
      { x: 75, y: 85 },
    ],
  },
  {
    id: 'en_h',
    char: 'H',
    displayChar: 'H',
    name: 'Letter H',
    phoneticHint: 'aych',
    language: 'en',
    minAge: 6,
    strokes: [
      {
        startPoint: { x: 28, y: 15 },
        endPoint: { x: 28, y: 85 },
        points: [{ x: 28, y: 15 }, { x: 28, y: 50 }, { x: 28, y: 85 }],
      },
      {
        startPoint: { x: 72, y: 15 },
        endPoint: { x: 72, y: 85 },
        points: [{ x: 72, y: 15 }, { x: 72, y: 50 }, { x: 72, y: 85 }],
      },
      {
        startPoint: { x: 28, y: 50 },
        endPoint: { x: 72, y: 50 },
        points: [{ x: 28, y: 50 }, { x: 50, y: 50 }, { x: 72, y: 50 }],
      },
    ],
    anchorPoints: [
      { x: 28, y: 15 },
      { x: 28, y: 85 },
      { x: 72, y: 15 },
      { x: 72, y: 85 },
      { x: 50, y: 50 },
    ],
  },
  {
    id: 'en_i',
    char: 'I',
    displayChar: 'I',
    name: 'Letter I',
    phoneticHint: 'eye',
    language: 'en',
    minAge: 5,
    strokes: [
      {
        startPoint: { x: 50, y: 15 },
        endPoint: { x: 50, y: 85 },
        points: [{ x: 50, y: 15 }, { x: 50, y: 50 }, { x: 50, y: 85 }],
      },
      {
        startPoint: { x: 30, y: 15 },
        endPoint: { x: 70, y: 15 },
        points: [{ x: 30, y: 15 }, { x: 50, y: 15 }, { x: 70, y: 15 }],
      },
      {
        startPoint: { x: 30, y: 85 },
        endPoint: { x: 70, y: 85 },
        points: [{ x: 30, y: 85 }, { x: 50, y: 85 }, { x: 70, y: 85 }],
      },
    ],
    anchorPoints: [
      { x: 50, y: 15 },
      { x: 50, y: 85 },
      { x: 30, y: 15 },
      { x: 70, y: 15 },
      { x: 30, y: 85 },
      { x: 70, y: 85 },
    ],
  },
  {
    id: 'en_m',
    char: 'M',
    displayChar: 'M',
    name: 'Letter M',
    phoneticHint: 'em',
    language: 'en',
    minAge: 6,
    strokes: [
      {
        startPoint: { x: 22, y: 85 },
        endPoint: { x: 22, y: 15 },
        points: [{ x: 22, y: 85 }, { x: 22, y: 50 }, { x: 22, y: 15 }],
      },
      {
        startPoint: { x: 22, y: 15 },
        endPoint: { x: 50, y: 58 },
        points: [{ x: 22, y: 15 }, { x: 36, y: 36 }, { x: 50, y: 58 }],
      },
      {
        startPoint: { x: 50, y: 58 },
        endPoint: { x: 78, y: 15 },
        points: [{ x: 50, y: 58 }, { x: 64, y: 36 }, { x: 78, y: 15 }],
      },
      {
        startPoint: { x: 78, y: 15 },
        endPoint: { x: 78, y: 85 },
        points: [{ x: 78, y: 15 }, { x: 78, y: 50 }, { x: 78, y: 85 }],
      },
    ],
    anchorPoints: [
      { x: 22, y: 85 },
      { x: 22, y: 15 },
      { x: 50, y: 58 },
      { x: 78, y: 15 },
      { x: 78, y: 85 },
    ],
  },
  {
    id: 'en_s',
    char: 'S',
    displayChar: 'S',
    name: 'Letter S',
    phoneticHint: 'ess',
    language: 'en',
    minAge: 6,
    strokes: [
      {
        startPoint: { x: 75, y: 28 },
        endPoint: { x: 25, y: 72 },
        points: [
          { x: 75, y: 28 },
          { x: 52, y: 15 },
          { x: 30, y: 28 },
          { x: 35, y: 45 },
          { x: 50, y: 52 },
          { x: 68, y: 60 },
          { x: 70, y: 75 },
          { x: 48, y: 85 },
          { x: 25, y: 72 },
        ],
      },
    ],
    anchorPoints: [
      { x: 75, y: 28 },
      { x: 52, y: 15 },
      { x: 30, y: 28 },
      { x: 50, y: 52 },
      { x: 70, y: 75 },
      { x: 48, y: 85 },
      { x: 25, y: 72 },
    ],
  },
];

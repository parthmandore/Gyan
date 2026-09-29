/**
 * Purpose: Age 6 dataset for Guess the Shape.
 *          Familiar and intermediate shapes with child-friendly color palettes
 *          and accurate multilingual names (EN, HI, MR).
 * Module: Guess the Shape — Data
 * Folder: frontend/src/screens/games/GuessTheShape/data
 */

import { ShapeDefinition } from '../types';

export const SHAPES_AGE_6: ShapeDefinition[] = [
  {
    id: 'circle',
    color: '#3B82F6',
    strokeColor: '#1D4ED8',
    names: {
      en: 'Circle',
      hi: 'वृत्त',
      mr: 'वर्तुळ',
    },
    phoneticHints: {
      en: 'sur-kuhl',
      hi: 'vritt',
      mr: 'var-tool',
    },
  },
  {
    id: 'square',
    color: '#EF4444',
    strokeColor: '#B91C1C',
    names: {
      en: 'Square',
      hi: 'वर्ग',
      mr: 'चौरस',
    },
    phoneticHints: {
      en: 'skwair',
      hi: 'varg',
      mr: 'chow-ras',
    },
  },
  {
    id: 'triangle',
    color: '#10B981',
    strokeColor: '#047857',
    names: {
      en: 'Triangle',
      hi: 'त्रिकोण',
      mr: 'त्रिकोण',
    },
    phoneticHints: {
      en: 'try-ang-guhl',
      hi: 'tree-kone',
      mr: 'tree-kone',
    },
  },
  {
    id: 'rectangle',
    color: '#F59E0B',
    strokeColor: '#B45309',
    names: {
      en: 'Rectangle',
      hi: 'आयत',
      mr: 'आयात',
    },
    phoneticHints: {
      en: 'rek-tang-guhl',
      hi: 'aa-yat',
      mr: 'aa-yaat',
    },
  },
  {
    id: 'oval',
    color: '#8B5CF6',
    strokeColor: '#6D28D9',
    names: {
      en: 'Oval',
      hi: 'अंडाकार',
      mr: 'लंबगोल',
    },
    phoneticHints: {
      en: 'oh-vuhl',
      hi: 'an-daa-kaar',
      mr: 'lam-ba-gol',
    },
  },
  {
    id: 'diamond',
    color: '#06B6D4',
    strokeColor: '#0E7490',
    names: {
      en: 'Diamond',
      hi: 'हीरा',
      mr: 'हिरा',
    },
    phoneticHints: {
      en: 'dy-muhnd',
      hi: 'hee-raa',
      mr: 'hee-raa',
    },
  },
  {
    id: 'pentagon',
    color: '#14B8A6',
    strokeColor: '#0F766E',
    names: {
      en: 'Pentagon',
      hi: 'पंचकोण',
      mr: 'पंचकोन',
    },
    phoneticHints: {
      en: 'pen-tuh-gon',
      hi: 'panch-kone',
      mr: 'panch-kone',
    },
  },
  {
    id: 'hexagon',
    color: '#F97316',
    strokeColor: '#C2410C',
    names: {
      en: 'Hexagon',
      hi: 'षट्कोण',
      mr: 'षटकोन',
    },
    phoneticHints: {
      en: 'hek-suh-gon',
      hi: 'shat-kone',
      mr: 'shat-kone',
    },
  },
  {
    id: 'heart',
    color: '#E11D48',
    strokeColor: '#9F1239',
    names: {
      en: 'Heart',
      hi: 'दिल',
      mr: 'हृदय',
    },
    phoneticHints: {
      en: 'hahrt',
      hi: 'dil',
      mr: 'hru-day',
    },
  },
  {
    id: 'crescent',
    color: '#6366F1',
    strokeColor: '#4338CA',
    names: {
      en: 'Crescent',
      hi: 'अर्धचंद्र',
      mr: 'चंद्रकोर',
    },
    phoneticHints: {
      en: 'kres-uhnt',
      hi: 'ardh-chan-dra',
      mr: 'chan-dra-kor',
    },
  },
];

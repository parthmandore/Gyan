/**
 * Purpose: Structured multilingual dataset for Shape Challenge game.
 * Module: Shape Challenge — Data
 * Folder: frontend/src/screens/games/ShapeChallenge/data
 */

import { ShapeItem } from '../types';

export const SHAPES_DATASET: ShapeItem[] = [
  // ==========================================
  // DIFFICULTY 1: BASIC (Age 5 Visual Recognition)
  // ==========================================
  {
    id: 'circle',
    difficulty: 1,
    color: '#3B82F6',
    names: {
      en: 'Circle',
      hi: 'वृत्त',
      mr: 'वर्तुळ',
    },
    variants: {
      en: ['circle', 'round', 'a circle', 'circle shape'],
      hi: ['वृत्त', 'गोल', 'vritt', 'gol', 'gola'],
      mr: ['वर्तुळ', 'गोल', 'vartul', 'gol', 'gola'],
    },
  },
  {
    id: 'square',
    difficulty: 1,
    color: '#EF4444',
    names: {
      en: 'Square',
      hi: 'वर्ग',
      mr: 'चौरस',
    },
    variants: {
      en: ['square', 'a square', 'square shape'],
      hi: ['वर्ग', 'चौकोर', 'varg', 'chaukor'],
      mr: ['चौरस', 'chauras', 'choukoan'],
    },
  },
  {
    id: 'triangle',
    difficulty: 1,
    color: '#10B981',
    names: {
      en: 'Triangle',
      hi: 'त्रिकोण',
      mr: 'त्रिकोण',
    },
    variants: {
      en: ['triangle', 'a triangle', 'triangle shape'],
      hi: ['त्रिकोण', 'trikon', 'trikona'],
      mr: ['त्रिकोण', 'trikon', 'trikona'],
    },
  },
  {
    id: 'rectangle',
    difficulty: 1,
    color: '#F59E0B',
    names: {
      en: 'Rectangle',
      hi: 'आयत',
      mr: 'आयात',
    },
    variants: {
      en: ['rectangle', 'a rectangle', 'rectangle shape'],
      hi: ['आयत', 'aayat', 'ayat'],
      mr: ['आयात', 'aayat', 'ayat', 'आयताकृती'],
    },
  },
  {
    id: 'star',
    difficulty: 1,
    color: '#EC4899',
    names: {
      en: 'Star',
      hi: 'तारा',
      mr: 'चांदणी',
    },
    variants: {
      en: ['star', 'a star', 'star shape'],
      hi: ['तारा', 'सितारा', 'tara', 'sitara'],
      mr: ['चांदणी', 'तारा', 'chandani', 'tara'],
    },
  },

  // ==========================================
  // DIFFICULTY 2: INTERMEDIATE (Age 6 Identification & Speech)
  // ==========================================
  {
    id: 'oval',
    difficulty: 2,
    color: '#8B5CF6',
    names: {
      en: 'Oval',
      hi: 'अंडाकार',
      mr: 'लंबगोल',
    },
    variants: {
      en: ['oval', 'an oval', 'oval shape', 'egg shape'],
      hi: ['अंडाकार', 'andakar', 'andaakar'],
      mr: ['लंबगोल', 'अंडाकार', 'lambagol', 'andakar'],
    },
  },
  {
    id: 'diamond',
    difficulty: 2,
    color: '#06B6D4',
    names: {
      en: 'Diamond',
      hi: 'हीरा',
      mr: 'हिरा',
    },
    variants: {
      en: ['diamond', 'a diamond', 'diamond shape', 'rhombus'],
      hi: ['हीरा', 'heera', 'hira', 'समचतुर्भुज'],
      mr: ['हिरा', 'hira', 'चौकोन'],
    },
  },
  {
    id: 'pentagon',
    difficulty: 2,
    color: '#14B8A6',
    names: {
      en: 'Pentagon',
      hi: 'पंचकोण',
      mr: 'पंचकोन',
    },
    variants: {
      en: ['pentagon', 'a pentagon', 'pentagon shape', 'five sides'],
      hi: ['पंचकोण', 'panchkon', 'panch kon'],
      mr: ['पंचकोन', 'panchkon', 'panch kon'],
    },
  },
  {
    id: 'hexagon',
    difficulty: 2,
    color: '#F97316',
    names: {
      en: 'Hexagon',
      hi: 'षट्कोण',
      mr: 'षटकोन',
    },
    variants: {
      en: ['hexagon', 'a hexagon', 'hexagon shape', 'six sides'],
      hi: ['षट्कोण', 'shatkon', 'khatkon', 'shat kon'],
      mr: ['षटकोन', 'shatkon', 'shat kon'],
    },
  },
  {
    id: 'heart',
    difficulty: 2,
    color: '#E11D48',
    names: {
      en: 'Heart',
      hi: 'दिल',
      mr: 'हृदय',
    },
    variants: {
      en: ['heart', 'a heart', 'heart shape'],
      hi: ['दिल', 'dil', 'हृदय'],
      mr: ['हृदय', 'दिल', 'hruday', 'hrudaya'],
    },
  },
  {
    id: 'crescent',
    difficulty: 2,
    color: '#6366F1',
    names: {
      en: 'Crescent',
      hi: 'अर्धचंद्र',
      mr: 'चंद्रकोर',
    },
    variants: {
      en: ['crescent', 'a crescent', 'crescent shape', 'moon shape'],
      hi: ['अर्धचंद्र', 'ardhachandra', 'ardh chandra', 'chand'],
      mr: ['चंद्रकोर', 'अर्धचंद्र', 'chandrakor', 'ardhachandra'],
    },
  },

  // ==========================================
  // DIFFICULTY 3: COMPLEX (Age 7 Geometric Naming & Pronunciation)
  // ==========================================
  {
    id: 'octagon',
    difficulty: 3,
    color: '#D97706',
    names: {
      en: 'Octagon',
      hi: 'अष्टकोण',
      mr: 'अष्टकोन',
    },
    variants: {
      en: ['octagon', 'an octagon', 'octagon shape', 'eight sides'],
      hi: ['अष्टकोण', 'ashtakon', 'asht kon'],
      mr: ['अष्टकोन', 'ashtakon', 'asht kon'],
    },
  },
  {
    id: 'trapezoid',
    difficulty: 3,
    color: '#0284C7',
    names: {
      en: 'Trapezoid',
      hi: 'समलंब',
      mr: 'समलंब',
    },
    variants: {
      en: ['trapezoid', 'a trapezoid', 'trapezium'],
      hi: ['समलंब', 'समलम्ब', 'samlamb', 'samalamba'],
      mr: ['समलंब', 'समलंब चौकोन', 'samlamb'],
    },
  },
  {
    id: 'parallelogram',
    difficulty: 3,
    color: '#7C3AED',
    names: {
      en: 'Parallelogram',
      hi: 'समांतर चतुर्भुज',
      mr: 'समांतरभुज',
    },
    variants: {
      en: ['parallelogram', 'a parallelogram'],
      hi: ['समांतर चतुर्भुज', 'samantar chaturbhuj', 'samantar'],
      mr: ['समांतरभुज', 'समांतरभुज चौकोन', 'samantarbhuj'],
    },
  },
  {
    id: 'rhombus',
    difficulty: 3,
    color: '#059669',
    names: {
      en: 'Rhombus',
      hi: 'समचतुर्भुज',
      mr: 'समभुज',
    },
    variants: {
      en: ['rhombus', 'a rhombus', 'diamond'],
      hi: ['समचतुर्भुज', 'samchaturbhuj', 'sam chaturbhuj'],
      mr: ['समभुज', 'समभुज चौकोन', 'sambhooj', 'samabhuj'],
    },
  },
  {
    id: 'semicircle',
    difficulty: 3,
    color: '#EA580C',
    names: {
      en: 'Semicircle',
      hi: 'अर्धवृत्त',
      mr: 'अर्धवर्तुळ',
    },
    variants: {
      en: ['semicircle', 'a semicircle', 'semi circle', 'half circle'],
      hi: ['अर्धवृत्त', 'ardhavritt', 'ardha vritt'],
      mr: ['अर्धवर्तुळ', 'ardhavartul', 'ardha vartul'],
    },
  },
  {
    id: 'cross',
    difficulty: 3,
    color: '#4F46E5',
    names: {
      en: 'Cross',
      hi: 'क्रॉस',
      mr: 'अधिक',
    },
    variants: {
      en: ['cross', 'a cross', 'plus', 'plus shape'],
      hi: ['क्रॉस', 'cross', 'प्लस', 'अधिक'],
      mr: ['क्रॉस', 'अधिक', 'अधिक चिन्ह', 'cross'],
    },
  },
  {
    id: 'decagon',
    difficulty: 3,
    color: '#BE185D',
    names: {
      en: 'Decagon',
      hi: 'दशकोण',
      mr: 'दशकोन',
    },
    variants: {
      en: ['decagon', 'a decagon', 'decagon shape', 'ten sides'],
      hi: ['दशकोण', 'dashkon', 'dash kon'],
      mr: ['दशकोन', 'dashkon', 'dash kon'],
    },
  },
];

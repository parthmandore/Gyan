/**
 * Purpose: Structured multilingual dataset for Colour Challenge game.
 * Module: Colour Challenge — Data
 * Folder: frontend/src/screens/games/ColourChallenge/data
 */

import { ColorItem } from '../types';

export const COLORS_DATASET: ColorItem[] = [
  // ==========================================
  // DIFFICULTY 1: BASIC (Age 5 Visual Recognition)
  // ==========================================
  {
    id: 'red',
    hex: '#EF4444',
    borderHex: '#B91C1C',
    difficulty: 1,
    names: {
      en: 'Red',
      hi: 'लाल',
      mr: 'लाल',
    },
    variants: {
      en: ['red', 'red colour', 'red color', "it's red", 'the color red'],
      hi: ['लाल', 'लाल रंग', 'laal', 'lal', 'laal rang'],
      mr: ['लाल', 'लाल रंग', 'laal', 'lal', 'laal rang'],
    },
  },
  {
    id: 'blue',
    hex: '#3B82F6',
    borderHex: '#1D4ED8',
    difficulty: 1,
    names: {
      en: 'Blue',
      hi: 'नीला',
      mr: 'निळा',
    },
    variants: {
      en: ['blue', 'blue colour', 'blue color', "it's blue"],
      hi: ['नीला', 'नीला रंग', 'neela', 'nila', 'neela rang'],
      mr: ['निळा', 'निळा रंग', 'nila', 'neela', 'nila rang'],
    },
  },
  {
    id: 'green',
    hex: '#10B981',
    borderHex: '#047857',
    difficulty: 1,
    names: {
      en: 'Green',
      hi: 'हरा',
      mr: 'हिरवा',
    },
    variants: {
      en: ['green', 'green colour', 'green color', "it's green"],
      hi: ['हरा', 'हरा रंग', 'hara', 'hare', 'hara rang'],
      mr: ['हिरवा', 'हिरवा रंग', 'hirva', 'hirwa', 'hirva rang'],
    },
  },
  {
    id: 'yellow',
    hex: '#FBBF24',
    borderHex: '#D97706',
    difficulty: 1,
    names: {
      en: 'Yellow',
      hi: 'पीला',
      mr: 'पिवळा',
    },
    variants: {
      en: ['yellow', 'yellow colour', 'yellow color', "it's yellow"],
      hi: ['पीला', 'पीला रंग', 'peela', 'pila', 'peela rang'],
      mr: ['पिवळा', 'पिवळा रंग', 'pivla', 'piwla', 'pivla rang'],
    },
  },
  {
    id: 'orange',
    hex: '#F97316',
    borderHex: '#C2410C',
    difficulty: 1,
    names: {
      en: 'Orange',
      hi: 'नारंगी',
      mr: 'नारंगी',
    },
    variants: {
      en: ['orange', 'orange colour', 'orange color', "it's orange"],
      hi: ['नारंगी', 'नारंगी रंग', 'संतरा', 'narangi', 'narangi rang'],
      mr: ['नारंगी', 'नारंगी रंग', 'narangi', 'narangi rang', 'केशरी'],
    },
  },
  {
    id: 'purple',
    hex: '#8B5CF6',
    borderHex: '#6D28D9',
    difficulty: 1,
    names: {
      en: 'Purple',
      hi: 'बैंगनी',
      mr: 'जांभळा',
    },
    variants: {
      en: ['purple', 'purple colour', 'purple color', "it's purple"],
      hi: ['बैंगनी', 'बैंगनी रंग', 'baingani', 'baingani rang', 'baigani'],
      mr: ['जांभळा', 'जांभळा रंग', 'jambhala', 'jambla', 'jambhla'],
    },
  },
  {
    id: 'pink',
    hex: '#EC4899',
    borderHex: '#BE185D',
    difficulty: 1,
    names: {
      en: 'Pink',
      hi: 'गुलाबी',
      mr: 'गुलाबी',
    },
    variants: {
      en: ['pink', 'pink colour', 'pink color', "it's pink"],
      hi: ['गुलाबी', 'गुलाबी रंग', 'gulabi', 'gulaabi', 'gulabi rang'],
      mr: ['गुलाबी', 'गुलाबी रंग', 'gulabi', 'gulaabi', 'gulabi rang'],
    },
  },
  {
    id: 'black',
    hex: '#1E293B',
    borderHex: '#0F172A',
    difficulty: 1,
    names: {
      en: 'Black',
      hi: 'काला',
      mr: 'काळा',
    },
    variants: {
      en: ['black', 'black colour', 'black color', "it's black"],
      hi: ['काला', 'काला रंग', 'kaala', 'kala', 'kala rang'],
      mr: ['काळा', 'काळा रंग', 'kala', 'kaala', 'kala rang'],
    },
  },
  {
    id: 'white',
    hex: '#F8FAFC',
    borderHex: '#94A3B8',
    difficulty: 1,
    names: {
      en: 'White',
      hi: 'सफ़ेद',
      mr: 'पांढरा',
    },
    variants: {
      en: ['white', 'white colour', 'white color', "it's white"],
      hi: ['सफेद', 'सफ़ेद', 'safed', 'safed rang'],
      mr: ['पांढरा', 'पांढरा रंग', 'pandhra', 'pandhra rang'],
    },
  },
  {
    id: 'brown',
    hex: '#78350F',
    borderHex: '#451A03',
    difficulty: 1,
    names: {
      en: 'Brown',
      hi: 'भूरा',
      mr: 'तपकिरी',
    },
    variants: {
      en: ['brown', 'brown colour', 'brown color', "it's brown"],
      hi: ['भूरा', 'भूरा रंग', 'bhoora', 'bhura', 'bhura rang'],
      mr: ['तपकिरी', 'तपकिरी रंग', 'tapkiri', 'tapkiri rang'],
    },
  },

  // ==========================================
  // DIFFICULTY 2: INTERMEDIATE (Age 6 Speaking)
  // ==========================================
  {
    id: 'sky_blue',
    hex: '#38BDF8',
    borderHex: '#0284C7',
    difficulty: 2,
    names: {
      en: 'Sky Blue',
      hi: 'आसमानी',
      mr: 'आकाशी',
    },
    variants: {
      en: ['sky blue', 'sky blue color', 'light blue', 'cyan'],
      hi: ['आसमानी', 'आसमानी रंग', 'aasmani', 'aasmaani', 'aasmani rang'],
      mr: ['आकाशी', 'आकाशी रंग', 'aakashi', 'akashi', 'akashi rang'],
    },
  },
  {
    id: 'gold',
    hex: '#F59E0B',
    borderHex: '#B45309',
    difficulty: 2,
    names: {
      en: 'Gold',
      hi: 'सुनहरा',
      mr: 'सोनेरी',
    },
    variants: {
      en: ['gold', 'golden', 'gold colour', 'golden color'],
      hi: ['सुनहरा', 'सुनहरा रंग', 'sunehra', 'sunehra rang', 'sona'],
      mr: ['सोनेरी', 'सोनेरी रंग', 'soneri', 'soneri rang'],
    },
  },

  // ==========================================
  // DIFFICULTY 3: ADVANCED (Age 7 Pronunciation)
  // ==========================================
  {
    id: 'violet',
    hex: '#7C3AED',
    borderHex: '#5B21B6',
    difficulty: 3,
    names: {
      en: 'Violet',
      hi: 'बैंगनी',
      mr: 'जांभळा',
    },
    variants: {
      en: ['violet', 'violet colour', 'violet color'],
      hi: ['बैंगनी', 'वायलेट', 'baingani', 'violet'],
      mr: ['जांभळा', 'व्हायलेट', 'jambhala', 'violet'],
    },
  },
  {
    id: 'indigo',
    hex: '#4338CA',
    borderHex: '#312E81',
    difficulty: 3,
    names: {
      en: 'Indigo',
      hi: 'जामुनी',
      mr: 'गडद जांभळा',
    },
    variants: {
      en: ['indigo', 'indigo colour', 'indigo color'],
      hi: ['जामुनी', 'जामुनी रंग', 'jamuni', 'indigo'],
      mr: ['गडद जांभळा', 'इंडिगो', 'gadad jambhala', 'indigo'],
    },
  },
  {
    id: 'turquoise',
    hex: '#06B6D4',
    borderHex: '#0E7490',
    difficulty: 3,
    names: {
      en: 'Turquoise',
      hi: 'फ़िरोज़ी',
      mr: 'फिरोजी',
    },
    variants: {
      en: ['turquoise', 'turquoise colour', 'turquoise color'],
      hi: ['फिरोज़ी', 'फ़िरोज़ी', 'firozi', 'phirozi', 'firozi rang'],
      mr: ['फिरोजी', 'फिरोजी रंग', 'firozi', 'phirozi'],
    },
  },
  {
    id: 'dark_green',
    hex: '#064E3B',
    borderHex: '#022C22',
    difficulty: 3,
    names: {
      en: 'Dark Green',
      hi: 'गहरा हरा',
      mr: 'गडद हिरवा',
    },
    variants: {
      en: ['dark green', 'dark green colour', 'dark green color'],
      hi: ['गहरा हरा', 'गहरा हरा रंग', 'gehra hara', 'gehra hara rang'],
      mr: ['गडद हिरवा', 'गडद हिरवा रंग', 'gadad hirva', 'gadad hirwa'],
    },
  },
  {
    id: 'light_blue',
    hex: '#7DD3FC',
    borderHex: '#38BDF8',
    difficulty: 3,
    names: {
      en: 'Light Blue',
      hi: 'हल्का नीला',
      mr: 'फिकट निळा',
    },
    variants: {
      en: ['light blue', 'light blue colour', 'light blue color'],
      hi: ['हल्का नीला', 'हल्का नीला रंग', 'halka neela', 'halka nila'],
      mr: ['फिकट निळा', 'फिकट निळा रंग', 'phikat nila', 'fikat nila'],
    },
  },
  {
    id: 'silver',
    hex: '#94A3B8',
    borderHex: '#64748B',
    difficulty: 3,
    names: {
      en: 'Silver',
      hi: 'चांदी',
      mr: 'रुपेरी',
    },
    variants: {
      en: ['silver', 'silver colour', 'silver color'],
      hi: ['चांदी', 'चांदी रंग', 'chandi', 'chandi rang', 'chandee'],
      mr: ['रुपेरी', 'रुपेरी रंग', 'ruperi', 'ruperi rang'],
    },
  },
  {
    id: 'maroon',
    hex: '#881337',
    borderHex: '#4C0519',
    difficulty: 3,
    names: {
      en: 'Maroon',
      hi: 'मैरून',
      mr: 'तपकिरी लाल',
    },
    variants: {
      en: ['maroon', 'maroon colour', 'maroon color'],
      hi: ['मैरून', 'maroon', 'mairoon', 'मैरून रंग'],
      mr: ['तपकिरी लाल', 'मॅरून', 'tapkiri laal', 'maroon'],
    },
  },
  {
    id: 'teal',
    hex: '#0F766E',
    borderHex: '#134E4A',
    difficulty: 3,
    names: {
      en: 'Teal',
      hi: 'टील',
      mr: 'मोरपंखी',
    },
    variants: {
      en: ['teal', 'teal colour', 'teal color'],
      hi: ['टील', 'teal', 'टील रंग'],
      mr: ['मोरपंखी', 'मोरपंखी रंग', 'morpankhi', 'teal'],
    },
  },
];

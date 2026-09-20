/**
 * Purpose: Game logic and 5-round question generation for Put in Order (Age 5).
 *          Features progressive ordering challenges, language-authentic letter sequencing,
 *          and guaranteed scrambled initial layouts.
 * Module: Put in Order — Logic Generator
 * Folder: frontend/src/screens/games/PutInOrder/logic
 */

import {
  OrderItem,
  OrderPreset,
  OrderQuestion,
  SupportedLanguage,
} from '../types';
import {
  NUMBER_ORDER_PRESETS,
  ENGLISH_LETTER_PRESETS,
  HINDI_LETTER_PRESETS,
  MARATHI_LETTER_PRESETS,
  QUANTITY_ORDER_PRESETS,
  LOGICAL_ORDER_PRESETS,
} from '../datasets/orderSequences';

export const TOTAL_ORDER_ROUNDS = 7;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Ensures shuffled items are not in the already-solved sequence.
 */
function guaranteeShuffled(items: OrderItem[]): OrderItem[] {
  if (items.length <= 1) return items;

  let scrambled = shuffle(items);
  let attempts = 0;
  // If scrambled matches solved order, shuffle again or swap first two
  while (
    attempts < 10 &&
    scrambled.every((item, idx) => item.id === items[idx].id)
  ) {
    scrambled = shuffle(items);
    attempts++;
  }

  // If still matching after attempts, manually swap elements 0 and 1
  if (scrambled.every((item, idx) => item.id === items[idx].id)) {
    const temp = scrambled[0];
    scrambled[0] = scrambled[1];
    scrambled[1] = temp;
  }

  return scrambled;
}

/**
 * Returns localized prompt text based on challenge type.
 */
function getPromptText(type: OrderPreset['type']): Record<SupportedLanguage, string> {
  switch (type) {
    case 'numbers':
      return {
        en: 'Put the numbers in order from smallest to biggest!',
        hi: 'नंबरों को छोटे से बड़े क्रम में लगाओ!',
        mr: 'नंबर लहान ते मोठे क्रमाने लावा!',
      };
    case 'letters':
      return {
        en: 'Put the letters in alphabetical order!',
        hi: 'अक्षरों को सही वर्णमाला क्रम में लगाओ!',
        mr: 'अक्षरांना योग्य क्रमाने लावा!',
      };
    case 'quantities':
      return {
        en: 'Arrange from fewest to most!',
        hi: 'कम से ज़्यादा की ओर क्रम में लगाओ!',
        mr: 'कमी ते जास्त अशा क्रमाने लावा!',
      };
    case 'logical':
      return {
        en: 'Put the pictures in the right order!',
        hi: 'चित्रों को सही क्रम में लगाओ!',
        mr: 'चित्रे योग्य क्रमाने लावा!',
      };
  }
}

/**
 * Returns spoken instruction for text-to-speech.
 */
function getSpokenPrompt(type: OrderPreset['type']): Record<SupportedLanguage, string> {
  switch (type) {
    case 'numbers':
      return {
        en: 'Tap the cards to put the numbers in order, from one to next!',
        hi: 'कार्ड्स को छूकर नंबरों को सही क्रम में लगाओ!',
        mr: 'कार्ड्सवर टॅप करून नंबर योग्य क्रमाने लावा!',
      };
    case 'letters':
      return {
        en: 'Tap the cards to put the letters in order!',
        hi: 'कार्ड्स छूकर अक्षरों को वर्णमाला क्रम में सजाओ!',
        mr: 'कार्ड्सवर टॅप करून अक्षरे योग्य क्रमाने लावा!',
      };
    case 'quantities':
      return {
        en: 'Count each card and put them in order from smallest to biggest!',
        hi: 'कार्ड्स गिनो और उन्हें कम से ज़्यादा के क्रम में रखो!',
        mr: 'कार्ड्स मोजा आणि कमी ते जास्त क्रमाने लावा!',
      };
    case 'logical':
      return {
        en: 'Look at what happens first, next, and last!',
        hi: 'देखो पहले क्या होता है और सही क्रम में लगाओ!',
        mr: 'पहिले काय घडते ते ओळखून योग्य क्रमाने लावा!',
      };
  }
}

function presetToQuestion(
  preset: OrderPreset,
  roundNumber: number
): OrderQuestion {
  const items: OrderItem[] = preset.items.map((item, idx) => ({
    id: `item_${preset.id}_${idx}_${item.display}`,
    display: item.display,
    orderIndex: idx,
  }));

  const shuffledItems = guaranteeShuffled(items);

  return {
    id: `order_q_${roundNumber}_${preset.id}_${Date.now()}`,
    roundNumber,
    type: preset.type,
    items,
    shuffledItems,
    promptText: getPromptText(preset.type),
    spokenPrompt: getSpokenPrompt(preset.type),
  };
}

/**
 * Generates 5 progressive rounds respecting the child's learning language.
 */
export function generateOrderSession(
  language: SupportedLanguage = 'en'
): OrderQuestion[] {
  // Select letter presets pool based on language
  let letterPool = ENGLISH_LETTER_PRESETS;
  if (language === 'hi') {
    letterPool = HINDI_LETTER_PRESETS;
  } else if (language === 'mr') {
    letterPool = MARATHI_LETTER_PRESETS;
  }

  // 3-item numbers vs 4-item numbers
  const numbers3 = NUMBER_ORDER_PRESETS.filter((p) => p.items.length === 3);
  const numbers4 = NUMBER_ORDER_PRESETS.filter((p) => p.items.length === 4);

  // 3-item letters vs 4-item letters
  const letters3 = letterPool.filter((p) => p.items.length === 3);
  const letters4 = letterPool.filter((p) => p.items.length === 4);

  // Exactly 7 Progressive Rounds for Age 5
  // Round 1-2: 3 numbers
  const r1 = getRandomElement(numbers3);
  const r2 = getRandomElement(numbers3.filter((p) => p.id !== r1.id).length > 0 ? numbers3.filter((p) => p.id !== r1.id) : numbers3);

  // Round 3-4: 3 letters
  const r3 = getRandomElement(letters3);
  const r4 = getRandomElement(letters3.filter((p) => p.id !== r3.id).length > 0 ? letters3.filter((p) => p.id !== r3.id) : letters3);

  // Round 5: 3 quantities
  const quantities3 = QUANTITY_ORDER_PRESETS.filter((p) => p.items.length === 3);
  const r5 = getRandomElement(quantities3);

  // Round 6: 3 logical items
  const r6 = getRandomElement(LOGICAL_ORDER_PRESETS);

  // Round 7: 4 numbers
  const r7 = getRandomElement(numbers4);

  const selectedPresets = [r1, r2, r3, r4, r5, r6, r7];

  return selectedPresets.map((preset, idx) => presetToQuestion(preset, idx + 1));
}

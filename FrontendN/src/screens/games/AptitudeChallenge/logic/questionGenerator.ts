/**
 * Purpose: Data-driven question generator for the 7 Aptitude & Logical Thinking games.
 *          Generates exactly 5 progressive rounds with randomized distinct options,
 *          mathematical/logical guarantees, and localized prompt keys.
 * Module: Aptitude Challenge — Logic
 * Folder: frontend/src/screens/games/AptitudeChallenge/logic
 */

import { AptitudeGameType, AptitudeQuestion, AptitudeRound, AptitudeOption } from '../types';

export const TOTAL_APTITUDE_ROUNDS = 10;

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// -------------------------------------------------------------
// 1. PATTERN MATCH GENERATOR (Age 6)
// -------------------------------------------------------------
interface PatternPreset {
  sequence: string[];
  nextCorrect: string;
  distractors: string[];
}

const PATTERN_PRESETS: PatternPreset[] = [
  {
    sequence: ['🔴', '🔵', '🔴', '🔵', '🔴'],
    nextCorrect: '🔵',
    distractors: ['🔴', '🟢', '🟡'],
  },
  {
    sequence: ['⭐️', '🌙', '⭐️', '🌙', '⭐️'],
    nextCorrect: '🌙',
    distractors: ['⭐️', '☀️', '☁️'],
  },
  {
    sequence: ['🔺', '🟦', '🔺', '🟦', '🔺'],
    nextCorrect: '🟦',
    distractors: ['🔺', '🟢', '🟨'],
  },
  {
    sequence: ['🍎', '🍌', '🍎', '🍌', '🍎'],
    nextCorrect: '🍌',
    distractors: ['🍎', '🍇', '🍊'],
  },
  {
    sequence: ['🐱', '🐱', '🐶', '🐶', '🐱'],
    nextCorrect: '🐱',
    distractors: ['🐶', '🐭', '🐰'],
  },
  {
    sequence: ['🔴', '🟢', '🔵', '🔴', '🟢'],
    nextCorrect: '🔵',
    distractors: ['🔴', '🟢', '🟡'],
  },
  {
    sequence: ['🚗', '🚌', '🚗', '🚌', '🚗'],
    nextCorrect: '🚌',
    distractors: ['🚗', '🚲', '🚂'],
  },
  {
    sequence: ['🌸', '🌻', '🌸', '🌻', '🌸'],
    nextCorrect: '🌻',
    distractors: ['🌸', '🌹', '🍀'],
  },
  {
    sequence: ['🍏', '🍎', '🍏', '🍎', '🍏'],
    nextCorrect: '🍎',
    distractors: ['🍏', '🍋', '🍐'],
  },
  {
    sequence: ['🔷', '🔶', '🔷', '🔶', '🔷'],
    nextCorrect: '🔶',
    distractors: ['🔷', '⚪', '⚫'],
  },
];

function generatePatternMatchRound(roundNumber: number): AptitudeQuestion {
  const available = shuffle(PATTERN_PRESETS);
  const preset = available[(roundNumber - 1) % available.length];

  const options: AptitudeOption[] = shuffle([
    { id: `opt_corr_${roundNumber}`, visual: preset.nextCorrect, label: preset.nextCorrect, isCorrect: true },
    { id: `opt_d1_${roundNumber}`, visual: preset.distractors[0], label: preset.distractors[0], isCorrect: false },
    { id: `opt_d2_${roundNumber}`, visual: preset.distractors[1], label: preset.distractors[1], isCorrect: false },
    { id: `opt_d3_${roundNumber}`, visual: preset.distractors[2], label: preset.distractors[2], isCorrect: false },
  ]);

  const stimulusTokens: AptitudeQuestion['stimulusTokens'] = preset.sequence.map((item, idx) => ({
    id: `tok_${roundNumber}_${idx}`,
    visual: item,
  }));
  stimulusTokens.push({
    id: `tok_${roundNumber}_placeholder`,
    visual: '❓',
    isPlaceholder: true,
  });

  return {
    id: `q_pattern_${roundNumber}_${Date.now()}`,
    gameType: 'pattern_match',
    roundNumber,
    promptKey: 'aptitudeChallenge.patternMatchPrompt',
    promptFallback: 'What comes next in the pattern?',
    spokenPhraseKey: 'aptitudeChallenge.patternMatchPrompt',
    stimulusLayout: 'sequence',
    stimulusTokens,
    options,
  };
}

// -------------------------------------------------------------
// 2. BIGGER / SMALLER GENERATOR (Age 6)
// -------------------------------------------------------------
function generateBiggerSmallerRound(roundNumber: number): AptitudeQuestion {
  // Odd rounds: Which is bigger? Even rounds: Which is smaller?
  const isAskingBigger = roundNumber % 2 !== 0;
  const promptKey = isAskingBigger
    ? 'aptitudeChallenge.whichIsBigger'
    : 'aptitudeChallenge.whichIsSmaller';
  const promptFallback = isAskingBigger
    ? 'Which number is bigger?'
    : 'Which number is smaller?';

  let num1: number;
  let num2: number;
  let num3: number | null = null;

  // Age 6 range: 1 to 20
  if (roundNumber === 5) {
    // 3 numbers for round 5 bonus challenge
    const base = Math.floor(Math.random() * 8) + 2;
    num1 = base;
    num2 = base + Math.floor(Math.random() * 5) + 3;
    num3 = num2 + Math.floor(Math.random() * 5) + 3;
    const nums = shuffle([num1, num2, num3]);
    const target = isAskingBigger ? Math.max(num1, num2, num3) : Math.min(num1, num2, num3);

    const options: AptitudeOption[] = nums.map((n, idx) => ({
      id: `opt_${roundNumber}_${idx}_${n}`,
      label: String(n),
      isCorrect: n === target,
    }));

    return {
      id: `q_bigsmall_${roundNumber}_${Date.now()}`,
      gameType: 'bigger_smaller',
      roundNumber,
      promptKey,
      promptFallback,
      spokenPhraseKey: promptKey,
      stimulusLayout: 'comparison',
      stimulusTokens: nums.map((n, idx) => ({
        id: `stim_${idx}`,
        visual: String(n),
      })),
      options,
    };
  } else {
    // 2 numbers
    num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
    const diff = Math.floor(Math.random() * 6) + 2; // +2 to +7
    num2 = num1 + diff;
    const nums = shuffle([num1, num2]);
    const target = isAskingBigger ? Math.max(num1, num2) : Math.min(num1, num2);

    const options: AptitudeOption[] = nums.map((n, idx) => ({
      id: `opt_${roundNumber}_${idx}_${n}`,
      label: String(n),
      isCorrect: n === target,
    }));

    return {
      id: `q_bigsmall_${roundNumber}_${Date.now()}`,
      gameType: 'bigger_smaller',
      roundNumber,
      promptKey,
      promptFallback,
      spokenPhraseKey: promptKey,
      stimulusLayout: 'comparison',
      stimulusTokens: nums.map((n, idx) => ({
        id: `stim_${idx}`,
        visual: String(n),
      })),
      options,
    };
  }
}

// -------------------------------------------------------------
// 3. WHAT COMES NEXT GENERATOR (Age 6)
// -------------------------------------------------------------
function generateWhatComesNextRound(roundNumber: number): AptitudeQuestion {
  if (roundNumber === 5) {
    // Fun visual nature progression: Egg -> Hatching -> Chick -> Chicken
    const sequence = ['🥚', '🐣', '🐥'];
    const correct = '🐔';
    const distractors = ['🥚', '🐶', '🍎'];
    const options: AptitudeOption[] = shuffle([
      { id: `opt_corr_${roundNumber}`, visual: correct, label: correct, isCorrect: true },
      { id: `opt_d1_${roundNumber}`, visual: distractors[0], label: distractors[0], isCorrect: false },
      { id: `opt_d2_${roundNumber}`, visual: distractors[1], label: distractors[1], isCorrect: false },
      { id: `opt_d3_${roundNumber}`, visual: distractors[2], label: distractors[2], isCorrect: false },
    ]);

    const stimulusTokens: AptitudeQuestion['stimulusTokens'] = sequence.map((s, idx) => ({
      id: `tok_${roundNumber}_${idx}`,
      visual: s,
    }));
    stimulusTokens.push({
      id: `tok_${roundNumber}_placeholder`,
      visual: '❓',
      isPlaceholder: true,
    });

    return {
      id: `q_next_${roundNumber}_${Date.now()}`,
      gameType: 'what_comes_next',
      roundNumber,
      promptKey: 'aptitudeChallenge.whatComesNextPrompt',
      promptFallback: 'What comes next in order?',
      spokenPhraseKey: 'aptitudeChallenge.whatComesNextPrompt',
      stimulusLayout: 'cause_effect',
      stimulusTokens,
      options,
    };
  }

  // Rounds 1-4: Counting sequences
  const starts = [1, 3, 5, 7];
  const start = starts[(roundNumber - 1) % starts.length] + Math.floor(Math.random() * 2);
  const s1 = start;
  const s2 = start + 1;
  const s3 = start + 2;
  const correct = start + 3;

  // Distinct distractors
  const distractors = [correct + 1, correct + 2, Math.max(1, start - 1)];

  const options: AptitudeOption[] = shuffle([
    { id: `opt_corr_${roundNumber}`, label: String(correct), isCorrect: true },
    { id: `opt_d1_${roundNumber}`, label: String(distractors[0]), isCorrect: false },
    { id: `opt_d2_${roundNumber}`, label: String(distractors[1]), isCorrect: false },
    { id: `opt_d3_${roundNumber}`, label: String(distractors[2]), isCorrect: false },
  ]);

  const stimulusTokens: AptitudeQuestion['stimulusTokens'] = [s1, s2, s3].map((n, idx) => ({
    id: `tok_${roundNumber}_${idx}`,
    visual: String(n),
  }));
  stimulusTokens.push({
    id: `tok_${roundNumber}_placeholder`,
    visual: '❓',
    isPlaceholder: true,
  });

  return {
    id: `q_next_${roundNumber}_${Date.now()}`,
    gameType: 'what_comes_next',
    roundNumber,
    promptKey: 'aptitudeChallenge.whatComesNextPrompt',
    promptFallback: 'What comes next in order?',
    spokenPhraseKey: 'aptitudeChallenge.whatComesNextPrompt',
    stimulusLayout: 'sequence',
    stimulusTokens,
    options,
  };
}

// -------------------------------------------------------------
// 4. NUMBER PATTERN GENERATOR (Age 7)
// -------------------------------------------------------------
function generateNumberPatternRound(roundNumber: number): AptitudeQuestion {
  let step = 2;
  let start = 2;
  let isDescending = false;

  switch (roundNumber) {
    case 1:
      // Skip count by 2
      step = 2;
      start = (Math.floor(Math.random() * 3) + 1) * 2; // 2, 4, 6
      break;
    case 2:
      // Skip count by 5
      step = 5;
      start = (Math.floor(Math.random() * 3) + 1) * 5; // 5, 10, 15
      break;
    case 3:
      // Skip count by 10
      step = 10;
      start = (Math.floor(Math.random() * 4) + 1) * 10; // 10, 20, 30, 40
      break;
    case 4:
      // Counting down by 2 or 1
      isDescending = true;
      step = 2;
      start = 16 + Math.floor(Math.random() * 4) * 2; // 16, 18, 20, 22
      break;
    case 5:
    default:
      // Skip count by 3 or 4
      step = 3;
      start = (Math.floor(Math.random() * 3) + 1) * 3; // 3, 6, 9
      break;
  }

  const sign = isDescending ? -1 : 1;
  const s1 = start;
  const s2 = s1 + sign * step;
  const s3 = s2 + sign * step;
  const correct = s3 + sign * step;

  // Generate 3 unique distractors near correct
  const distSet = new Set<number>();
  const candidates = [
    correct + 1,
    correct - 1,
    correct + step,
    correct - step,
    correct + 2,
    correct - 2,
  ];
  for (const c of candidates) {
    if (c !== correct && c > 0) {
      distSet.add(c);
      if (distSet.size >= 3) break;
    }
  }

  const distArray = Array.from(distSet);
  while (distArray.length < 3) {
    const fallback = correct + distArray.length + 5;
    distArray.push(fallback);
  }

  const options: AptitudeOption[] = shuffle([
    { id: `opt_corr_${roundNumber}`, label: String(correct), isCorrect: true },
    { id: `opt_d1_${roundNumber}`, label: String(distArray[0]), isCorrect: false },
    { id: `opt_d2_${roundNumber}`, label: String(distArray[1]), isCorrect: false },
    { id: `opt_d3_${roundNumber}`, label: String(distArray[2]), isCorrect: false },
  ]);

  const stimulusTokens: AptitudeQuestion['stimulusTokens'] = [s1, s2, s3].map((n, idx) => ({
    id: `tok_${roundNumber}_${idx}`,
    visual: String(n),
  }));
  stimulusTokens.push({
    id: `tok_${roundNumber}_placeholder`,
    visual: '❓',
    isPlaceholder: true,
  });

  return {
    id: `q_numpat_${roundNumber}_${Date.now()}`,
    gameType: 'number_pattern',
    roundNumber,
    promptKey: 'aptitudeChallenge.numberPatternPrompt',
    promptFallback: 'Find the missing number in the sequence!',
    spokenPhraseKey: 'aptitudeChallenge.numberPatternPrompt',
    stimulusLayout: 'sequence',
    stimulusTokens,
    options,
  };
}

// -------------------------------------------------------------
// 5. ODD ONE OUT GENERATOR (Age 7)
// -------------------------------------------------------------
interface OddPreset {
  items: { visual: string; label: string; isOdd: boolean }[];
  explanationKey: string;
  explanationFallback: string;
}

const ODD_PRESETS: OddPreset[] = [
  {
    items: [
      { visual: '🐶', label: 'Dog', isOdd: false },
      { visual: '🐱', label: 'Cat', isOdd: false },
      { visual: '🐭', label: 'Mouse', isOdd: false },
      { visual: '🍎', label: 'Apple', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpAnimals',
    explanationFallback: 'Apple is a fruit, while the others are animals!',
  },
  {
    items: [
      { visual: '🚗', label: 'Car', isOdd: false },
      { visual: '🚌', label: 'Bus', isOdd: false },
      { visual: '✈️', label: 'Plane', isOdd: false },
      { visual: '🦁', label: 'Lion', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpVehicles',
    explanationFallback: 'Lion is an animal, while the others are vehicles!',
  },
  {
    items: [
      { visual: '🍌', label: 'Banana', isOdd: false },
      { visual: '🍇', label: 'Grapes', isOdd: false },
      { visual: '🍓', label: 'Strawberry', isOdd: false },
      { visual: '👟', label: 'Shoe', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpFruits',
    explanationFallback: 'Shoe is wear, while the others are delicious fruits!',
  },
  {
    items: [
      { visual: '🔴', label: 'Circle', isOdd: false },
      { visual: '🟦', label: 'Square', isOdd: false },
      { visual: '🔺', label: 'Triangle', isOdd: false },
      { visual: '7️⃣', label: '7', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpShapes',
    explanationFallback: '7 is a number, while the others are shapes!',
  },
  {
    items: [
      { visual: '🐟', label: 'Fish', isOdd: false },
      { visual: '🐬', label: 'Dolphin', isOdd: false },
      { visual: '🦈', label: 'Shark', isOdd: false },
      { visual: '🦅', label: 'Eagle', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpWater',
    explanationFallback: 'Eagle flies in the sky, while the others live in water!',
  },
  {
    items: [
      { visual: '2️⃣', label: '2', isOdd: false },
      { visual: '4️⃣', label: '4', isOdd: false },
      { visual: '6️⃣', label: '6', isOdd: false },
      { visual: '9️⃣', label: '9', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpEven',
    explanationFallback: '9 is an odd number, while the others are even numbers!',
  },
  {
    items: [
      { visual: '🥕', label: 'Carrot', isOdd: false },
      { visual: '🥦', label: 'Broccoli', isOdd: false },
      { visual: '🥔', label: 'Potato', isOdd: false },
      { visual: '🍰', label: 'Cake', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpVeggies',
    explanationFallback: 'Cake is a dessert, while the others are vegetables!',
  },
  {
    items: [
      { visual: '☀️', label: 'Sun', isOdd: false },
      { visual: '🌙', label: 'Moon', isOdd: false },
      { visual: '⭐️', label: 'Star', isOdd: false },
      { visual: '🐙', label: 'Octopus', isOdd: true },
    ],
    explanationKey: 'aptitudeChallenge.oddOneOutExpSky',
    explanationFallback: 'Octopus lives in the sea, while the others are in the sky!',
  },
];

function generateOddOneOutRound(roundNumber: number): AptitudeQuestion {
  const shuffledPresets = shuffle(ODD_PRESETS);
  const preset = shuffledPresets[(roundNumber - 1) % shuffledPresets.length];

  const shuffledItems = shuffle(preset.items);
  const options: AptitudeOption[] = shuffledItems.map((item, idx) => ({
    id: `opt_odd_${roundNumber}_${idx}_${item.label}`,
    visual: item.visual,
    label: item.label,
    isCorrect: item.isOdd,
  }));

  return {
    id: `q_odd_${roundNumber}_${Date.now()}`,
    gameType: 'odd_one_out',
    roundNumber,
    promptKey: 'aptitudeChallenge.oddOneOutPrompt',
    promptFallback: 'Which one does not belong?',
    spokenPhraseKey: 'aptitudeChallenge.oddOneOutPrompt',
    stimulusLayout: 'cards_grid',
    stimulusTokens: shuffledItems.map((item, idx) => ({
      id: `stim_${idx}`,
      visual: item.visual,
      label: item.label,
    })),
    options,
    explanationKey: preset.explanationKey,
    explanationFallback: preset.explanationFallback,
  };
}

// -------------------------------------------------------------
// 6. LOGICAL SEQUENCE GENERATOR (Age 7)
// -------------------------------------------------------------
interface SequencePreset {
  steps: { visual: string; label: string }[];
  nextCorrect: { visual: string; label: string };
  distractors: { visual: string; label: string }[];
}

const SEQUENCE_PRESETS: SequencePreset[] = [
  {
    steps: [
      { visual: '🌅', label: 'Wake up' },
      { visual: '🪥', label: 'Brush teeth' },
    ],
    nextCorrect: { visual: '🍳', label: 'Breakfast' },
    distractors: [
      { visual: '🛌', label: 'Sleep' },
      { visual: '🌙', label: 'Night' },
      { visual: '👕', label: 'Pajamas' },
    ],
  },
  {
    steps: [
      { visual: '🌱', label: 'Seed' },
      { visual: '🌿', label: 'Sprout' },
      { visual: '🌸', label: 'Flower' },
    ],
    nextCorrect: { visual: '🍎', label: 'Fruit' },
    distractors: [
      { visual: '🚜', label: 'Tractor' },
      { visual: '☁️', label: 'Cloud' },
      { visual: '🌱', label: 'Seed' },
    ],
  },
  {
    steps: [
      { visual: '🌅', label: 'Morning' },
      { visual: '☀️', label: 'Afternoon' },
      { visual: '🌇', label: 'Evening' },
    ],
    nextCorrect: { visual: '🌙', label: 'Night' },
    distractors: [
      { visual: '🌄', label: 'Dawn' },
      { visual: '🥣', label: 'Breakfast' },
      { visual: '☀️', label: 'Noon' },
    ],
  },
  {
    steps: [
      { visual: '🌾', label: 'Wheat' },
      { visual: '🥣', label: 'Dough' },
      { visual: '🍞', label: 'Bake' },
    ],
    nextCorrect: { visual: '😋', label: 'Eat' },
    distractors: [
      { visual: '🧼', label: 'Wash' },
      { visual: '😴', label: 'Sleep' },
      { visual: '🚜', label: 'Drive' },
    ],
  },
  {
    steps: [
      { visual: '🥚', label: 'Egg' },
      { visual: '🐛', label: 'Caterpillar' },
      { visual: '🥥', label: 'Chrysalis' },
    ],
    nextCorrect: { visual: '🦋', label: 'Butterfly' },
    distractors: [
      { visual: '🐟', label: 'Fish' },
      { visual: '🚗', label: 'Car' },
      { visual: '🐸', label: 'Frog' },
    ],
  },
  {
    steps: [
      { visual: '🧼', label: 'Soap' },
      { visual: '💧', label: 'Water' },
      { visual: '👏', label: 'Scrub' },
    ],
    nextCorrect: { visual: '🧻', label: 'Dry' },
    distractors: [
      { visual: '🍕', label: 'Dirt' },
      { visual: '👟', label: 'Shoes' },
      { visual: '🛌', label: 'Sleep' },
    ],
  },
  {
    steps: [
      { visual: '📄', label: 'Paper' },
      { visual: '✏️', label: 'Sketch' },
      { visual: '🎨', label: 'Paint' },
    ],
    nextCorrect: { visual: '🖼️', label: 'Frame' },
    distractors: [
      { visual: '🗑️', label: 'Trash' },
      { visual: '🛏️', label: 'Bed' },
      { visual: '🚗', label: 'Car' },
    ],
  },
];

function generateLogicalSequenceRound(roundNumber: number): AptitudeQuestion {
  const available = shuffle(SEQUENCE_PRESETS);
  const preset = available[(roundNumber - 1) % available.length];

  const options: AptitudeOption[] = shuffle([
    {
      id: `opt_corr_${roundNumber}`,
      visual: preset.nextCorrect.visual,
      label: preset.nextCorrect.label,
      isCorrect: true,
    },
    {
      id: `opt_d1_${roundNumber}`,
      visual: preset.distractors[0].visual,
      label: preset.distractors[0].label,
      isCorrect: false,
    },
    {
      id: `opt_d2_${roundNumber}`,
      visual: preset.distractors[1].visual,
      label: preset.distractors[1].label,
      isCorrect: false,
    },
    {
      id: `opt_d3_${roundNumber}`,
      visual: preset.distractors[2].visual,
      label: preset.distractors[2].label,
      isCorrect: false,
    },
  ]);

  const stimulusTokens: AptitudeQuestion['stimulusTokens'] = preset.steps.map((st, idx) => ({
    id: `tok_${roundNumber}_${idx}`,
    visual: st.visual,
    label: st.label,
  }));
  stimulusTokens.push({
    id: `tok_${roundNumber}_placeholder`,
    visual: '❓',
    isPlaceholder: true,
  });

  return {
    id: `q_logseq_${roundNumber}_${Date.now()}`,
    gameType: 'logical_sequence',
    roundNumber,
    promptKey: 'aptitudeChallenge.logicalSequencePrompt',
    promptFallback: 'What happens next in this story?',
    spokenPhraseKey: 'aptitudeChallenge.logicalSequencePrompt',
    stimulusLayout: 'cause_effect',
    stimulusTokens,
    options,
  };
}

// -------------------------------------------------------------
// 7. VISUAL REASONING GENERATOR (Age 7)
// -------------------------------------------------------------
interface VisualReasoningPreset {
  promptKey: string;
  promptFallback: string;
  layout: 'matrix' | 'sequence' | 'cause_effect';
  tokens: { visual: string; label?: string; isPlaceholder?: boolean }[];
  correct: { visual: string; label: string };
  distractors: { visual: string; label: string }[];
}

const VISUAL_PRESETS: VisualReasoningPreset[] = [
  {
    promptKey: 'aptitudeChallenge.visualMatrixPrompt',
    promptFallback: 'Find the missing shape in the pattern!',
    layout: 'matrix',
    tokens: [
      { visual: '🔴', label: 'Red' },
      { visual: '🟦', label: 'Blue' },
      { visual: '🔺', label: 'Red Tri' },
      { visual: '❓', isPlaceholder: true },
    ],
    correct: { visual: '🔷', label: 'Blue Dia' },
    distractors: [
      { visual: '🔴', label: 'Circle' },
      { visual: '🟢', label: 'Green' },
      { visual: '🟨', label: 'Yellow' },
    ],
  },
  {
    promptKey: 'aptitudeChallenge.visualCombinePrompt',
    promptFallback: 'Put the two halves together! What shape do they make?',
    layout: 'cause_effect',
    tokens: [
      { visual: '🌓', label: 'Half' },
      { visual: '🌗', label: 'Half' },
      { visual: '❓', isPlaceholder: true },
    ],
    correct: { visual: '🌕', label: 'Full Moon' },
    distractors: [
      { visual: '⬛', label: 'Square' },
      { visual: '🔺', label: 'Triangle' },
      { visual: '⭐', label: 'Star' },
    ],
  },
  {
    promptKey: 'aptitudeChallenge.visualSizePrompt',
    promptFallback: 'The circle is growing! What size is next?',
    layout: 'sequence',
    tokens: [
      { visual: '⚪', label: 'Small' },
      { visual: '🔘', label: 'Medium' },
      { visual: '🔴', label: 'Large' },
      { visual: '❓', isPlaceholder: true },
    ],
    correct: { visual: '🔵', label: 'Giant' },
    distractors: [
      { visual: '⬛', label: 'Square' },
      { visual: '⭐', label: 'Star' },
      { visual: '🔸', label: 'Tiny' },
    ],
  },
  {
    promptKey: 'aptitudeChallenge.visualMatchPrompt',
    promptFallback: 'Which piece is BOTH Blue AND a Triangle?',
    layout: 'sequence',
    tokens: [
      { visual: '🔵', label: 'Blue' },
      { visual: '🔺', label: 'Triangle' },
      { visual: '❓', isPlaceholder: true },
    ],
    correct: { visual: '🔷', label: 'Blue Tri' },
    distractors: [
      { visual: '🔴', label: 'Red Tri' },
      { visual: '🟦', label: 'Blue Sq' },
      { visual: '🟢', label: 'Green Tri' },
    ],
  },
  {
    promptKey: 'aptitudeChallenge.visualMatrixPrompt',
    promptFallback: 'Find the missing shape in the pattern!',
    layout: 'matrix',
    tokens: [
      { visual: '⭐', label: 'Star' },
      { visual: '🌙', label: 'Moon' },
      { visual: '☀️', label: 'Sun' },
      { visual: '❓', isPlaceholder: true },
    ],
    correct: { visual: '☁️', label: 'Cloud' },
    distractors: [
      { visual: '🚗', label: 'Car' },
      { visual: '🍕', label: 'Pizza' },
      { visual: '🐶', label: 'Dog' },
    ],
  },
  {
    promptKey: 'aptitudeChallenge.visualSizePrompt',
    promptFallback: 'Look at the color switch! What is next?',
    layout: 'sequence',
    tokens: [
      { visual: '🟢', label: 'Green' },
      { visual: '🟡', label: 'Yellow' },
      { visual: '🟢', label: 'Green' },
      { visual: '❓', isPlaceholder: true },
    ],
    correct: { visual: '🟡', label: 'Yellow' },
    distractors: [
      { visual: '🔴', label: 'Red' },
      { visual: '🔵', label: 'Blue' },
      { visual: '🟣', label: 'Purple' },
    ],
  },
];

function generateVisualReasoningRound(roundNumber: number): AptitudeQuestion {
  const available = shuffle(VISUAL_PRESETS);
  const preset = available[(roundNumber - 1) % available.length];

  const options: AptitudeOption[] = shuffle([
    {
      id: `opt_corr_${roundNumber}`,
      visual: preset.correct.visual,
      label: preset.correct.label,
      isCorrect: true,
    },
    {
      id: `opt_d1_${roundNumber}`,
      visual: preset.distractors[0].visual,
      label: preset.distractors[0].label,
      isCorrect: false,
    },
    {
      id: `opt_d2_${roundNumber}`,
      visual: preset.distractors[1].visual,
      label: preset.distractors[1].label,
      isCorrect: false,
    },
    {
      id: `opt_d3_${roundNumber}`,
      visual: preset.distractors[2].visual,
      label: preset.distractors[2].label,
      isCorrect: false,
    },
  ]);

  return {
    id: `q_visreas_${roundNumber}_${Date.now()}`,
    gameType: 'visual_reasoning',
    roundNumber,
    promptKey: preset.promptKey,
    promptFallback: preset.promptFallback,
    spokenPhraseKey: preset.promptKey,
    stimulusLayout: preset.layout,
    stimulusTokens: preset.tokens.map((t, idx) => ({
      id: `stim_${idx}`,
      visual: t.visual,
      label: t.label,
      isPlaceholder: t.isPlaceholder,
    })),
    options,
  };
}

// -------------------------------------------------------------
// MAIN SESSION GENERATOR
// -------------------------------------------------------------
export function generateAptitudeSession(gameType: AptitudeGameType): AptitudeRound[] {
  const rounds: AptitudeRound[] = [];

  for (let roundNumber = 1; roundNumber <= TOTAL_APTITUDE_ROUNDS; roundNumber++) {
    let question: AptitudeQuestion;

    switch (gameType) {
      case 'pattern_match':
        question = generatePatternMatchRound(roundNumber);
        break;
      case 'bigger_smaller':
        question = generateBiggerSmallerRound(roundNumber);
        break;
      case 'what_comes_next':
        question = generateWhatComesNextRound(roundNumber);
        break;
      case 'number_pattern':
        question = generateNumberPatternRound(roundNumber);
        break;
      case 'odd_one_out':
        question = generateOddOneOutRound(roundNumber);
        break;
      case 'logical_sequence':
        question = generateLogicalSequenceRound(roundNumber);
        break;
      case 'visual_reasoning':
        question = generateVisualReasoningRound(roundNumber);
        break;
      default:
        question = generatePatternMatchRound(roundNumber);
    }

    rounds.push({
      roundNumber,
      question,
    });
  }

  return rounds;
}

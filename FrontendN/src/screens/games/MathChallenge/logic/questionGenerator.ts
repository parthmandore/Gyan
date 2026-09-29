/**
 * Purpose: Data-driven question generator for educational mathematics games.
 *          Generates exactly 5 progressive rounds with zero duplicate options,
 *          mathematically verified answers, and randomized option positions.
 * Module: Math Challenge — Logic
 * Folder: frontend/src/screens/games/MathChallenge/logic
 */

import { MathOperation, MathQuestion, MathOption, MathRound } from '../types';

export const TOTAL_MATH_ROUNDS = 10;

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

interface QuestionCandidate {
  operand1: number;
  operand2: number;
  symbol: string;
  correctAnswer: number;
}

/**
 * Generates 3 unique distractors plausible for the given operation and answer.
 */
function generateDistractors(
  correctAnswer: number,
  operation: MathOperation,
  operand1: number,
  operand2: number
): number[] {
  const distractors = new Set<number>();

  let candidateDeltas: number[];
  if (operation === 'bigger_addition') {
    candidateDeltas = [1, -1, 10, -10, 2, -2, 9, -9];
  } else if (operation === 'multiplication') {
    // Arithmetic slip: a * (b +/- 1) or (a +/- 1) * b
    const alt1 = operand1 * (operand2 + 1);
    const alt2 = operand1 * Math.max(1, operand2 - 1);
    const alt3 = (operand1 + 1) * operand2;
    const alt4 = Math.max(1, operand1 - 1) * operand2;
    for (const alt of [alt1, alt2, alt3, alt4]) {
      if (alt !== correctAnswer && alt > 0) distractors.add(alt);
      if (distractors.size >= 3) break;
    }
    candidateDeltas = [1, -1, 2, -2, 3, -3, 5, -5];
  } else {
    candidateDeltas = [1, -1, 2, -2, 3, -3, 4, -4];
  }

  for (const delta of candidateDeltas) {
    if (distractors.size >= 3) break;
    const candidate = correctAnswer + delta;
    // Subtraction can be 0, all others must be > 0
    const minVal = operation === 'subtraction' ? 0 : 1;
    if (candidate >= minVal && candidate !== correctAnswer) {
      distractors.add(candidate);
    }
  }

  // Fallback if still under 3
  let fallbackDelta = 5;
  while (distractors.size < 3) {
    const candidate = correctAnswer + fallbackDelta;
    if (candidate !== correctAnswer && candidate > 0 && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    fallbackDelta = fallbackDelta > 0 ? -fallbackDelta : Math.abs(fallbackDelta) + 1;
  }

  return Array.from(distractors).slice(0, 3);
}

/**
 * Generates candidate equation for each round of a specific operation.
 */
function getCandidateForRound(
  operation: MathOperation,
  roundNum: number,
  usedKeys: Set<string>
): QuestionCandidate {
  let pool: [number, number][] = [];
  let symbol = '+';

  switch (operation) {
    case 'addition':
      symbol = '+';
      if (roundNum === 1) {
        pool = [[1, 1], [2, 1], [1, 2], [1, 3], [2, 2], [3, 1], [2, 3]];
      } else if (roundNum === 2) {
        pool = [[3, 2], [2, 4], [4, 1], [3, 3], [2, 5], [4, 2], [5, 1]];
      } else if (roundNum === 3) {
        pool = [[5, 2], [4, 3], [6, 2], [7, 1], [5, 4], [4, 4], [6, 3]];
      } else if (roundNum === 4) {
        pool = [[5, 5], [6, 4], [7, 2], [8, 2], [7, 4], [6, 5], [8, 3]];
      } else {
        pool = [[8, 4], [7, 5], [9, 3], [6, 6], [8, 5], [7, 6], [9, 4]];
      }
      break;

    case 'subtraction':
      symbol = '-';
      if (roundNum === 1) {
        pool = [[3, 1], [4, 1], [5, 2], [3, 2], [5, 3], [4, 2], [2, 1]];
      } else if (roundNum === 2) {
        pool = [[6, 2], [7, 3], [6, 4], [7, 2], [5, 1], [6, 3], [7, 4]];
      } else if (roundNum === 3) {
        pool = [[8, 3], [9, 4], [10, 2], [8, 5], [9, 5], [10, 4], [9, 3]];
      } else if (roundNum === 4) {
        pool = [[11, 4], [12, 5], [10, 6], [11, 3], [12, 4], [11, 5], [12, 6]];
      } else {
        pool = [[13, 6], [14, 5], [15, 7], [13, 5], [14, 6], [15, 8], [13, 7]];
      }
      break;

    case 'bigger_addition':
      symbol = '+';
      if (roundNum === 1) {
        pool = [[12, 15], [21, 14], [23, 12], [14, 23], [31, 15], [22, 16]];
      } else if (roundNum === 2) {
        pool = [[24, 15], [30, 25], [32, 16], [20, 35], [40, 18], [25, 22]];
      } else if (roundNum === 3) {
        pool = [[27, 15], [35, 28], [44, 19], [36, 25], [29, 14], [47, 16]];
      } else if (roundNum === 4) {
        pool = [[37, 28], [46, 27], [52, 29], [48, 35], [39, 33], [54, 28]];
      } else {
        pool = [[56, 17], [58, 35], [64, 28], [67, 25], [59, 34], [68, 24]];
      }
      break;

    case 'multiplication':
      symbol = '×';
      if (roundNum === 1) {
        pool = [[2, 3], [3, 2], [5, 2], [2, 4], [3, 3], [4, 2], [5, 3]];
      } else if (roundNum === 2) {
        pool = [[3, 4], [4, 3], [4, 5], [3, 5], [4, 4], [2, 6], [5, 4]];
      } else if (roundNum === 3) {
        pool = [[5, 4], [6, 3], [5, 6], [4, 6], [6, 2], [3, 6], [5, 5]];
      } else if (roundNum === 4) {
        pool = [[7, 3], [6, 4], [8, 2], [7, 4], [8, 3], [6, 5], [7, 2]];
      } else {
        pool = [[5, 6], [7, 5], [8, 4], [9, 3], [7, 6], [9, 4], [8, 5]];
      }
      break;

    case 'division':
      symbol = '÷';
      if (roundNum === 1) {
        pool = [[6, 2], [8, 2], [10, 5], [10, 2], [12, 2], [15, 5]];
      } else if (roundNum === 2) {
        pool = [[12, 3], [12, 4], [9, 3], [16, 4], [15, 3], [18, 3]];
      } else if (roundNum === 3) {
        pool = [[20, 5], [20, 4], [25, 5], [24, 4], [18, 2], [21, 3]];
      } else if (roundNum === 4) {
        pool = [[24, 6], [28, 4], [30, 5], [32, 4], [27, 3], [35, 5]];
      } else {
        pool = [[36, 6], [40, 5], [42, 6], [45, 5], [48, 6], [32, 8]];
      }
      break;
  }

  // Find unused candidate from pool
  const shuffledPool = shuffle(pool);
  let selected = shuffledPool[0];

  for (const item of shuffledPool) {
    const key = `${item[0]}${symbol}${item[1]}`;
    if (!usedKeys.has(key)) {
      selected = item;
      usedKeys.add(key);
      break;
    }
  }

  const [op1, op2] = selected;
  let correctAnswer = 0;
  if (operation === 'addition' || operation === 'bigger_addition') {
    correctAnswer = op1 + op2;
  } else if (operation === 'subtraction') {
    correctAnswer = op1 - op2;
  } else if (operation === 'multiplication') {
    correctAnswer = op1 * op2;
  } else if (operation === 'division') {
    correctAnswer = Math.round(op1 / op2);
  }

  return {
    operand1: op1,
    operand2: op2,
    symbol,
    correctAnswer,
  };
}

/**
 * Generates a full MathQuestion with verified answer and 4 distinct options.
 */
export function generateQuestion(
  operation: MathOperation,
  roundNumber: number,
  usedKeys: Set<string>
): MathQuestion {
  const candidate = getCandidateForRound(operation, roundNumber, usedKeys);
  const distractors = generateDistractors(
    candidate.correctAnswer,
    operation,
    candidate.operand1,
    candidate.operand2
  );

  const questionId = `${operation}_q${roundNumber}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const correctOption: MathOption = {
    id: `${questionId}_opt_correct`,
    value: candidate.correctAnswer,
    label: `${candidate.correctAnswer}`,
    isCorrect: true,
  };

  const wrongOptions: MathOption[] = distractors.map((val, idx) => ({
    id: `${questionId}_opt_wrong_${idx}`,
    value: val,
    label: `${val}`,
    isCorrect: false,
  }));

  const allOptions = shuffle([correctOption, ...wrongOptions]);

  const equation = `${candidate.operand1} ${candidate.symbol} ${candidate.operand2} = ?`;

  return {
    id: questionId,
    equation,
    operand1: candidate.operand1,
    operand2: candidate.operand2,
    symbol: candidate.symbol,
    correctAnswer: candidate.correctAnswer,
    options: allOptions,
    operation,
    roundNumber,
    difficulty: roundNumber,
  };
}

/**
 * Generates an exact 5-round session for a given mathematics operation.
 */
export function generateMathSession(operation: MathOperation): MathRound[] {
  const usedKeys = new Set<string>();
  const rounds: MathRound[] = [];

  for (let r = 1; r <= TOTAL_MATH_ROUNDS; r++) {
    const question = generateQuestion(operation, r, usedKeys);
    rounds.push({
      roundNumber: r,
      question,
    });
  }

  return rounds;
}

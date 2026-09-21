import { evaluateTracing, getAgeEvaluationParams } from '../accuracyEvaluator';
import { EN_LETTERS } from '../../data/enLetters';
import { Stroke } from '../../types';

export function runAccuracyEvaluatorTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      results.push(`  ✓ ${testName}`);
    } else {
      results.push(`  ✗ ${testName}`);
      allPassed = false;
    }
  }

  const letterA = EN_LETTERS.find((l) => l.char === 'A')!;

  // 1. Age Parameters Check
  const age5Params = getAgeEvaluationParams(5);
  assert(age5Params.toleranceRadius === 16, 'Age 5 tolerance radius is 16');
  assert(age5Params.passThreshold === 0.50, 'Age 5 pass threshold is 0.50');
  assert(age5Params.minPoints === 14, 'Age 5 min points is 14');

  const age6Params = getAgeEvaluationParams(6);
  assert(age6Params.toleranceRadius === 14, 'Age 6 tolerance radius is 14');
  assert(age6Params.passThreshold === 0.58, 'Age 6 pass threshold is 0.58');

  const age7Params = getAgeEvaluationParams(7);
  assert(age7Params.toleranceRadius === 12, 'Age 7 tolerance radius is 12');
  assert(age7Params.passThreshold === 0.65, 'Age 7 pass threshold is 0.65');

  // Canvas dimensions for tests
  const canvasWidth = 300;
  const canvasHeight = 300;

  // Helper to interpolate points between two coordinates
  function linePoints(x1: number, y1: number, x2: number, y2: number, count: number) {
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
    }
    return pts;
  }

  // 2. Full Valid Tracing of Letter 'A'
  // Stroke 1: (50, 15) to (20, 85) -> (150, 45) to (60, 255)
  // Stroke 2: (50, 15) to (80, 85) -> (150, 45) to (240, 255)
  // Stroke 3: (32, 58) to (68, 58) -> (96, 174) to (204, 174)
  const validStrokes: Stroke[] = [
    { points: linePoints(150, 45, 60, 255, 12) },
    { points: linePoints(150, 45, 240, 255, 12) },
    { points: linePoints(96, 174, 204, 174, 8) },
  ];

  const validResult = evaluateTracing(validStrokes, letterA, 5, canvasWidth, canvasHeight);
  assert(validResult.isSuccess === true, `Full tracing of 'A' should pass (score: ${validResult.score})`);
  assert(validResult.score >= 70, `Full tracing of 'A' should have high score (got ${validResult.score})`);

  // 3. Single-Corner Drawing Test (e.g. small circle / scribble in bottom-left corner only)
  // Only covers near (20, 85) which is (60, 255) in canvas px
  const cornerStrokes: Stroke[] = [
    {
      points: [
        { x: 60, y: 255 },
        { x: 63, y: 252 },
        { x: 66, y: 255 },
        { x: 68, y: 258 },
        { x: 65, y: 260 },
        { x: 61, y: 262 },
        { x: 58, y: 258 },
        { x: 59, y: 254 },
        { x: 63, y: 251 },
        { x: 67, y: 254 },
        { x: 65, y: 259 },
        { x: 62, y: 261 },
        { x: 58, y: 256 },
        { x: 60, y: 255 },
        { x: 64, y: 253 },
      ],
    },
  ];

  const cornerResult = evaluateTracing(cornerStrokes, letterA, 5, canvasWidth, canvasHeight);
  assert(
    cornerResult.isSuccess === false,
    `Drawing localized to bottom-left corner must fail (score: ${cornerResult.score}, success: ${cornerResult.isSuccess})`
  );

  // 4. Insufficient Points Test
  const tinyStroke: Stroke[] = [
    {
      points: [
        { x: 150, y: 45 },
        { x: 151, y: 46 },
      ],
    },
  ];
  const tinyResult = evaluateTracing(tinyStroke, letterA, 5, canvasWidth, canvasHeight);
  assert(tinyResult.isSuccess === false, 'Drawing with only 2 points should fail');
  assert(tinyResult.feedbackKey === 'letterTracing.drawMore', 'Drawing too few points returns drawMore');

  // 5. Completely Off-Target Stroke Test
  const offTargetStrokes: Stroke[] = [
    {
      points: Array.from({ length: 20 }, (_, i) => ({ x: 5 + i * 0.5, y: 5 + i * 0.5 })),
    },
  ];
  const offTargetResult = evaluateTracing(offTargetStrokes, letterA, 5, canvasWidth, canvasHeight);
  assert(offTargetResult.isSuccess === false, 'Completely off-target drawing should fail');

  return { passed: allPassed, results };
}

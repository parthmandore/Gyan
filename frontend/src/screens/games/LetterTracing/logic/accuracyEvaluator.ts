/**
 * Purpose: Tolerant, age-adaptive handwriting accuracy evaluation heuristic.
 *          Evaluates spatial coverage of reference guide points while forgiving child jitter,
 *          non-uniform stroke speed, and stroke ordering variations.
 * Module: Letter Tracing — Logic
 * Folder: frontend/src/screens/games/LetterTracing/logic
 */

import { AppAge } from '../../../../state/appLanguageStore';
import { Stroke, LetterItem, NormalizedPoint, EvaluationResult } from '../types';

export interface EvaluatorOptions {
  sampleStep?: number; // Distance in normalized units between reference sample points (default: 3)
}

/**
 * Interpolates points along a polyline segment in normalized [0, 100] coordinates.
 */
export function interpolateSegment(
  p1: NormalizedPoint,
  p2: NormalizedPoint,
  step: number = 3
): NormalizedPoint[] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= step) {
    return [p1, p2];
  }

  const count = Math.ceil(dist / step);
  const result: NormalizedPoint[] = [];

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    result.push({
      x: p1.x + dx * t,
      y: p1.y + dy * t,
    });
  }

  return result;
}

/**
 * Extracts dense sample points for all guide strokes in a letter.
 */
export function getGuideSamplePoints(
  letter: LetterItem,
  step: number = 3
): NormalizedPoint[] {
  const samplePoints: NormalizedPoint[] = [];

  for (const stroke of letter.strokes) {
    const pts = stroke.points;
    if (!pts || pts.length === 0) continue;

    if (pts.length === 1) {
      samplePoints.push(pts[0]);
      continue;
    }

    for (let i = 0; i < pts.length - 1; i++) {
      const segment = interpolateSegment(pts[i], pts[i + 1], step);
      // Skip the last point of segment to prevent duplicates, except on the last segment
      const limit = i === pts.length - 2 ? segment.length : segment.length - 1;
      for (let j = 0; j < limit; j++) {
        samplePoints.push(segment[j]);
      }
    }
  }

  return samplePoints;
}

/**
 * Age-dependent evaluation configuration parameters.
 */
export function getAgeEvaluationParams(age: AppAge): {
  toleranceRadius: number; // Euclidean distance in normalized coords [0, 100]
  passThreshold: number; // Required guide coverage ratio to pass
  minPoints: number; // Minimum drawn points required
} {
  switch (age) {
    case 5:
      return {
        toleranceRadius: 16, // Forgiving for age 5 motor instability (tightened from 18)
        passThreshold: 0.50, // 50% coverage to pass (tightened from 0.45)
        minPoints: 14,
      };
    case 6:
      return {
        toleranceRadius: 14, // Moderate tolerance (tightened from 15)
        passThreshold: 0.58, // 58% coverage to pass (tightened from 0.55)
        minPoints: 16,
      };
    case 7:
    default:
      return {
        toleranceRadius: 12, // Accurate handwriting
        passThreshold: 0.65, // 65% coverage to pass
        minPoints: 18,
      };
  }
}

/**
 * Main evaluation function.
 */
export function evaluateTracing(
  strokes: Stroke[],
  letter: LetterItem,
  age: AppAge,
  canvasWidth: number,
  canvasHeight: number,
  options?: EvaluatorOptions
): EvaluationResult {
  // Empty or invalid canvas check
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return {
      score: 0,
      coverageRatio: 0,
      isSuccess: false,
      stars: 0,
      feedbackKey: 'letterTracing.drawMore',
    };
  }

  // Count total drawn points and compute drawn path length
  let totalDrawnPoints = 0;
  let totalDrawnLength = 0;
  const normalizedDrawnPoints: NormalizedPoint[] = [];

  for (const stroke of strokes) {
    for (let i = 0; i < stroke.points.length; i++) {
      const pt = stroke.points[i];
      totalDrawnPoints++;
      normalizedDrawnPoints.push({
        x: (pt.x / canvasWidth) * 100,
        y: (pt.y / canvasHeight) * 100,
      });

      if (i > 0) {
        const prev = stroke.points[i - 1];
        const dx = ((pt.x - prev.x) / canvasWidth) * 100;
        const dy = ((pt.y - prev.y) / canvasHeight) * 100;
        totalDrawnLength += Math.hypot(dx, dy);
      }
    }
  }

  const params = getAgeEvaluationParams(age);

  // Insufficient drawing check (too few points or stroke too short)
  if (totalDrawnPoints < params.minPoints) {
    return {
      score: 0,
      coverageRatio: 0,
      isSuccess: false,
      stars: 0,
      feedbackKey: 'letterTracing.drawMore',
    };
  }

  const guideSamples = getGuideSamplePoints(letter, options?.sampleStep ?? 3);
  if (guideSamples.length === 0) {
    return {
      score: 100,
      coverageRatio: 1,
      isSuccess: true,
      stars: 3,
      feedbackKey: 'letterTracing.greatJob',
    };
  }

  // Compute reference guide length
  let referenceLength = 0;
  for (const stroke of letter.strokes) {
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i];
      const p2 = stroke.points[i + 1];
      referenceLength += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
  }

  // If drawn length is too minimal (e.g. tiny tap or dot), require drawing more
  if (totalDrawnLength < Math.max(referenceLength * 0.22, 10)) {
    return {
      score: 0,
      coverageRatio: 0,
      isSuccess: false,
      stars: 0,
      feedbackKey: 'letterTracing.drawMore',
    };
  }

  // Bounding box coverage check: strokes must roughly overlap letter bounding box
  let minGuideX = 100, maxGuideX = 0, minGuideY = 100, maxGuideY = 0;
  for (const gp of guideSamples) {
    if (gp.x < minGuideX) minGuideX = gp.x;
    if (gp.x > maxGuideX) maxGuideX = gp.x;
    if (gp.y < minGuideY) minGuideY = gp.y;
    if (gp.y > maxGuideY) maxGuideY = gp.y;
  }

  let minDrawnX = 100, maxDrawnX = 0, minDrawnY = 100, maxDrawnY = 0;
  for (const dp of normalizedDrawnPoints) {
    if (dp.x < minDrawnX) minDrawnX = dp.x;
    if (dp.x > maxDrawnX) maxDrawnX = dp.x;
    if (dp.y < minDrawnY) minDrawnY = dp.y;
    if (dp.y > maxDrawnY) maxDrawnY = dp.y;
  }

  const buffer = params.toleranceRadius;
  const isBoxOverlapping =
    maxDrawnX >= minGuideX - buffer &&
    minDrawnX <= maxGuideX + buffer &&
    maxDrawnY >= minGuideY - buffer &&
    minDrawnY <= maxGuideY + buffer;

  if (!isBoxOverlapping) {
    return {
      score: 0,
      coverageRatio: 0,
      isSuccess: false,
      stars: 0,
      feedbackKey: 'letterTracing.tryAgain',
    };
  }

  const radiusSquared = params.toleranceRadius * params.toleranceRadius;
  let coveredGuidePoints = 0;

  // Track coverage across 2x2 quadrants relative to guide bounding box center
  const midX = (minGuideX + maxGuideX) / 2;
  const midY = (minGuideY + maxGuideY) / 2;
  const guidePointsInQuadrant = [0, 0, 0, 0];
  const coveredGuidePointsInQuadrant = [0, 0, 0, 0];

  // Measure guide coverage
  for (const guidePt of guideSamples) {
    const qIndex = (guidePt.x <= midX ? 0 : 1) + (guidePt.y <= midY ? 0 : 2);
    guidePointsInQuadrant[qIndex]++;

    let isCovered = false;
    for (const drawnPt of normalizedDrawnPoints) {
      const dx = drawnPt.x - guidePt.x;
      const dy = drawnPt.y - guidePt.y;
      if (dx * dx + dy * dy <= radiusSquared) {
        isCovered = true;
        break;
      }
    }
    if (isCovered) {
      coveredGuidePoints++;
      coveredGuidePointsInQuadrant[qIndex]++;
    }
  }

  const coverageRatio = coveredGuidePoints / guideSamples.length;

  // Quadrant balance check:
  // A quadrant is considered significant if it contains at least 12% of total guide points (min 4 points)
  let significantQuadrants = 0;
  let coveredQuadrants = 0;
  for (let q = 0; q < 4; q++) {
    if (guidePointsInQuadrant[q] >= Math.max(guideSamples.length * 0.12, 4)) {
      significantQuadrants++;
      const qCoverage = coveredGuidePointsInQuadrant[q] / guidePointsInQuadrant[q];
      if (qCoverage >= 0.20) {
        coveredQuadrants++;
      }
    }
  }

  // Penalize drawings localized to one corner/quadrant
  let quadrantPenalty = 1.0;
  if (significantQuadrants >= 3 && coveredQuadrants <= 1) {
    quadrantPenalty = 0.35; // Severely penalize single-corner drawing
  } else if (significantQuadrants >= 4 && coveredQuadrants === 2) {
    quadrantPenalty = 0.80; // Moderately penalize missing half the letter
  } else if (significantQuadrants === 2 && coveredQuadrants <= 1) {
    quadrantPenalty = 0.60;
  }

  // Dimension span check: drawing must span a reasonable fraction of letter dimensions
  const guideWidth = maxGuideX - minGuideX;
  const guideHeight = maxGuideY - minGuideY;
  const drawnWidth = maxDrawnX - minDrawnX;
  const drawnHeight = maxDrawnY - minDrawnY;

  let spanPenalty = 1.0;
  if (guideWidth >= 25 && drawnWidth < guideWidth * 0.25) {
    spanPenalty *= 0.5;
  }
  if (guideHeight >= 25 && drawnHeight < guideHeight * 0.25) {
    spanPenalty *= 0.5;
  }

  // Wild scribble suppression:
  // Measure what ratio of drawn points are reasonably near the letter
  const scribbleRadiusSquared = (params.toleranceRadius + 10) * (params.toleranceRadius + 10);
  let relevantDrawnPoints = 0;

  for (const drawnPt of normalizedDrawnPoints) {
    let nearLetter = false;
    for (const guidePt of guideSamples) {
      const dx = drawnPt.x - guidePt.x;
      const dy = drawnPt.y - guidePt.y;
      if (dx * dx + dy * dy <= scribbleRadiusSquared) {
        nearLetter = true;
        break;
      }
    }
    if (nearLetter) {
      relevantDrawnPoints++;
    }
  }

  const precisionRatio = relevantDrawnPoints / totalDrawnPoints;

  // Apply precision, quadrant, and span adjustments to coverage
  let effectiveCoverage = coverageRatio * quadrantPenalty * spanPenalty;
  if (precisionRatio < 0.35) {
    effectiveCoverage = 0;
  } else if (precisionRatio < 0.50) {
    effectiveCoverage = effectiveCoverage * 0.7;
  }

  const rawScore = Math.round(effectiveCoverage * 100);
  const score = Math.min(100, Math.max(0, rawScore));
  const isSuccess = effectiveCoverage >= params.passThreshold;

  let stars = 0;
  let feedbackKey = 'letterTracing.tryAgain';

  if (isSuccess) {
    if (score >= 80) {
      stars = 3;
      feedbackKey = 'letterTracing.perfect';
    } else if (score >= 60) {
      stars = 2;
      feedbackKey = 'letterTracing.greatJob';
    } else {
      stars = 1;
      feedbackKey = 'letterTracing.greatJob';
    }
  } else if (quadrantPenalty < 1.0 || spanPenalty < 1.0) {
    feedbackKey = 'letterTracing.drawMore';
  }

  return {
    score,
    coverageRatio: effectiveCoverage,
    isSuccess,
    stars,
    feedbackKey,
  };
}

/**
 * Purpose: Age-adaptive visual guide layer for Letter Tracing.
 *          - Age 5: Bold dotted reference strokes and start dots.
 *          - Age 6: Faint reference strokes and key anchor points.
 *          - Age 7: Ruled notebook guidelines (headline, dashed midline, baseline) without letter paths.
 * Module: Letter Tracing — Components
 * Folder: frontend/src/screens/games/LetterTracing/components
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { AppAge } from '../../../../state/appLanguageStore';
import { LetterItem, NormalizedPoint } from '../types';

export interface LetterGuideProps {
  letter: LetterItem;
  age: AppAge;
  width: number;
  height: number;
}

const toPathD = (points: NormalizedPoint[], width: number, height: number): string => {
  if (!points || points.length === 0) return '';
  const scaleX = width / 100;
  const scaleY = height / 100;

  const startX = points[0].x * scaleX;
  const startY = points[0].y * scaleY;
  let d = `M ${startX.toFixed(1)} ${startY.toFixed(1)}`;

  for (let i = 1; i < points.length; i++) {
    const x = (points[i].x * scaleX).toFixed(1);
    const y = (points[i].y * scaleY).toFixed(1);
    d += ` L ${x} ${y}`;
  }

  return d;
};

export const LetterGuide: React.FC<LetterGuideProps> = React.memo(
  ({ letter, age, width, height }) => {
    if (width <= 0 || height <= 0) return null;

    const scaleX = width / 100;
    const scaleY = height / 100;

    // Age 7: Notebook guidelines only
    if (age === 7) {
      const topLineY = height * 0.20;
      const midLineY = height * 0.50;
      const baseLineY = height * 0.82;

      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={height}>
            {/* Top ascent line (faint red) */}
            <Line
              x1={10}
              y1={topLineY}
              x2={width - 10}
              y2={topLineY}
              stroke="#F87171"
              strokeWidth={2}
              strokeDasharray="4,4"
              opacity={0.6}
            />
            {/* Midline (dashed blue) */}
            <Line
              x1={10}
              y1={midLineY}
              x2={width - 10}
              y2={midLineY}
              stroke="#60A5FA"
              strokeWidth={2}
              strokeDasharray="6,6"
              opacity={0.6}
            />
            {/* Baseline (solid dark slate) */}
            <Line
              x1={10}
              y1={baseLineY}
              x2={width - 10}
              y2={baseLineY}
              stroke="#475569"
              strokeWidth={2.5}
              opacity={0.7}
            />
          </Svg>
        </View>
      );
    }

    // Age 6: Faint reference lines with distinct anchor dots
    if (age === 6) {
      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={height}>
            {/* Faint reference stroke guides */}
            {letter.strokes.map((stroke, idx) => (
              <Path
                key={`stroke-guide-${idx}`}
                d={toPathD(stroke.points, width, height)}
                stroke="#CBD5E1"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.7}
              />
            ))}

            {/* Anchor dots */}
            {letter.anchorPoints.map((anchor, idx) => {
              const cx = anchor.x * scaleX;
              const cy = anchor.y * scaleY;
              return (
                <React.Fragment key={`anchor-${idx}`}>
                  <Circle cx={cx} cy={cy} r={7} fill="#6366F1" opacity={0.85} />
                  <Circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      );
    }

    // Age 5: Guided Tracing with thick dotted lines & starting points
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          {/* Thick dotted reference guide */}
          {letter.strokes.map((stroke, idx) => (
            <Path
              key={`guide-${idx}`}
              d={toPathD(stroke.points, width, height)}
              stroke="#94A3B8"
              strokeWidth={14}
              strokeDasharray="6,10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.8}
            />
          ))}

          {/* Stroke start indicator dots */}
          {letter.strokes.map((stroke, idx) => {
            const cx = stroke.startPoint.x * scaleX;
            const cy = stroke.startPoint.y * scaleY;
            return (
              <React.Fragment key={`start-dot-${idx}`}>
                <Circle cx={cx} cy={cy} r={9} fill="#10B981" opacity={0.9} />
                <Circle cx={cx} cy={cy} r={4} fill="#FFFFFF" />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  }
);

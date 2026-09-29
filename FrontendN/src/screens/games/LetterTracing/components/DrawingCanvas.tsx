/**
 * Purpose: Responsive touchscreen drawing canvas for Letter Tracing.
 *          Captures multi-stroke finger gestures via React Native PanResponder
 *          and renders smooth Bezier curves with react-native-svg.
 * Module: Letter Tracing — Components
 * Folder: frontend/src/screens/games/LetterTracing/components
 */

import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { AppAge } from '../../../../state/appLanguageStore';
import { Stroke, TouchPoint, LetterItem } from '../types';
import { LetterGuide } from './LetterGuide';

export interface DrawingCanvasProps {
  letter: LetterItem;
  age: AppAge;
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  onCanvasLayout?: (width: number, height: number) => void;
  disabled?: boolean;
}

const buildBezierPath = (points: TouchPoint[]): string => {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${(points[0].x + 0.5).toFixed(1)} ${(points[0].y + 0.5).toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
};

export const DrawingCanvas: React.FC<DrawingCanvasProps> = React.memo(
  ({ letter, age, strokes, onStrokesChange, onCanvasLayout, disabled = false }) => {
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

    // Keep strokes ref in sync for pan responder closure
    const strokesRef = useRef<Stroke[]>(strokes);
    strokesRef.current = strokes;

    const disabledRef = useRef<boolean>(disabled);
    disabledRef.current = disabled;

    const currentStrokeRef = useRef<Stroke | null>(null);
    currentStrokeRef.current = currentStroke;

    const handleLayout = useCallback(
      (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setCanvasSize({ width, height });
          onCanvasLayout?.(width, height);
        }
      },
      [onCanvasLayout]
    );

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => !disabledRef.current,
          onMoveShouldSetPanResponder: () => !disabledRef.current,
          onPanResponderGrant: (evt) => {
            if (disabledRef.current) return;
            const { locationX, locationY } = evt.nativeEvent;
            const newStroke: Stroke = {
              points: [{ x: locationX, y: locationY, timestamp: Date.now() }],
            };
            currentStrokeRef.current = newStroke;
            setCurrentStroke(newStroke);
          },
          onPanResponderMove: (evt) => {
            if (disabledRef.current || !currentStrokeRef.current) return;
            const { locationX, locationY } = evt.nativeEvent;
            const updatedStroke: Stroke = {
              points: [
                ...currentStrokeRef.current.points,
                { x: locationX, y: locationY, timestamp: Date.now() },
              ],
            };
            currentStrokeRef.current = updatedStroke;
            setCurrentStroke(updatedStroke);
          },
          onPanResponderRelease: () => {
            if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
              const nextStrokes = [...strokesRef.current, currentStrokeRef.current];
              onStrokesChange(nextStrokes);
            }
            currentStrokeRef.current = null;
            setCurrentStroke(null);
          },
          onPanResponderTerminate: () => {
            if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
              const nextStrokes = [...strokesRef.current, currentStrokeRef.current];
              onStrokesChange(nextStrokes);
            }
            currentStrokeRef.current = null;
            setCurrentStroke(null);
          },
        }),
      [onStrokesChange]
    );

    const activeTipPoint =
      currentStroke && currentStroke.points.length > 0
        ? currentStroke.points[currentStroke.points.length - 1]
        : null;

    return (
      <View
        style={styles.canvasContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Background Guide Layer */}
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <LetterGuide
            letter={letter}
            age={age}
            width={canvasSize.width}
            height={canvasSize.height}
          />
        )}

        {/* User Drawn Strokes Layer */}
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <Svg
            width={canvasSize.width}
            height={canvasSize.height}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            {/* Committed Strokes */}
            {strokes.map((stroke, idx) => (
              <Path
                key={`committed-stroke-${idx}`}
                d={buildBezierPath(stroke.points)}
                stroke="#2563EB"
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* In-Progress Stroke */}
            {currentStroke && (
              <Path
                d={buildBezierPath(currentStroke.points)}
                stroke="#3B82F6"
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}

            {/* Glowing Touch Indicator Tip */}
            {activeTipPoint && (
              <Circle
                cx={activeTipPoint.x}
                cy={activeTipPoint.y}
                r={6}
                fill="#60A5FA"
                opacity={0.8}
              />
            )}
          </Svg>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});

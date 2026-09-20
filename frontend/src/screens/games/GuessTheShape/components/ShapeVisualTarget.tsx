/**
 * Purpose: Hero illustrated central display card for the target shape.
 *          Features large shape illustration, high-contrast outlines, subtle bounce,
 *          and age-adaptive sizing (larger for Age 7 as requested).
 * Module: Guess the Shape — Components
 * Folder: frontend/src/screens/games/GuessTheShape/components
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ShapeDefinition } from '../types';
import { ShapeSvg } from './ShapeSvg';

export interface ShapeVisualTargetProps {
  shape: ShapeDefinition;
  age?: number;
  onAudioPress?: () => void;
}

export const ShapeVisualTarget: React.FC<ShapeVisualTargetProps> = React.memo(({
  shape,
  age = 6,
  onAudioPress,
}) => {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  // Sizing: Age 7 shapes are visually larger on screen as requested
  const svgSize = age >= 7 ? 210 : 165;
  const containerMinHeight = age >= 7 ? 245 : 205;

  useEffect(() => {
    scale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 140 })
    );
    opacity.value = withTiming(1, { duration: 250 });
  }, [shape.id, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, { minHeight: containerMinHeight }, animatedStyle]}>
      {/* Target Visual Vector */}
      <View style={styles.svgWrapper}>
        <ShapeSvg
          shapeId={shape.id}
          size={svgSize}
          color={shape.color}
          strokeColor={shape.strokeColor}
          strokeWidth={4.5}
        />
      </View>

      {/* Speaker repeat audio button */}
      {onAudioPress && (
        <TouchableOpacity
          onPress={onAudioPress}
          style={styles.speakerButton}
          accessibilityLabel="Listen again"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 6,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 10,
    position: 'relative',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  speakerIcon: {
    fontSize: 20,
  },
});

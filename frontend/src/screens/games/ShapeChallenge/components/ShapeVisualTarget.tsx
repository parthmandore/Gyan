/**
 * Purpose: Hero Target Shape Display Card for Shape Challenge.
 *          Prominently displays the target geometric shape with 3D card styling,
 *          subtle breathing pulse animation, and audio repeat action.
 * Module: Shape Challenge — Components
 * Folder: frontend/src/screens/games/ShapeChallenge/components
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { ShapeItem } from '../types';
import { ShapeSvg } from './ShapeSvg';
import { triggerHapticLightImpact } from '../../../../services/hapticsService';

export interface ShapeVisualTargetProps {
  shapeItem: ShapeItem;
  learningLanguage: string;
  showWord?: boolean;
  onPressAudio?: () => void;
}

export const ShapeVisualTarget: React.FC<ShapeVisualTargetProps> = React.memo(({
  shapeItem,
  learningLanguage,
  showWord = false,
  onPressAudio,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const targetWidth = Math.min(screenWidth - 48, 280);
  const cardHeight = targetWidth * 0.65;
  const svgSize = targetWidth * 0.44;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const displayName =
    shapeItem.names[learningLanguage as 'en' | 'hi' | 'mr'] || shapeItem.names.en;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: targetWidth,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.heroCard,
          {
            height: cardHeight,
          },
        ]}
      >
        {/* Subtle background glow */}
        <View style={[styles.glowBackdrop, { backgroundColor: `${shapeItem.color}18` }]} />

        {/* Center Target SVG Shape */}
        <ShapeSvg
          shapeId={shapeItem.id}
          size={svgSize}
          color={shapeItem.color}
          strokeColor="#0F172A"
          strokeWidth={3.5}
        />

        {/* Audio Replay Button */}
        {onPressAudio && (
          <Pressable
            onPress={() => {
              triggerHapticLightImpact();
              onPressAudio();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Listen to ${displayName}`}
            style={styles.speakerButton}
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </Pressable>
        )}
      </View>

      {showWord && (
        <View style={styles.wordBadge}>
          <Text style={styles.wordText}>{displayName}</Text>
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    borderBottomColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  glowBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  speakerButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#EFF6FF',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  speakerIcon: {
    fontSize: 20,
  },
  wordBadge: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderBottomWidth: 4,
    borderBottomColor: '#60A5FA',
  },
  wordText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

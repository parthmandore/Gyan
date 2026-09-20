/**
 * Purpose: Hero Target Color Display Card for Colour Challenge.
 *          Prominently displays the target color with 3D depth, gloss highlight,
 *          and audio repeat action.
 * Module: Colour Challenge — Components
 * Folder: frontend/src/screens/games/ColourChallenge/components
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
import { ColorItem } from '../types';
import { triggerHapticLightImpact } from '../../../../services/hapticsService';

export interface ColourVisualTargetProps {
  colorItem: ColorItem;
  learningLanguage: string;
  showWord?: boolean;
  onPressAudio?: () => void;
}

export const ColourVisualTarget: React.FC<ColourVisualTargetProps> = React.memo(({
  colorItem,
  learningLanguage,
  showWord = false,
  onPressAudio,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const targetWidth = Math.min(screenWidth - 48, 300);
  const swatchHeight = targetWidth * 0.58;

  useEffect(() => {
    // Gentle breathing pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
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
    colorItem.names[learningLanguage as 'en' | 'hi' | 'mr'] || colorItem.names.en;

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
          styles.swatchHero,
          {
            height: swatchHeight,
            backgroundColor: colorItem.hex,
            borderColor: colorItem.borderHex,
          },
        ]}
      >
        {/* 3D Gloss Highlight */}
        <View style={styles.glossHighlight} />

        {/* Center Gem / Sparkle Accent */}
        <View style={styles.gemSparkle}>
          <Text style={styles.gemText}>✨</Text>
        </View>

        {/* Speaker Replay Button in corner */}
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
  swatchHero: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 4,
    borderBottomWidth: 10,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  gemSparkle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  gemText: {
    fontSize: 24,
  },
  speakerButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  speakerIcon: {
    fontSize: 22,
  },
  wordBadge: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
  },
  wordText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

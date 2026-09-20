/**
 * Purpose: Animated 3D tactile tile component for Language Pair Match (Age 6).
 *          Faithfully matches the toy-block visual language of CapitalSmallMatch:
 *          - 4 rotating tactile colors (Orange, Blue, Purple, Yellow) with 3D bevels
 *          - Responsive text sizing for English, Hindi, and Marathi words
 *          - Selected state: glow, bounce, 👆 indicator badge
 *          - Matched state: green checkmark badge, green bevel
 *          - Wrong state: gentle non-punitive shake & soft opacity fade
 *          - Drag and tap gesture support
 * Module: Language Pair Match — Components
 * Folder: frontend/src/screens/games/LanguagePairMatch/components
 */

import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  AccessibilityInfo,
  Pressable,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import { Typography } from '../../../../theme/typography';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors } from '../../../../theme/colors';
import { triggerHapticLightImpact } from '../../../../services/hapticsService';
import { MatchCard } from '../types';

export type LanguageTileState = 'default' | 'selected' | 'matched' | 'wrong';

export interface LanguageMatchTileProps {
  card: MatchCard;
  tileIndex: number;
  state: LanguageTileState;
  row: 'source' | 'target';
  width?: number;
  onPress: () => void;
  onDragStart?: (card: MatchCard, row: 'source' | 'target', startX: number, startY: number) => void;
  onDragUpdate?: (currentX: number, currentY: number) => void;
  onDragEnd?: (card: MatchCard, row: 'source' | 'target', endX: number, endY: number) => void;
  isScreenReaderActive?: boolean;
  disabled?: boolean;
}

const TILE_COLORS = [
  { bg: Colors.tile.orangeBg, bevel: Colors.tile.orangeBevel },
  { bg: '#0EA5E9', bevel: '#0284C7' },
  { bg: Colors.tile.purpleBg, bevel: Colors.tile.purpleBevel },
  { bg: Colors.tile.yellowBg, bevel: Colors.tile.yellowBevel },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const LanguageMatchTile: React.FC<LanguageMatchTileProps> = React.memo(
  ({
    card,
    tileIndex,
    state,
    row,
    width = 138,
    onPress,
    onDragStart,
    onDragUpdate,
    onDragEnd,
    isScreenReaderActive = false,
    disabled = false,
  }) => {
    const colorPair = TILE_COLORS[tileIndex % TILE_COLORS.length];

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const glowScale = useSharedValue(1);
    const shakeOffset = useSharedValue(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
      let mounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((v) => {
        if (mounted) setReduceMotion(v);
      });
      return () => {
        mounted = false;
      };
    }, []);

    // Drive animations from state transitions
    useEffect(() => {
      if (reduceMotion) {
        scale.value = 1;
        opacity.value = 1;
        glowScale.value = 1;
        shakeOffset.value = 0;
        return;
      }

      switch (state) {
        case 'selected':
          scale.value = withSpring(1.08, { damping: 10, stiffness: 200 });
          opacity.value = 1;
          shakeOffset.value = 0;
          glowScale.value = withRepeat(
            withSequence(
              withTiming(1.04, { duration: 600 }),
              withTiming(1.0, { duration: 600 })
            ),
            -1,
            true
          );
          break;

        case 'matched':
          scale.value = withSpring(1.04, { damping: 8, stiffness: 180 });
          opacity.value = 1;
          glowScale.value = 1;
          shakeOffset.value = 0;
          break;

        case 'wrong':
          // Non-punitive: gentle horizontal shake + soft opacity fade
          shakeOffset.value = withSequence(
            withTiming(-7, { duration: 60 }),
            withTiming(7, { duration: 60 }),
            withTiming(-5, { duration: 60 }),
            withTiming(5, { duration: 60 }),
            withTiming(0, { duration: 60 })
          );
          opacity.value = withSequence(
            withTiming(0.6, { duration: 150 }),
            withTiming(1, { duration: 250 })
          );
          scale.value = withSequence(
            withTiming(0.96, { duration: 150 }),
            withSpring(1, { damping: 12, stiffness: 200 })
          );
          glowScale.value = 1;
          break;

        default:
          scale.value = withSpring(1, { damping: 12, stiffness: 150 });
          opacity.value = 1;
          shakeOffset.value = 0;
          glowScale.value = withRepeat(
            withSequence(
              withTiming(1.015, { duration: 1500 }),
              withTiming(1.0, { duration: 1500 })
            ),
            -1,
            true
          );
          break;
      }
    }, [state, reduceMotion, scale, opacity, glowScale, shakeOffset]);

    const handlePressIn = () => {
      if (disabled) return;
      triggerHapticLightImpact();
      if (!reduceMotion) {
        scale.value = withSpring(0.94, { damping: 12, stiffness: 280 });
      }
    };

    const handlePressOut = () => {
      if (disabled || reduceMotion) return;
      const targetScale = state === 'selected' ? 1.08 : state === 'matched' ? 1.04 : 1;
      scale.value = withSpring(targetScale, { damping: 10, stiffness: 200 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value * glowScale.value },
        { translateX: shakeOffset.value },
      ],
      opacity: opacity.value,
    }));

    // Visual styling per state
    const getTileStyle = () => {
      switch (state) {
        case 'selected':
          return {
            backgroundColor: colorPair.bg,
            borderColor: '#38BDF8',
            borderBottomColor: colorPair.bevel,
            shadowColor: '#38BDF8',
            shadowOpacity: 0.7,
            shadowRadius: 14,
            elevation: 12,
          };
        case 'matched':
          return {
            backgroundColor: Colors.tile.correctBg,
            borderColor: '#FFFFFF',
            borderBottomColor: Colors.tile.correctBevel,
            shadowColor: Colors.tile.correctBevel,
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
          };
        default:
          return {
            backgroundColor: colorPair.bg,
            borderColor: '#FFFFFF',
            borderBottomColor: colorPair.bevel,
          };
      }
    };

    // Indicator badge
    const renderBadge = () => {
      if (state === 'selected') {
        return (
          <Animated.View style={[styles.badge, styles.selectedBadge]}>
            <Text style={styles.badgeText}>👆</Text>
          </Animated.View>
        );
      }
      if (state === 'matched') {
        return (
          <Animated.View style={[styles.badge, styles.matchedBadge]}>
            <Text style={styles.badgeText}>✓</Text>
          </Animated.View>
        );
      }
      return null;
    };

    // Accessibility
    const stateLabel =
      state === 'selected' ? 'selected' : state === 'matched' ? 'matched' : 'unmatched';
    const rowLabel = row === 'source' ? 'source language word' : 'learning language translation';
    const a11yLabel = `${card.text}, ${rowLabel}, ${stateLabel}`;

    const handleDragStartJS = (x: number, y: number) => {
      onDragStart?.(card, row, x, y);
    };

    const handleDragUpdateJS = (x: number, y: number) => {
      onDragUpdate?.(x, y);
    };

    const handleDragEndJS = (x: number, y: number) => {
      onDragEnd?.(card, row, x, y);
    };

    const panGesture = Gesture.Pan()
      .enabled(!disabled && !isScreenReaderActive)
      .onStart((e) => {
        runOnJS(handleDragStartJS)(e.absoluteX, e.absoluteY);
      })
      .onUpdate((e) => {
        runOnJS(handleDragUpdateJS)(e.absoluteX, e.absoluteY);
      })
      .onEnd((e) => {
        runOnJS(handleDragEndJS)(e.absoluteX, e.absoluteY);
      });

    return (
      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityLabel={a11yLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled, selected: state === 'selected' }}
          style={[
            styles.tile,
            { width },
            getTileStyle(),
            animatedStyle,
          ]}
        >
          {/* Top Gloss Highlight Ribbon */}
          <View style={styles.glossHighlight} />

          {/* Card Content Row */}
          <View style={styles.contentRow}>
            {card.image && row === 'source' ? (
              <Text style={styles.cardEmoji}>{card.image}</Text>
            ) : null}

            <Text
              style={styles.wordText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {card.text}
            </Text>
          </View>

          {renderBadge()}
        </AnimatedPressable>
      </GestureDetector>
    );
  }
);

LanguageMatchTile.displayName = 'LanguageMatchTile';

const styles = StyleSheet.create({
  tile: {
    height: 72,
    minHeight: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderBottomWidth: 6.5,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F2042',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    paddingHorizontal: 8,
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingHorizontal: 4,
  },
  cardEmoji: {
    fontSize: 20,
  },
  wordText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
    flexShrink: 1,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedBadge: {
    backgroundColor: '#0EA5E9',
  },
  matchedBadge: {
    backgroundColor: '#059669',
  },
  badgeText: {
    fontFamily: Typography.fonts.bold,
    color: '#FFFFFF',
    fontSize: 11,
  },
});

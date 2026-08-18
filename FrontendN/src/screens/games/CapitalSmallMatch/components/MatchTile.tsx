/**
 * Purpose: Animated match tile for Capital & Small Letter Match game.
 *          Supports default, selected, matched, wrong-flash, and hint-glow states
 *          using Reanimated shared values and the existing toy-block visual language.
 * Module: Capital Small Match — Components
 * Folder: frontend/src/screens/games/CapitalSmallMatch/components
 *
 * Non-punitive philosophy:
 *   - "wrong" state is a brief, gentle opacity fade — no red, no shake.
 *   - "selected" state uses a border glow AND scale bump (non-color indicator).
 *   - "hint" state uses a warm golden glow matching the existing highlight palette.
 */

import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, AccessibilityInfo, Pressable } from 'react-native';
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

export type MatchTileState = 'default' | 'selected' | 'matched' | 'wrong';

export interface MatchTileProps {
  letter: string;
  tileIndex: number;
  state: MatchTileState;
  row: 'capital' | 'lowercase';
  onPress: () => void;
  onDragStart?: (letter: string, row: 'capital' | 'lowercase', startX: number, startY: number) => void;
  onDragUpdate?: (currentX: number, currentY: number) => void;
  onDragEnd?: (letter: string, row: 'capital' | 'lowercase', endX: number, endY: number) => void;
  isScreenReaderActive?: boolean;
  isDimmed?: boolean;
  disabled?: boolean;
}

const TILE_COLORS = [
  { bg: Colors.tile.orangeBg, bevel: Colors.tile.orangeBevel },
  { bg: '#0EA5E9', bevel: '#0284C7' },
  { bg: Colors.tile.purpleBg, bevel: Colors.tile.purpleBevel },
  { bg: Colors.tile.yellowBg, bevel: Colors.tile.yellowBevel },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MatchTile: React.FC<MatchTileProps> = React.memo(
  ({
    letter,
    tileIndex,
    state,
    row,
    onPress,
    onDragStart,
    onDragUpdate,
    onDragEnd,
    isScreenReaderActive = false,
    isDimmed = false,
    disabled = false,
  }) => {
    const colorPair = TILE_COLORS[tileIndex % TILE_COLORS.length];

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const glowScale = useSharedValue(1);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
      let mounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((v) => {
        if (mounted) setReduceMotion(v);
      });
      return () => { mounted = false; };
    }, []);

    // Drive animations from state transitions
    useEffect(() => {
      if (reduceMotion) {
        scale.value = 1;
        opacity.value = 1;
        glowScale.value = 1;
        return;
      }

      switch (state) {
        case 'selected':
          scale.value = withSpring(1.1, { damping: 10, stiffness: 200 });
          opacity.value = 1;
          glowScale.value = withRepeat(
            withSequence(
              withTiming(1.05, { duration: 600 }),
              withTiming(1.0, { duration: 600 }),
            ),
            -1,
            true
          );
          break;

        case 'matched':
          scale.value = withSpring(1.06, { damping: 8, stiffness: 180 });
          opacity.value = 1;
          glowScale.value = 1;
          break;

        case 'wrong':
          // Non-punitive: gentle opacity fade, no red, no shake
          opacity.value = withSequence(
            withTiming(0.5, { duration: 200 }),
            withTiming(1, { duration: 300 }),
          );
          scale.value = withSequence(
            withTiming(0.95, { duration: 150 }),
            withSpring(1, { damping: 12, stiffness: 200 }),
          );
          glowScale.value = 1;
          break;

        default:
          // Idle breathing
          scale.value = withSpring(1, { damping: 12, stiffness: 150 });
          opacity.value = 1;
          glowScale.value = withRepeat(
            withSequence(
              withTiming(1.015, { duration: 1500 }),
              withTiming(1.0, { duration: 1500 }),
            ),
            -1,
            true
          );
          break;
      }
    }, [state, reduceMotion, scale, opacity, glowScale]);

    const handlePressIn = () => {
      if (disabled) return;
      triggerHapticLightImpact();
      if (!reduceMotion) {
        scale.value = withSpring(0.92, { damping: 12, stiffness: 280 });
      }
    };

    const handlePressOut = () => {
      if (disabled || reduceMotion) return;
      // Return to state-appropriate scale
      const targetScale = state === 'selected' ? 1.1 : state === 'matched' ? 1.06 : 1;
      scale.value = withSpring(targetScale, { damping: 10, stiffness: 200 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value * glowScale.value }],
      opacity: isDimmed ? 0.35 : opacity.value,
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
    const stateLabel = state === 'selected' ? 'selected'
      : state === 'matched' ? 'matched'
      : 'unmatched';
    const rowLabel = row === 'capital' ? 'capital letter' : 'lowercase letter';
    const a11yLabel = `${letter}, ${rowLabel}, ${stateLabel}`;

    const handleDragStartJS = (x: number, y: number) => {
      onDragStart?.(letter, row, x, y);
    };

    const handleDragUpdateJS = (x: number, y: number) => {
      onDragUpdate?.(x, y);
    };

    const handleDragEndJS = (x: number, y: number) => {
      onDragEnd?.(letter, row, x, y);
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
          style={[styles.tile, getTileStyle(), animatedStyle]}
        >
          <Text style={styles.letterText}>{letter}</Text>
          {renderBadge()}
        </AnimatedPressable>
      </GestureDetector>
    );
  }
);

MatchTile.displayName = 'MatchTile';

const styles = StyleSheet.create({
  tile: {
    width: 84,
    height: 84,
    minWidth: 84,
    minHeight: 84,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderBottomWidth: 7,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F2042',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  letterText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 36,
    color: Colors.tile.letterText,
    textAlign: 'center',
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
  hintBadge: {
    backgroundColor: '#D97706',
  },
  badgeText: {
    fontFamily: Typography.fonts.bold,
    color: '#FFFFFF',
    fontSize: 11,
  },
});

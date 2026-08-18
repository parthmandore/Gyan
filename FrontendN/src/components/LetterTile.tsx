/**
 * Purpose: Toy-block letter tile matching the reference image pixel-for-pixel
 *          with idle breathing pulse, tactile haptics, and reduced-motion fallbacks.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';
import { triggerHapticLightImpact } from '../services/hapticsService';

export type LetterTileState = 'default' | 'correct' | 'incorrect' | 'highlighted' | 'dimmed';

export interface LetterTileProps {
  letter: string;
  tileIndex?: number;
  state?: LetterTileState;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hidden?: boolean;
}

const REFERENCE_TILE_COLORS = [
  { bg: Colors.tile.orangeBg, bevel: Colors.tile.orangeBevel },
  { bg: Colors.tile.greenBg, bevel: Colors.tile.greenBevel },
  { bg: Colors.tile.purpleBg, bevel: Colors.tile.purpleBevel },
  { bg: Colors.tile.yellowBg, bevel: Colors.tile.yellowBevel },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const LetterTile: React.FC<LetterTileProps> = React.memo(
  ({
    letter,
    tileIndex = 0,
    state = 'default',
    onPress,
    disabled = false,
    accessibilityLabel,
    style,
    textStyle,
    hidden = false,
  }) => {
    const { t } = useTranslation();
    const tileLabel = accessibilityLabel || t('accessibility.letterLabel', { letter });

    const colorPair = REFERENCE_TILE_COLORS[tileIndex % REFERENCE_TILE_COLORS.length];

    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
      let isMounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      });
      return () => {
        isMounted = false;
      };
    }, []);

    useEffect(() => {
      if (reduceMotion) {
        scale.value = 1;
        translateY.value = 0;
        translateX.value = 0;
        return;
      }

      if (state === 'correct') {
        scale.value = withSpring(1.08, { damping: 8, stiffness: 180 });
      } else if (state === 'incorrect') {
        translateX.value = withSequence(
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 60 }),
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-3, { duration: 40 }),
          withTiming(3, { duration: 40 }),
          withTiming(0, { duration: 30 }),
        );
      } else if (state === 'highlighted') {
        scale.value = withSequence(
          withSpring(1.12, { damping: 6, stiffness: 200 }),
          withSpring(1.05, { damping: 9, stiffness: 160 }),
        );
      } else if (state === 'dimmed') {
        scale.value = withTiming(0.96, { duration: 200 });
      } else {
        // Idle breathing pulse
        translateY.value = withSpring(0, { damping: 12, stiffness: 150 });
        translateX.value = withTiming(0, { duration: 150 });
        scale.value = withRepeat(
          withSequence(
            withTiming(1.025, { duration: 1500 }),
            withTiming(1.0, { duration: 1500 }),
          ),
          -1,
          true
        );
      }
    }, [state, reduceMotion, scale, translateY, translateX]);

    const handlePressIn = () => {
      if (disabled) return;
      triggerHapticLightImpact();
      if (!reduceMotion) {
        scale.value = withSpring(0.93, { damping: 12, stiffness: 280 });
        translateY.value = withSpring(4, { damping: 12, stiffness: 280 });
      }
    };

    const handlePressOut = () => {
      if (disabled || reduceMotion) return;
      scale.value = withSpring(1, { damping: 10, stiffness: 180 });
      translateY.value = withSpring(0, { damping: 10, stiffness: 180 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
      opacity: state === 'dimmed' ? 0.5 : 1,
    }));

    const renderIndicator = () => {
      if (state === 'correct') {
        return (
          <View style={[styles.indicatorBadge, styles.correctBadge]}>
            <Text style={styles.indicatorText}>✓</Text>
          </View>
        );
      }
      if (state === 'highlighted') {
        return (
          <View style={[styles.indicatorBadge, styles.highlightBadge]}>
            <Text style={styles.indicatorText}>★</Text>
          </View>
        );
      }
      return null;
    };

    const getTileStyle = () => {
      switch (state) {
        case 'correct':
          return styles.correctTile;
        case 'highlighted':
          return styles.highlightedTile;
        default:
          return {
            backgroundColor: colorPair.bg,
            borderBottomColor: colorPair.bevel,
          };
      }
    };

    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={tileLabel}
        accessibilityRole="button"
        style={[
          styles.tileContainer,
          getTileStyle(),
          animatedStyle,
          hidden && { opacity: 0 },
          style,
        ]}
      >
        <Text style={[styles.letterText, textStyle]}>{letter}</Text>
        {renderIndicator()}
      </AnimatedPressable>
    );
  }
);

LetterTile.displayName = 'LetterTile';

const styles = StyleSheet.create({
  tileContainer: {
    width: 155,
    height: 165,
    minWidth: 76,
    minHeight: 76,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F2042',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  correctTile: {
    backgroundColor: Colors.tile.correctBg,
    borderColor: '#FFFFFF',
    borderBottomColor: Colors.tile.correctBevel,
    shadowColor: Colors.tile.correctBevel,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  highlightedTile: {
    backgroundColor: '#FDE047',
    borderColor: '#FFFFFF',
    borderBottomColor: '#CA8A04',
    shadowColor: '#EAB308',
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 12,
  },
  letterText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 68,
    color: Colors.tile.letterText,
    textAlign: 'center',
  },
  indicatorBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  correctBadge: {
    backgroundColor: '#059669',
  },
  highlightBadge: {
    backgroundColor: '#D97706',
  },
  indicatorText: {
    fontFamily: Typography.fonts.bold,
    color: '#FFFFFF',
    fontSize: 14,
  },
});

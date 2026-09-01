/**
 * Purpose: Child-friendly circular radial countdown ring timer component integrated near the audio-cue card.
 *          Features smooth SVG ring depletion, soft non-alarming colors, non-color-reliant numeric display,
 *          and reduced-motion fallbacks.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 60;
const STROKE_WIDTH = 5;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface RoundTimerProps {
  seconds: number;
  totalSeconds?: number;
  style?: ViewStyle;
}

export const RoundTimer: React.FC<RoundTimerProps> = React.memo(({ seconds, totalSeconds = 10, style }) => {
  const { t } = useTranslation();
  const [reduceMotion, setReduceMotion] = useState(false);
  const strokeDashoffset = useSharedValue(0);

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
    const fraction = Math.max(0, Math.min(1, seconds / totalSeconds));
    const targetOffset = CIRCUMFERENCE * (1 - fraction);

    if (reduceMotion) {
      strokeDashoffset.value = targetOffset;
    } else {
      strokeDashoffset.value = withTiming(targetOffset, {
        duration: 900,
        easing: Easing.linear,
      });
    }
  }, [seconds, totalSeconds, reduceMotion, strokeDashoffset]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const isLowTime = seconds <= 3;
  const strokeColor = isLowTime ? '#D97706' : Colors.primary.main;
  const textColor = isLowTime ? Colors.accent.amberDark : Colors.instructionCard.text;

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={t('accessibility.timerLabel', { seconds, defaultValue: `Timer: ${seconds} seconds remaining` })}
      accessibilityRole="timer"
      accessibilityLiveRegion="polite"
    >
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svg}>
        {/* Background Track Circle */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="rgba(37, 99, 235, 0.12)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Animated Radial Progress Circle */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>

      {/* Center Numeric Badge */}
      <View style={styles.centerBadge}>
        <Text style={[styles.secondsText, { color: textColor }]}>{seconds}</Text>
        <Text style={[styles.unitText, { color: textColor }]}>s</Text>
      </View>
    </View>
  );
});

RoundTimer.displayName = 'RoundTimer';

const styles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  centerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  secondsText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  unitText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    marginTop: 2,
    marginLeft: 1,
  },
});

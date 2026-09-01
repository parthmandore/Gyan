/**
 * Purpose: Animated mascot character component with floating idle bounce and reactive state animations.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, ViewStyle, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { BigTouchTarget } from './BigTouchTarget';
import { Colors } from '../theme/colors';

export type MascotState = 'idle' | 'celebrating' | 'encouraging';

export interface MascotCharacterProps {
  state?: MascotState;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

const AnimatedBigTouchTarget = Animated.createAnimatedComponent(BigTouchTarget);

export const MascotCharacter: React.FC<MascotCharacterProps> = React.memo(
  ({
    state = 'idle',
    onPress,
    accessibilityLabel,
    style,
  }) => {
    const { t } = useTranslation();
    const animationRef = useRef<LottieView>(null);
    const [reduceMotion, setReduceMotion] = useState(false);

    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
      let isMounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      });
      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => {
          if (isMounted) setReduceMotion(enabled);
        }
      );
      return () => {
        isMounted = false;
        subscription.remove();
      };
    }, []);

    useEffect(() => {
      if (reduceMotion) return;

      if (state === 'celebrating') {
        scale.value = withSpring(1.15, { damping: 6, stiffness: 200 });
        translateY.value = withSpring(-8, { damping: 6, stiffness: 200 });
      } else if (state === 'encouraging') {
        scale.value = withSpring(1.05, { damping: 8, stiffness: 180 });
      } else {
        // Idle floating bounce
        scale.value = withSpring(1, { damping: 10, stiffness: 150 });
        translateY.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 1500 }),
            withTiming(0, { duration: 1500 }),
          ),
          -1,
          true
        );
      }

      if (animationRef.current) {
        animationRef.current.play();
      }
    }, [state, reduceMotion, translateY, scale]);

    const animatedStyle = useAnimatedStyle(() => {
      if (reduceMotion) return {};
      return {
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
      };
    });

    const resolvedLabel = accessibilityLabel || t('accessibility.mascotCompanion');

    return (
      <AnimatedBigTouchTarget
        onPress={onPress}
        accessibilityLabel={resolvedLabel}
        accessibilityRole="button"
        accessibilityHint={t('accessibility.tapToRepeatPrompt')}
        style={[styles.container, animatedStyle, style]}
      >
        <LottieView
          ref={animationRef}
          source={{
            uri: 'https://assets5.lottiefiles.com/packages/lf20_j1adxtyb.json',
          }}
          autoPlay={!reduceMotion}
          loop={!reduceMotion && state === 'idle'}
          style={styles.lottie}
        />
      </AnimatedBigTouchTarget>
    );
  }
);

MascotCharacter.displayName = 'MascotCharacter';

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    minWidth: 84,
    minHeight: 84,
    borderRadius: 60,
    backgroundColor: Colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

/**
 * Purpose: Premium Storybook Microphone Button with animated breathing,
 *          multi-ring listening ripples, processing spinners, and success glows.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Typography } from '../../../../theme/typography';

export type MicButtonVisualState = 'idle' | 'recording' | 'processing' | 'success' | 'retry';

interface StorybookMicrophoneButtonProps {
  state: MicButtonVisualState;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const StorybookMicrophoneButton: React.FC<StorybookMicrophoneButtonProps> = React.memo(
  ({ state = 'idle', disabled = false, onPress, accessibilityLabel }) => {
    const [reduceMotion, setReduceMotion] = useState(false);

    const breathScale = useSharedValue(1);
    const ripple1Scale = useSharedValue(1);
    const ripple1Opacity = useSharedValue(0);
    const ripple2Scale = useSharedValue(1);
    const ripple2Opacity = useSharedValue(0);
    const spinnerRotation = useSharedValue(0);

    useEffect(() => {
      let isMounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
        if (isMounted) setReduceMotion(reduced);
      });

      const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
        if (isMounted) setReduceMotion(reduced);
      });

      return () => {
        isMounted = false;
        sub.remove();
      };
    }, []);

    // Handle animation state transitions
    useEffect(() => {
      if (reduceMotion) {
        breathScale.value = 1;
        ripple1Opacity.value = 0;
        ripple2Opacity.value = 0;
        return;
      }

      if (state === 'idle') {
        // Subtle inviting breathing
        breathScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        ripple1Opacity.value = withTiming(0, { duration: 200 });
        ripple2Opacity.value = withTiming(0, { duration: 200 });
      } else if (state === 'recording') {
        // Active multi-ring pulse ripples
        breathScale.value = withSpring(1.08, { damping: 8 });

        ripple1Scale.value = withRepeat(
          withTiming(1.45, { duration: 1100, easing: Easing.out(Easing.quad) }),
          -1,
          false
        );
        ripple1Opacity.value = withRepeat(
          withSequence(
            withTiming(0.65, { duration: 550 }),
            withTiming(0.0, { duration: 550 })
          ),
          -1,
          false
        );

        ripple2Scale.value = withRepeat(
          withTiming(1.65, { duration: 1400, easing: Easing.out(Easing.quad) }),
          -1,
          false
        );
        ripple2Opacity.value = withRepeat(
          withSequence(
            withTiming(0.45, { duration: 700 }),
            withTiming(0.0, { duration: 700 })
          ),
          -1,
          false
        );
      } else if (state === 'processing') {
        breathScale.value = withSpring(1.0);
        ripple1Opacity.value = withTiming(0, { duration: 200 });
        ripple2Opacity.value = withTiming(0, { duration: 200 });

        spinnerRotation.value = withRepeat(
          withTiming(360, { duration: 1200, easing: Easing.linear }),
          -1,
          false
        );
      } else if (state === 'success') {
        breathScale.value = withSpring(1.15, { damping: 5, stiffness: 220 });
        ripple1Opacity.value = withTiming(0, { duration: 200 });
        ripple2Opacity.value = withTiming(0, { duration: 200 });
      } else if (state === 'retry') {
        breathScale.value = withSpring(1.02);
        ripple1Opacity.value = withTiming(0, { duration: 200 });
        ripple2Opacity.value = withTiming(0, { duration: 200 });
      }
    }, [state, reduceMotion, breathScale, ripple1Scale, ripple1Opacity, ripple2Scale, ripple2Opacity, spinnerRotation]);

    const animatedButtonScale = useAnimatedStyle(() => ({
      transform: [{ scale: breathScale.value }],
    }));

    const animatedRipple1 = useAnimatedStyle(() => ({
      transform: [{ scale: ripple1Scale.value }],
      opacity: ripple1Opacity.value,
    }));

    const animatedRipple2 = useAnimatedStyle(() => ({
      transform: [{ scale: ripple2Scale.value }],
      opacity: ripple2Opacity.value,
    }));

    const animatedSpinner = useAnimatedStyle(() => ({
      transform: [{ rotate: `${spinnerRotation.value}deg` }],
    }));

    // Dynamic state theme colors
    let mainColor = '#F43F5E';
    let bevelColor = '#BE123C';
    let label = 'Tap & Say';
    let icon = '🎙️';

    if (state === 'recording') {
      mainColor = '#EF4444';
      bevelColor = '#B91C1C';
      label = 'Listening...';
      icon = '⏹️';
    } else if (state === 'processing') {
      mainColor = '#F59E0B';
      bevelColor = '#B45309';
      label = 'Checking...';
      icon = '⏳';
    } else if (state === 'success') {
      mainColor = '#22C55E';
      bevelColor = '#15803D';
      label = 'Great job!';
      icon = '✓';
    } else if (state === 'retry') {
      mainColor = '#FB923C';
      bevelColor = '#C2410C';
      label = 'Try Again';
      icon = '🎙️';
    }

    return (
      <View style={styles.container}>
        {/* Ripple Ring 2 (Outer) */}
        <Animated.View style={[styles.rippleRing, { backgroundColor: mainColor }, animatedRipple2]} />

        {/* Ripple Ring 1 (Inner) */}
        <Animated.View style={[styles.rippleRing, { backgroundColor: mainColor }, animatedRipple1]} />

        {/* Processing Spinner Overlay */}
        {state === 'processing' && (
          <Animated.View style={[styles.spinnerWrapper, animatedSpinner]}>
            <Svg width={136} height={136} viewBox="0 0 136 136">
              <Circle
                cx="68"
                cy="68"
                r="60"
                stroke="#FDE68A"
                strokeWidth="4"
                strokeDasharray="60 120"
                fill="none"
              />
            </Svg>
          </Animated.View>
        )}

        {/* Main 3D Interactive Button (100dp touch target >= 84dp) */}
        <Animated.View style={animatedButtonScale}>
          <Pressable
            onPress={onPress}
            disabled={disabled || state === 'processing' || state === 'success'}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.buttonCore,
              {
                backgroundColor: mainColor,
                borderBottomColor: bevelColor,
                transform: [{ translateY: pressed ? 4 : 0 }],
              },
              disabled && styles.disabled,
            ]}
          >
            {/* Top Glossy Highlight Ribbon */}
            <View style={styles.glossHighlight} />

            {/* Central Icon */}
            <Text style={styles.iconText}>{icon}</Text>

            {/* State Label Subtext */}
            <Text style={styles.labelText}>{label}</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }
);

StorybookMicrophoneButton.displayName = 'StorybookMicrophoneButton';

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  rippleRing: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  spinnerWrapper: {
    position: 'absolute',
    width: 136,
    height: 136,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCore: {
    width: 114,
    height: 114,
    minWidth: 84,
    minHeight: 84,
    borderRadius: 57,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  glossHighlight: {
    position: 'absolute',
    top: 5,
    left: 20,
    right: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  iconText: {
    fontSize: 42,
  },
  labelText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.65,
  },
});

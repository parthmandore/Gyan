/**
 * Purpose: Base pressable component enforcing minimum 84dp touch target with instant squish spring feedback,
 *          light tactile haptics on tap, and reduced-motion fallbacks.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  AccessibilityInfo,
  AccessibilityRole,
  StyleProp,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { triggerHapticLightImpact } from '../services/hapticsService';

export interface BigTouchTargetProps {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BigTouchTarget: React.FC<BigTouchTargetProps> = React.memo(
  ({
    onPress,
    disabled = false,
    accessibilityLabel,
    accessibilityRole = 'button',
    accessibilityHint,
    style,
    children,
  }) => {
    const scale = useSharedValue(1);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
      let isMounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      });

      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => {
          if (isMounted) {
            setReduceMotion(enabled);
          }
        }
      );

      return () => {
        isMounted = false;
        subscription.remove();
      };
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      if (reduceMotion) {
        return {};
      }
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = () => {
      if (!disabled) {
        triggerHapticLightImpact();
        if (!reduceMotion) {
          scale.value = withSpring(0.92, { damping: 10, stiffness: 350 });
        }
      }
    };

    const handlePressOut = () => {
      if (!disabled && !reduceMotion) {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
      }
    };

    const handlePress = () => {
      if (disabled) return;
      // Central fix for web aria-hidden warning: blur active element on press
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
      onPress?.();
    };

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        style={[styles.baseTarget, style, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }
);

BigTouchTarget.displayName = 'BigTouchTarget';

const styles = StyleSheet.create({
  baseTarget: {
    minWidth: 84,
    minHeight: 84,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});

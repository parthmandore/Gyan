/**
 * Purpose: Flying star reward animation following a dynamic quadratic Bezier curve arc trajectory.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';

export interface FlyingStarOverlayProps {
  visible: boolean;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  onComplete?: () => void;
}

export const FlyingStarOverlay: React.FC<FlyingStarOverlayProps> = React.memo(
  ({
    visible,
    startX = 180,
    startY = 420,
    endX = 295,
    endY = 28,
    onComplete,
  }) => {
    const progress = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
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
      if (!visible) {
        opacity.value = 0;
        scale.value = 1;
        progress.value = 0;
        return;
      }

      progress.value = 0;
      scale.value = 1.3;
      opacity.value = 1;

      if (reduceMotion) {
        if (onComplete) onComplete();
        return;
      }

      // 750ms Quadratic Bezier Curve Arc Trajectory
      progress.value = withTiming(1, {
        duration: 750,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      scale.value = withSequence(
        withSpring(1.55, { damping: 6, stiffness: 220 }),
        withTiming(0.75, { duration: 400 }),
      );

      const timer = setTimeout(() => {
        opacity.value = 0;
        if (onComplete) onComplete();
      }, 760);

      return () => clearTimeout(timer);
    }, [visible, startX, startY, endX, endY, reduceMotion, onComplete, progress, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => {
      const t = progress.value;

      // Quadratic Bezier Curve Control Point arcing left and upward
      const controlX = Math.min(startX, endX) - 55;
      const controlY = (startY + endY) / 2 - 70;

      // Quadratic Bezier Formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const currX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
      const currY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

      // Dynamic rotation arcing from 0° -> -25° -> +15°
      const rotation = interpolate(t, [0, 0.5, 1], [0, -25, 15]);

      return {
        position: 'absolute',
        left: currX,
        top: currY,
        opacity: opacity.value,
        transform: [
          { scale: scale.value },
          { rotate: `${rotation}deg` },
        ],
        zIndex: 250,
      };
    });

    if (!visible) return null;

    return (
      <Animated.View style={animatedStyle} pointerEvents="none">
        <Text style={styles.starText}>⭐</Text>
      </Animated.View>
    );
  }
);

FlyingStarOverlay.displayName = 'FlyingStarOverlay';

const styles = StyleSheet.create({
  starText: {
    fontSize: 44,
    textShadowColor: 'rgba(253, 224, 71, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

/**
 * Purpose: Celebration overlay shown after a correct answer or full round completion,
 *          featuring star burst, confetti, and configurable title/subtitle text.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export interface CelebrationOverlayProps {
  visible: boolean;
  onAnimationComplete?: () => void;
  titleText?: string;
  subtitleText?: string;
  isBigCelebration?: boolean;
  style?: ViewStyle;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = React.memo(
  ({ visible, onAnimationComplete, titleText, subtitleText, isBigCelebration = false, style }) => {
    const { t } = useTranslation();
    const [reduceMotion, setReduceMotion] = useState(false);
    const lottieRef = useRef<LottieView>(null);

    const starScale = useSharedValue(0);
    const starOpacity = useSharedValue(0);
    const textScale = useSharedValue(0.5);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
      let isMounted = true;
      const checkMotion = async () => {
        const isReduced = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) setReduceMotion(isReduced);
      };
      checkMotion();
      return () => {
        isMounted = false;
        starScale.value = 0;
        starOpacity.value = 0;
        textScale.value = 0.5;
        textOpacity.value = 0;
      };
    }, [starScale, starOpacity, textScale, textOpacity]);

    useEffect(() => {
      if (!visible) {
        starScale.value = 0;
        starOpacity.value = 0;
        textScale.value = 0.5;
        textOpacity.value = 0;
        return;
      }

      if (reduceMotion) {
        starScale.value = 1;
        starOpacity.value = 1;
        textScale.value = 1;
        textOpacity.value = 1;
        return;
      }

      // High impact Star-burst entrance animation
      starOpacity.value = withTiming(1, { duration: 180 });
      starScale.value = withSequence(
        withSpring(isBigCelebration ? 1.8 : 1.5, { damping: 6, stiffness: 220 }),
        withSpring(isBigCelebration ? 1.3 : 1.1, { damping: 10, stiffness: 160 }),
      );

      // Text pop-in with spring bounce
      textOpacity.value = withTiming(1, { duration: 250 });
      textScale.value = withSequence(
        withTiming(0.4, { duration: 0 }),
        withSpring(1.25, { damping: 8, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 140 }),
      );

      if (lottieRef.current) {
        lottieRef.current.play();
      }
    }, [visible, reduceMotion, isBigCelebration, starScale, starOpacity, textScale, textOpacity]);

    const starAnimatedStyle = useAnimatedStyle(() => ({
      opacity: starOpacity.value,
      transform: [{ scale: starScale.value }],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
      opacity: textOpacity.value,
      transform: [{ scale: textScale.value }],
    }));

    if (!visible) return null;

    const displayTitle = titleText || (isBigCelebration ? 'Round Complete!' : t('game.correct'));

    return (
      <View
        style={[styles.overlay, style]}
        accessibilityLabel={displayTitle}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        {!reduceMotion && (
          <LottieView
            ref={lottieRef}
            source={{
              uri: 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json',
            }}
            autoPlay={false}
            loop={false}
            style={[styles.confettiLottie, isBigCelebration && styles.bigConfetti]}
            onAnimationFinish={() => {
              if (onAnimationComplete) {
                onAnimationComplete();
              }
            }}
          />
        )}

        <Animated.View style={[styles.starBurst, starAnimatedStyle]}>
          <Text style={styles.starEmoji}>{isBigCelebration ? '🌟 ⭐ 🌟' : '⭐'}</Text>
        </Animated.View>

        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.correctText}>{displayTitle}</Text>
          {subtitleText ? (
            <Text style={styles.subtitleText}>{subtitleText}</Text>
          ) : (
            <Text style={styles.checkmarkText}>✓</Text>
          )}
        </Animated.View>
      </View>
    );
  }
);

CelebrationOverlay.displayName = 'CelebrationOverlay';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.celebration.overlayBg,
    zIndex: 100,
  },
  confettiLottie: {
    ...StyleSheet.absoluteFill,
    zIndex: 101,
    transform: [{ scale: 1.15 }],
  },
  bigConfetti: {
    transform: [{ scale: 1.5 }],
  },
  starBurst: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 102,
  },
  starEmoji: {
    fontSize: 54,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    zIndex: 102,
    backgroundColor: Colors.celebration.badgeBg,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.celebration.badgeBorder,
    shadowColor: Colors.celebration.badgeBorder,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  correctText: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.lg,
    color: Colors.celebration.badgeText,
  },
  subtitleText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.celebration.badgeText,
    marginTop: 4,
  },
  checkmarkText: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.md,
    color: Colors.celebration.badgeText,
    marginLeft: 6,
  },
});

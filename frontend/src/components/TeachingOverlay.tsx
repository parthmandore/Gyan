/**
 * Purpose: Reusable Disney / Khan Academy Kids style recognition teaching popup
 *          consuming active dataset for capital letters, small letters, and numbers.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';

import { BigTouchTarget } from './BigTouchTarget';
import { Typography } from '../theme/typography';
import { useAlphabetMatchingStore } from '../screens/games/AlphabetMatching/store/alphabetMatchingStore';
import { useAppLanguageStore } from '../state/appLanguageStore';

export const TEACHING_OVERLAY_TIMEOUT_MS = 4500;

export interface TeachingOverlayProps {
  visible: boolean;
  targetLetter: string;
  onDismiss: () => void;
  titleText?: string;
  buttonText?: string;
  style?: ViewStyle;
}

export const TeachingOverlay: React.FC<TeachingOverlayProps> = React.memo(
  ({
    visible,
    targetLetter,
    onDismiss,
    titleText,
    buttonText,
    style,
  }) => {
    const { t } = useTranslation();
    const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
    const [reduceMotion, setReduceMotion] = useState(false);

    const mode = useAlphabetMatchingStore((s) => s.mode);

    const displaySymbol = targetLetter || '';
    const teachingText = mode === 'numbers'
      ? t('alphabetMatching.teachingNumber', { letter: displaySymbol, lng: motherTongue, defaultValue: `This is number ${displaySymbol}` })
      : t('alphabetMatching.teachingLetter', { letter: displaySymbol, lng: motherTongue, defaultValue: `This is the letter ${displaySymbol}` });
    const audioPhraseText = `${teachingText}.`;

    const hasDismissedRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cardScale = useSharedValue(0.85);
    const cardOpacity = useSharedValue(0);
    const mascotBounce = useSharedValue(1);

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

    const safeDismiss = useCallback(() => {
      if (hasDismissedRef.current) return;
      hasDismissedRef.current = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onDismiss();
    }, [onDismiss]);

    useEffect(() => {
      if (!visible) {
        cardScale.value = 0.85;
        cardOpacity.value = 0;
        mascotBounce.value = 1;
        hasDismissedRef.current = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      hasDismissedRef.current = false;

      if (reduceMotion) {
        cardOpacity.value = 1;
        cardScale.value = 1;
      } else {
        cardOpacity.value = withTiming(1, { duration: 250 });
        cardScale.value = withSpring(1, { damping: 12, stiffness: 160 });

        mascotBounce.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 500 }),
            withTiming(1.0, { duration: 500 })
          ),
          -1,
          true
        );
      }

      // Speak active dataset teaching phrase: "This is the letter T" or "This is number 7"
      try {
        const { speakPhrase } = require('../services/speechService');
        speakPhrase(audioPhraseText, { language: motherTongue });
      } catch (e) {
        console.warn('[TeachingOverlay] Speech playback failed:', e);
      }

      timerRef.current = setTimeout(() => {
        safeDismiss();
      }, TEACHING_OVERLAY_TIMEOUT_MS);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [
      visible,
      targetLetter,
      audioPhraseText,
      motherTongue,
      reduceMotion,
      safeDismiss,
      cardScale,
      cardOpacity,
      mascotBounce,
    ]);

    const cardAnimatedStyle = useAnimatedStyle(() => {
      if (reduceMotion) {
        return { opacity: 1, transform: [{ scale: 1 }] };
      }
      return {
        opacity: cardOpacity.value,
        transform: [{ scale: cardScale.value }],
      };
    });

    const mascotAnimatedStyle = useAnimatedStyle(() => {
      if (reduceMotion) return {};
      return {
        transform: [{ scale: mascotBounce.value }],
      };
    });

    if (!visible) return null;

    const resolvedTitle = titleText || t('game.tryTogether');
    const resolvedButtonText = buttonText || t('game.gotIt');

    return (
      <View
        style={[styles.overlay, style]}
        accessibilityLabel={t('accessibility.learningMoment', { phrase: audioPhraseText })}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {/* Mascot Companion Badge Header */}
          <Animated.View style={[styles.mascotBadge, mascotAnimatedStyle]}>
            <Text style={styles.mascotEmoji}>🐻</Text>
          </Animated.View>

          <Text style={styles.headerTitle}>{resolvedTitle}</Text>

          {/* Large Glossy 3D Cartoon Symbol Block */}
          <View style={styles.letterBlockContainer}>
            <View style={styles.innerHighlightRibbon} />
            <Text style={styles.letterBlockText}>{displaySymbol}</Text>
          </View>

          {/* Dataset-Driven Recognition Text */}
          <Text style={styles.exampleText}>
            {teachingText}
          </Text>

          {/* "Try Again" / "Got it!" Button */}
          <BigTouchTarget
            onPress={safeDismiss}
            accessibilityLabel={t('accessibility.gotItContinue')}
            accessibilityRole="button"
            style={styles.dismissButton}
          >
            <Text style={styles.dismissButtonText}>{resolvedButtonText}</Text>
          </BigTouchTarget>
        </Animated.View>
      </View>
    );
  }
);

TeachingOverlay.displayName = 'TeachingOverlay';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 300,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    borderWidth: 4,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  mascotBadge: {
    position: 'absolute',
    top: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDE047',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  mascotEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: '#0F2042',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  letterBlockContainer: {
    width: 125,
    height: 130,
    borderRadius: 26,
    backgroundColor: '#38BDF8',
    borderColor: '#FFFFFF',
    borderWidth: 4,
    borderBottomWidth: 8,
    borderBottomColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  innerHighlightRibbon: {
    position: 'absolute',
    top: 4,
    left: 6,
    right: 6,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  letterBlockText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 68,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  exampleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#0F2042',
    textAlign: 'center',
    marginBottom: 20,
  },
  dismissButton: {
    width: '100%',
    height: 56,
    minHeight: 84,
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dismissButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
});

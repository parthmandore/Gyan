/**
 * Purpose: Reusable, shared tutorial overlay component for all learning games.
 *          Features multi-step animated cards, auto-spoken TTS narration, persisted
 *          per-game seen tracking (AsyncStorage), 84dp+ touch targets, and skip/replay controls.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useAppLanguageStore } from '../state/appLanguageStore';

import { BigTouchTarget } from './BigTouchTarget';
import { MascotCharacter } from './MascotCharacter';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { speakPhrase, stopSpeech } from '../services/speechService';
import { markTutorialSeen } from '../services/tutorialService';

export interface TutorialStep {
  titleKey?: string;
  bodyKey?: string;
  defaultTitle: string;
  defaultBody: string;
  icon?: string;
  narrationText?: string;
}

export interface TutorialOverlayProps {
  gameId: string;
  visible: boolean;
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = React.memo(
  ({ gameId, visible, steps, onComplete, onSkip }) => {
    const { t } = useTranslation();
    const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
    const { width: screenWidth } = useWindowDimensions();

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    // Entrance Animation Values
    const cardScale = useSharedValue(0.85);
    const cardOpacity = useSharedValue(0);

    useEffect(() => {
      let mounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      });
      return () => { mounted = false; };
    }, []);

    // Speak narration and trigger entrance animation whenever step changes
    useEffect(() => {
      if (!visible || steps.length === 0) return;

      const step = steps[currentStepIndex];
      if (step) {
        const title = step.titleKey ? t(step.titleKey, { defaultValue: step.defaultTitle, lng: motherTongue }) : step.defaultTitle;
        const body = step.bodyKey ? t(step.bodyKey, { defaultValue: step.defaultBody, lng: motherTongue }) : step.defaultBody;
        const speechText = step.narrationText || `${title}. ${body}`;

        speakPhrase(speechText, { language: motherTongue }).catch((err) => {
          console.warn('[TutorialOverlay] Audio narration failed:', err);
        });
      }

      if (!reduceMotion) {
        cardOpacity.value = 0;
        cardScale.value = 0.85;
        cardOpacity.value = withTiming(1, { duration: 250 });
        cardScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      } else {
        cardOpacity.value = 1;
        cardScale.value = 1;
      }
    }, [visible, currentStepIndex, steps, reduceMotion, t, cardOpacity, cardScale]);

    const handleSkip = useCallback(async () => {
      stopSpeech();
      await markTutorialSeen(gameId);
      onSkip();
    }, [gameId, onSkip]);

    const handleNext = useCallback(async () => {
      stopSpeech();
      if (currentStepIndex + 1 < steps.length) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        // Last step complete
        await markTutorialSeen(gameId);
        onComplete();
      }
    }, [currentStepIndex, steps.length, gameId, onComplete]);

    const cardAnimStyle = useAnimatedStyle(() => ({
      opacity: cardOpacity.value,
      transform: [{ scale: cardScale.value }],
    }));

    if (!visible || steps.length === 0) return null;

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;
    const cardWidth = Math.min(screenWidth - 32, 420);

    const title = currentStep.titleKey ? t(currentStep.titleKey, currentStep.defaultTitle) : currentStep.defaultTitle;
    const body = currentStep.bodyKey ? t(currentStep.bodyKey, currentStep.defaultBody) : currentStep.defaultBody;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSkip}
      >
        <View
          style={styles.backdrop}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <Animated.View style={[styles.card, { width: cardWidth }, cardAnimStyle]}>
            {/* Top Row: Mascot & Skip Button */}
            <View style={styles.topRow}>
              <View style={styles.mascotWrapper}>
                <MascotCharacter state="encouraging" style={styles.mascot} />
              </View>

              <BigTouchTarget
                onPress={handleSkip}
                accessibilityLabel="Skip tutorial"
                accessibilityRole="button"
                style={styles.skipButton}
              >
                <Text style={styles.skipButtonText}>Skip ✕</Text>
              </BigTouchTarget>
            </View>

            {/* Step Icon / Badge */}
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>{currentStep.icon || '💡'}</Text>
            </View>

            {/* Step Content */}
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.bodyText}>{body}</Text>

            {/* Progress Dots */}
            <View style={styles.dotsRow}>
              {steps.map((_, idx) => (
                <View
                  key={`dot-${idx}`}
                  style={[
                    styles.dot,
                    idx === currentStepIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            {/* Action Button: Next / Got It! */}
            <BigTouchTarget
              onPress={handleNext}
              accessibilityLabel={isLastStep ? 'Complete tutorial' : 'Next step'}
              accessibilityRole="button"
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'Got it! ▶' : 'Next ➔'}
              </Text>
            </BigTouchTarget>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

TutorialOverlay.displayName = 'TutorialOverlay';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 200,
  },
  card: {
    backgroundColor: Colors.teaching.cardBg,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: Colors.teaching.cardBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  mascotWrapper: {
    width: 60,
    height: 60,
  },
  mascot: {
    width: 60,
    height: 60,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 48,
    minHeight: 48,
    minWidth: 84,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: 14,
    color: Colors.neutral.textMuted,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#93C5FD',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 32,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: Colors.teaching.headerText,
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: Colors.neutral.textDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary.main,
  },
  nextButton: {
    width: '100%',
    height: 60,
    minHeight: 84,
    backgroundColor: Colors.teaching.buttonBg,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 6,
    borderBottomColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: Colors.teaching.buttonText,
  },
});

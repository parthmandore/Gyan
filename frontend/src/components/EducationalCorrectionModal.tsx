/**
 * Purpose: Child-friendly educational correction modal for early learning.
 *          When a child chooses an incorrect answer on Attempt 1, this modal appears,
 *          explaining what was chosen and showing the correct answer with TTS audio cue,
 *          then invites the child to try again on Attempt 2.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useAppLanguageStore } from '../state/appLanguageStore';
import { Typography } from '../theme/typography';

export interface EducationalCorrectionModalProps {
  visible: boolean;
  targetValue?: string;
  targetWord?: string;
  selectedWrongValue?: string;
  spokenWord?: string;
  explanation?: string;
  promptFallback?: string;
  itemEmoji?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const EducationalCorrectionModal: React.FC<EducationalCorrectionModalProps> = React.memo(
  ({
    visible,
    targetValue,
    targetWord,
    selectedWrongValue,
    spokenWord,
    explanation,
    promptFallback,
    itemEmoji,
    onDismiss,
    onRetry,
  }) => {
    const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
    const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const actualTarget = targetValue || targetWord || '';
    const actualWrong = selectedWrongValue || spokenWord || '';
    const actualExplanation = explanation || promptFallback || '';
    const dismissHandler = onDismiss || onRetry || (() => {});

    const handleDismiss = () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
      try {
        Speech.stop();
      } catch (e) {
        // ignore
      }
      dismissHandler();
    };

    useEffect(() => {
      if (visible) {
        // Prepare audio feedback text
        let spokenText = '';
        if (motherTongue === 'hi') {
          spokenText = `कोई बात नहीं! सही उत्तर है: ${actualTarget}। फिर से कोशिश करो!`;
        } else if (motherTongue === 'mr') {
          spokenText = `काही हरकत नाही! योग्य उत्तर आहे: ${actualTarget}। पुन्हा प्रयत्न करा!`;
        } else {
          spokenText = `Not quite! The correct answer is ${actualTarget}. Try again!`;
        }

        try {
          Speech.stop();
          Speech.speak(spokenText, {
            language: motherTongue === 'mr' ? 'mr-IN' : motherTongue === 'hi' ? 'hi-IN' : 'en-US',
            rate: 0.85,
            pitch: 1.1,
          });
        } catch (err) {
          // ignore speech error
        }

        // Auto dismiss after 5.5 seconds if child doesn't tap
        autoDismissTimerRef.current = setTimeout(() => {
          handleDismiss();
        }, 5500);
      } else {
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
          autoDismissTimerRef.current = null;
        }
        try {
          Speech.stop();
        } catch (e) {
          // ignore
        }
      }

      return () => {
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
        }
        try {
          Speech.stop();
        } catch (e) {
          // ignore
        }
      };
    }, [visible, actualTarget, motherTongue]);

    if (!visible) return null;

    const modalTitle =
      motherTongue === 'hi'
        ? 'चलो मिलकर सीखें! 💡'
        : motherTongue === 'mr'
        ? 'चला एकत्र शिकूया! 💡'
        : "Let's Learn Together! 💡";

    const buttonLabel =
      motherTongue === 'hi'
        ? 'फिर से कोशिश करो! 🌱'
        : motherTongue === 'mr'
        ? 'पुन्हा प्रयत्न करा! 🌱'
        : 'Try Again! 🌱';

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View style={styles.backdrop}>
          <View style={styles.cardContainer}>
            {/* Header Badge */}
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{modalTitle}</Text>
            </View>

            {/* Optional Central Emoji */}
            {itemEmoji ? (
              <Text style={styles.centralEmoji}>{itemEmoji}</Text>
            ) : (
              <Text style={styles.centralEmoji}>🌱</Text>
            )}

            {/* Answers Comparison Box */}
            <View style={styles.comparisonBox}>
              {actualWrong ? (
                <View style={styles.chosenRow}>
                  <Text style={styles.crossIcon}>❌</Text>
                  <Text style={styles.chosenLabel}>
                    {motherTongue === 'hi'
                      ? `आपने चुना: `
                      : motherTongue === 'mr'
                      ? `तुम्ही निवडले: `
                      : `You chose: `}
                    <Text style={styles.chosenValue}>{actualWrong}</Text>
                  </Text>
                </View>
              ) : null}

              <View style={styles.correctRow}>
                <Text style={styles.checkIcon}>✅</Text>
                <Text style={styles.correctLabel}>
                  {motherTongue === 'hi'
                    ? `सही उत्तर: `
                    : motherTongue === 'mr'
                    ? `योग्य उत्तर: `
                    : `Correct: `}
                  <Text style={styles.correctValue}>{actualTarget}</Text>
                </Text>
              </View>

              {actualExplanation ? (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>{actualExplanation}</Text>
                </View>
              ) : null}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleDismiss}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={buttonLabel}
            >
              <Text style={styles.retryButtonText}>{buttonLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

EducationalCorrectionModal.displayName = 'EducationalCorrectionModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  headerBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 12,
  },
  headerBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: '#4338CA',
  },
  centralEmoji: {
    fontSize: 48,
    marginVertical: 8,
  },
  comparisonBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chosenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  crossIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  chosenLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: '#991B1B',
    fontWeight: '600',
  },
  chosenValue: {
    fontWeight: '800',
    textDecorationLine: 'line-through',
  },
  correctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  correctLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: '#166534',
    fontWeight: '600',
  },
  correctValue: {
    fontWeight: '800',
  },
  explanationBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  explanationText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  retryButton: {
    width: '100%',
    minHeight: 54,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  retryButtonText: {
    fontFamily: Typography.fonts.bold,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Typography.sizes.sm,
  },
});

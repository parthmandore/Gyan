/**
 * Purpose: Dedicated, standardized 2-button quit confirmation modal across all Gyan educational games.
 * Features:
 * - Exactly two buttons: "Continue Playing" (green) and "Exit Game" (red outline)
 * - Dynamic motivational coaching message based on remaining/completed rounds
 * - Fully localized with fallback safeguards (no raw i18next keys)
 * - Responsive layout for phones of all sizes
 * - Safe touch targets and proper accessibility roles
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BigTouchTarget } from './BigTouchTarget';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

export interface QuitGameModalProps {
  visible: boolean;
  onContinue: () => void;
  onExit: () => void;
  gameTitle?: string;
  currentRound?: number;
  totalRounds?: number;
  description?: string;
  style?: StyleProp<ViewStyle>;
}

export const QuitGameModal: React.FC<QuitGameModalProps> = React.memo(
  ({
    visible,
    onContinue,
    onExit,
    gameTitle,
    currentRound,
    totalRounds,
    description,
    style,
  }) => {
    const { t } = useTranslation();
    const { width: windowWidth } = useWindowDimensions();
    const maxModalWidth = Math.min(windowWidth - 36, 380);

    // Compute dynamic child-friendly motivational message
    const motivationalMessage = useMemo(() => {
      if (currentRound !== undefined && totalRounds !== undefined && totalRounds > 0) {
        const done = Math.max(0, currentRound - 1);
        const remaining = Math.max(1, totalRounds - done);

        if (remaining === 1) {
          return t('game.quitMotivationAlmost', {
            remaining: 1,
            defaultValue: 'Almost there — just 1 more round! 🎯',
          });
        }
        if (remaining <= 2) {
          return t('game.quitMotivationAlmostPlural', {
            remaining,
            defaultValue: `Almost there — just ${remaining} more rounds! 🎯`,
          });
        }
        if (done >= Math.floor(totalRounds / 2) && done > 0) {
          return t('game.quitMotivationHalfway', {
            done,
            total: totalRounds,
            defaultValue: `You've completed ${done} of ${totalRounds} rounds! Don't give up! 💪`,
          });
        }
        if (done > 0) {
          return t('game.quitMotivationEarly', {
            defaultValue: "You're doing great! Keep going! 🌟",
          });
        }
      }
      return t('game.quitMotivationDefault', {
        defaultValue: 'Every round makes you smarter! Keep playing! 🧠',
      });
    }, [currentRound, totalRounds, t]);

    const titleText = t('game.quitTitle', { defaultValue: 'Leave Game?' });
    const confirmMessage =
      description ||
      t('game.quitMessage', {
        defaultValue: "Are you sure? Your progress in this session won't be saved.",
      });

    const continueBtnLabel = t('game.continuePlaying', {
      defaultValue: t('game.keepPlaying', { defaultValue: 'Continue Playing' }),
    });

    const exitBtnLabel = t('game.exitGame', {
      defaultValue: t('game.quitGame', { defaultValue: 'Exit Game' }),
    });

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onContinue}
        statusBarTranslucent
      >
        <View
          style={styles.backdrop}
          accessibilityViewIsModal={true}
          aria-modal={true}
          role="dialog"
        >
          <View
            style={[styles.modalCard, { width: maxModalWidth }, style]}
            accessibilityLabel={titleText}
            accessibilityRole="alert"
          >
            {/* Friendly Mascot Badge */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🌟</Text>
            </View>

            {/* Optional Game Title Pill */}
            {gameTitle ? (
              <View style={styles.gameBadge}>
                <Text style={styles.gameBadgeText} numberOfLines={1}>
                  {gameTitle}
                </Text>
              </View>
            ) : null}

            {/* Main Modal Title */}
            <Text style={styles.titleText}>{titleText}</Text>

            {/* Motivational Encouragement Pill */}
            <View style={styles.motivationPill}>
              <Text style={styles.motivationText}>{motivationalMessage}</Text>
            </View>

            {/* Confirmation Question */}
            <Text style={styles.confirmText}>{confirmMessage}</Text>

            {/* Action Buttons: EXACTLY TWO BUTTONS */}
            <View style={styles.actionsContainer}>
              {/* 1. Continue Playing (Primary / Green) */}
              <BigTouchTarget
                onPress={onContinue}
                accessibilityLabel={continueBtnLabel}
                accessibilityRole="button"
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>
                  ▶  {continueBtnLabel}
                </Text>
              </BigTouchTarget>

              {/* 2. Exit Game (Secondary / Gentle Red Outline) */}
              <BigTouchTarget
                onPress={onExit}
                accessibilityLabel={exitBtnLabel}
                accessibilityRole="button"
                style={styles.exitButton}
              >
                <Text style={styles.exitButtonText}>
                  🚪  {exitBtnLabel}
                </Text>
              </BigTouchTarget>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

QuitGameModal.displayName = 'QuitGameModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.neutral.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.neutral.surface,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconEmoji: {
    fontSize: 30,
  },
  gameBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  gameBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  motivationPill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    width: '100%',
  },
  motivationText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmText: {
    fontFamily: Typography.fonts.regular,
    fontSize: 14,
    color: Colors.neutral.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  continueButton: {
    width: '100%',
    minWidth: '100%',
    minHeight: 52,
    height: 54,
    backgroundColor: '#10B981',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exitButton: {
    width: '100%',
    minWidth: '100%',
    minHeight: 48,
    height: 50,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1.5,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});

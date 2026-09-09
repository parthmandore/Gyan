/**
 * Purpose: Interactive Detailed Speech Report Modal for children & parents.
 *          Displays accuracy %, summary stats, and detailed item-by-item Expected vs Heard results.
 * Module: Speech Word Challenge — Components
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SpeechRoundAttempt } from '../types';
import { Typography } from '../../../../theme/typography';
import { BigTouchTarget } from '../../../../components/BigTouchTarget';
import { useAppLanguageStore } from '../../../../state/appLanguageStore';

interface SpeechReportModalProps {
  visible: boolean;
  onClose: () => void;
  attempts: SpeechRoundAttempt[];
  totalRounds?: number;
}

export const SpeechReportModal: React.FC<SpeechReportModalProps> = React.memo(
  ({ visible, onClose, attempts, totalRounds = 10 }) => {
    const { t } = useTranslation();
    const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
    const { width: screenWidth } = useWindowDimensions();

    // Group attempts by roundNumber to get the consolidated outcome per question/round
    const roundMap = new Map<number, SpeechRoundAttempt>();
    attempts.forEach((att) => {
      const existing = roundMap.get(att.roundNumber);
      if (!existing) {
        roundMap.set(att.roundNumber, att);
      } else {
        // If a retry existed, keep the final attempt
        roundMap.set(att.roundNumber, att);
      }
    });

    const uniqueRounds = Array.from(roundMap.values()).sort((a, b) => a.roundNumber - b.roundNumber);
    const correctCount = uniqueRounds.filter((a) => a.isCorrect).length;
    const totalQuestions = Math.max(totalRounds, uniqueRounds.length, 1);
    const needsPracticeCount = Math.max(0, totalQuestions - correctCount);
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const modalWidth = Math.min(screenWidth - 32, 440);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.backdrop}>
          <View style={[styles.card, { width: modalWidth }]}>
            {/* Top Header */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>📊 {t('speechWordChallenge.speechReportTitle')}</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* Summary Metrics Bar */}
            <View style={styles.metricsBar}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{accuracy}%</Text>
                <Text style={styles.metricLabel}>{t('speechWordChallenge.accuracy')}</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#059669' }]}>{correctCount}</Text>
                <Text style={styles.metricLabel}>{t('speechWordChallenge.correct')}</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#D97706' }]}>{needsPracticeCount}</Text>
                <Text style={styles.metricLabel}>{t('speechWordChallenge.needsPractice')}</Text>
              </View>
            </View>

            {/* Detailed Item-by-Item Breakdown */}
            <Text style={styles.sectionHeader}>{t('speechWordChallenge.roundBreakdown')}</Text>

            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
              {uniqueRounds.length > 0 ? (
                uniqueRounds.map((att, idx) => (
                  <View
                    key={`${att.roundNumber}-${idx}`}
                    style={[
                      styles.itemRow,
                      att.isCorrect ? styles.itemRowCorrect : styles.itemRowWrong,
                    ]}
                  >
                    <View style={styles.itemEmojiContainer}>
                      <Text style={styles.itemEmoji}>{att.image || '🎯'}</Text>
                    </View>

                    <View style={styles.itemTextContainer}>
                      <View style={styles.itemExpectedRow}>
                        <Text style={styles.fieldLabel}>{t('speechWordChallenge.expected')}: </Text>
                        <Text style={styles.fieldValueExpected}>{att.displayLabel || att.expectedAnswer}</Text>
                        {att.attemptCount > 1 && (
                          <Text style={styles.attemptTagText}> {t('common.tryCount', { count: att.attemptCount, lng: motherTongue })}</Text>
                        )}
                      </View>
                      <View style={styles.itemHeardRow}>
                        <Text style={styles.fieldLabel}>{t('speechWordChallenge.heard')}: </Text>
                        <Text style={styles.fieldValueHeard}>
                          {att.recognizedAnswer || `(${t('speechWordChallenge.noSpeechDetected')})`}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        att.isCorrect ? styles.statusBadgeCorrect : styles.statusBadgeWrong,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          att.isCorrect ? styles.statusTextCorrect : styles.statusTextWrong,
                        ]}
                      >
                        {att.isCorrect
                          ? `✓ ${t('speechWordChallenge.correct')}`
                          : `✗ ${t('speechWordChallenge.needsPractice')}`}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {t('speechWordChallenge.noAttemptsYet')}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom Dismiss Action */}
            <BigTouchTarget
              onPress={onClose}
              accessibilityLabel={t('common.close')}
              accessibilityRole="button"
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>{t('common.close')}</Text>
            </BigTouchTarget>
          </View>
        </View>
      </Modal>
    );
  }
);

SpeechReportModal.displayName = 'SpeechReportModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#F1F5F9',
    borderBottomWidth: 8,
    borderBottomColor: '#E2E8F0',
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#3B82F6',
  },
  metricLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },
  sectionHeader: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#475569',
    marginBottom: 10,
  },
  itemsList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  itemRowCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  itemRowWrong: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  itemEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemExpectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemHeardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  fieldLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#64748B',
  },
  fieldValueExpected: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  attemptTagText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#6366F1',
  },
  fieldValueHeard: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeCorrect: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeWrong: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
  },
  statusTextCorrect: {
    color: '#15803D',
  },
  statusTextWrong: {
    color: '#B45309',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 13,
    color: '#475569',
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#1D4ED8',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});

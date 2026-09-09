/**
 * Purpose: Detailed Interactive Match Report Modal for Language Pair Match.
 *          Shows Accuracy %, summary stats, and round-by-round concept translation breakdown.
 * Module: Language Pair Match — Components
 * Folder: frontend/src/screens/games/LanguagePairMatch/components
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
import { PairMatchAttempt } from '../types';
import { Typography } from '../../../../theme/typography';
import { BigTouchTarget } from '../../../../components/BigTouchTarget';

interface LanguagePairReportModalProps {
  visible: boolean;
  onClose: () => void;
  attempts: PairMatchAttempt[];
  totalPairs?: number;
}

export const LanguagePairReportModal: React.FC<LanguagePairReportModalProps> = React.memo(
  ({ visible, onClose, attempts, totalPairs = 10 }) => {
    const { t } = useTranslation();
    const { width: screenWidth } = useWindowDimensions();

    // Group attempts by conceptId per round to get final status per pair
    const conceptMap = new Map<string, PairMatchAttempt>();
    attempts.forEach((att) => {
      const key = `r${att.roundNumber}_${att.conceptId}`;
      const existing = conceptMap.get(key);
      if (!existing || att.isCorrect) {
        conceptMap.set(key, att);
      }
    });

    const uniquePairs = Array.from(conceptMap.values()).sort(
      (a, b) => a.roundNumber - b.roundNumber || a.timestamp - b.timestamp
    );

    const correctCount = uniquePairs.filter((a) => a.isCorrect).length;
    const totalQuestions = Math.max(totalPairs, uniquePairs.length, 1);
    const needsPracticeCount = Math.max(0, totalQuestions - correctCount);
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const modalWidth = Math.min(screenWidth - 32, 440);

    // Group items by round number for sectioned display
    const roundsGrouped: Record<number, PairMatchAttempt[]> = {};
    uniquePairs.forEach((pair) => {
      if (!roundsGrouped[pair.roundNumber]) {
        roundsGrouped[pair.roundNumber] = [];
      }
      roundsGrouped[pair.roundNumber].push(pair);
    });

    const roundNumbers = Object.keys(roundsGrouped)
      .map(Number)
      .sort((a, b) => a - b);

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
              <Text style={styles.headerTitle}>📊 {t('languagePairMatch.seeReport', 'Match Report')}</Text>
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
                <Text style={styles.metricLabel}>{t('common.accuracy', 'Accuracy')}</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#059669' }]}>{correctCount}</Text>
                <Text style={styles.metricLabel}>{t('common.correct', 'Matched')}</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#D97706' }]}>{needsPracticeCount}</Text>
                <Text style={styles.metricLabel}>{t('common.practice', 'Needs Practice')}</Text>
              </View>
            </View>

            {/* Detailed Round-by-Round Breakdown */}
            <Text style={styles.sectionHeader}>{t('languagePairMatch.roundBreakdown', 'Round Breakdown')}</Text>

            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
              {roundNumbers.length > 0 ? (
                roundNumbers.map((rNum) => (
                  <View key={`round-${rNum}`} style={styles.roundSection}>
                    <Text style={styles.roundHeaderTitle}>Round {rNum}</Text>
                    {roundsGrouped[rNum].map((item, idx) => (
                      <View
                        key={`${item.conceptId}-${idx}`}
                        style={[
                          styles.pairRow,
                          item.isCorrect ? styles.pairRowCorrect : styles.pairRowWrong,
                        ]}
                      >
                        <View style={styles.pairEmojiWrapper}>
                          <Text style={styles.pairEmoji}>{item.sourceImage || '🎯'}</Text>
                        </View>

                        <View style={styles.pairTextWrapper}>
                          <Text style={styles.pairEquation}>
                            <Text style={styles.pairSourceWord}>{item.sourceText}</Text>
                            <Text style={styles.arrowText}> → </Text>
                            <Text style={styles.pairTargetWord}>{item.targetText}</Text>
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            item.isCorrect ? styles.statusBadgeCorrect : styles.statusBadgeWrong,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              item.isCorrect ? styles.statusTextCorrect : styles.statusTextWrong,
                            ]}
                          >
                            {item.isCorrect ? '✓ Matched' : '✗ Try again'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {t('common.noAttemptsYet', 'No matches recorded yet.')}
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

LanguagePairReportModal.displayName = 'LanguagePairReportModal';

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
    color: '#EC4899', // Game's pink accent
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
  roundSection: {
    marginBottom: 14,
  },
  roundHeaderTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#9333EA',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  pairRowCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  pairRowWrong: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  pairEmojiWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pairEmoji: {
    fontSize: 22,
  },
  pairTextWrapper: {
    flex: 1,
  },
  pairEquation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairSourceWord: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#1E3A8A',
  },
  arrowText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#94A3B8',
  },
  pairTargetWord: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#6B21A8',
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
    backgroundColor: '#EC4899',
    borderRadius: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#BE185D',
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

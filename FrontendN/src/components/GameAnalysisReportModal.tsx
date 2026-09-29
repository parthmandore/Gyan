/**
 * Purpose: Universal Game Analysis Report Modal for Gyan Educational Games.
 *          Provides children and parents a transparent breakdown of each question
 *          played in a session: correct answers, errors, retry count, and XP.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

export interface GameQuestionReportItem {
  roundNumber: number;
  questionLabel: string;
  userAnswer?: string | number;
  correctAnswer: string | number;
  isCorrect: boolean;
  attemptsCount?: number;
  xpEarned?: number;
}

export interface GameAnalysisReportModalProps {
  visible: boolean;
  onClose: () => void;
  gameTitle?: string;
  items: GameQuestionReportItem[];
}

export const GameAnalysisReportModal: React.FC<GameAnalysisReportModalProps> = ({
  visible,
  onClose,
  gameTitle,
  items = [],
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  const totalAttempted = items.length;
  const correctCount = items.filter((i) => i.isCorrect).length;
  const wrongCount = totalAttempted - correctCount;

  const filteredItems = items.filter((item) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'wrong') return !item.isCorrect;
    return true;
  });

  const cardMaxWidth = Math.min(screenWidth - 32, 460);
  const maxModalHeight = Math.min(screenHeight * 0.85, 620);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { maxWidth: cardMaxWidth, maxHeight: maxModalHeight },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.headerTitle}>
                📋 {gameTitle ? `${gameTitle} Report` : 'Session Report'}
              </Text>
              <Text style={styles.headerSubtitle}>
                See how you did on each question!
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close report"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <TouchableOpacity
              style={[
                styles.metricTab,
                filter === 'all' && styles.metricTabActiveAll,
              ]}
              onPress={() => setFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={styles.metricEmoji}>🎯</Text>
              <Text style={styles.metricValue}>{totalAttempted}</Text>
              <Text style={styles.metricLabel}>Total</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.metricTab,
                filter === 'correct' && styles.metricTabActiveCorrect,
              ]}
              onPress={() => setFilter('correct')}
              activeOpacity={0.7}
            >
              <Text style={styles.metricEmoji}>✅</Text>
              <Text style={[styles.metricValue, { color: '#059669' }]}>
                {correctCount}
              </Text>
              <Text style={styles.metricLabel}>Correct</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.metricTab,
                filter === 'wrong' && styles.metricTabActiveWrong,
              ]}
              onPress={() => setFilter('wrong')}
              activeOpacity={0.7}
            >
              <Text style={styles.metricEmoji}>🌱</Text>
              <Text style={[styles.metricValue, { color: '#D97706' }]}>
                {wrongCount}
              </Text>
              <Text style={styles.metricLabel}>Needs Practice</Text>
            </TouchableOpacity>
          </View>

          {/* Question List */}
          <ScrollView
            style={styles.listScrollView}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyText}>
                  {filter === 'wrong'
                    ? 'Amazing job! No mistakes in this session!'
                    : 'No questions to show.'}
                </Text>
              </View>
            ) : (
              filteredItems.map((item, index) => {
                const isItemCorrect = item.isCorrect;
                return (
                  <View
                    key={`report_item_${item.roundNumber}_${index}`}
                    style={[
                      styles.itemCard,
                      isItemCorrect
                        ? styles.itemCardCorrect
                        : styles.itemCardWrong,
                    ]}
                  >
                    {/* Top row of question card */}
                    <View style={styles.itemHeader}>
                      <View style={styles.roundBadge}>
                        <Text style={styles.roundBadgeText}>
                          Round {item.roundNumber}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          isItemCorrect
                            ? styles.statusBadgeCorrect
                            : styles.statusBadgeWrong,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isItemCorrect
                              ? styles.statusBadgeTextCorrect
                              : styles.statusBadgeTextWrong,
                          ]}
                        >
                          {isItemCorrect ? '✓ Correct' : '✕ Practice'}
                        </Text>
                      </View>
                    </View>

                    {/* Question Content */}
                    <View style={styles.questionContent}>
                      <Text style={styles.questionLabel}>
                        {item.questionLabel}
                      </Text>
                    </View>

                    {/* Answers Breakdown */}
                    <View style={styles.answersRow}>
                      <View style={styles.answerCol}>
                        <Text style={styles.answerSub}>Your Answer:</Text>
                        <Text
                          style={[
                            styles.answerVal,
                            isItemCorrect
                              ? styles.answerValCorrect
                              : styles.answerValWrong,
                          ]}
                        >
                          {item.userAnswer !== undefined && item.userAnswer !== null
                            ? String(item.userAnswer)
                            : '—'}
                        </Text>
                      </View>

                      {!isItemCorrect && (
                        <View style={styles.answerCol}>
                          <Text style={styles.answerSub}>Correct Answer:</Text>
                          <Text style={styles.answerValTarget}>
                            {String(item.correctAnswer)}
                          </Text>
                        </View>
                      )}

                      {item.attemptsCount ? (
                        <View style={styles.answerColEnd}>
                          <Text style={styles.answerSub}>Attempts:</Text>
                          <Text style={styles.attemptVal}>
                            {item.attemptsCount === 1 ? '1st Try ⭐' : '2nd Try 🌱'}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer Close CTA */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to results"
          >
            <Text style={styles.doneButtonText}>Back to Results 👍</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

GameAnalysisReportModal.displayName = 'GameAnalysisReportModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2.5,
    borderColor: '#C7D2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  metricsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricTab: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  metricTabActiveAll: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  metricTabActiveCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  metricTabActiveWrong: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  metricEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  listScrollView: {
    flexGrow: 1,
    marginBottom: 14,
  },
  listContainer: {
    gap: 10,
    paddingBottom: 4,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  itemCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
  },
  itemCardCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  itemCardWrong: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roundBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roundBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeCorrect: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeWrong: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusBadgeTextCorrect: {
    color: '#15803D',
  },
  statusBadgeTextWrong: {
    color: '#B45309',
  },
  questionContent: {
    marginVertical: 4,
  },
  questionLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  answersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  answerCol: {
    flex: 1,
  },
  answerColEnd: {
    alignItems: 'flex-end',
  },
  answerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  answerVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  answerValCorrect: {
    color: '#16A34A',
  },
  answerValWrong: {
    color: '#DC2626',
    textDecorationLine: 'line-through',
  },
  answerValTarget: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  attemptVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  doneButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

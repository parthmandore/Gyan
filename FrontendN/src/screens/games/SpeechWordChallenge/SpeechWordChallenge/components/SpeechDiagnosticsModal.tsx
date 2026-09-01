/**
 * Purpose: Development-only diagnostic test panel showing real STT performance,
 *          accuracy breakdowns, latency metrics, and misrecognition analysis.
 * Module: Speech Word Challenge
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
} from 'react-native';
import { useSpeechDiagnosticsStore } from '../store/speechDiagnosticsStore';

interface SpeechDiagnosticsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SpeechDiagnosticsModal: React.FC<SpeechDiagnosticsModalProps> = React.memo(
  ({ visible, onClose }) => {
    const attempts = useSpeechDiagnosticsStore((s) => s.attempts);
    const clearDiagnostics = useSpeechDiagnosticsStore((s) => s.clearDiagnostics);
    const getTotalAttempts = useSpeechDiagnosticsStore((s) => s.getTotalAttempts);
    const getCorrectCount = useSpeechDiagnosticsStore((s) => s.getCorrectCount);
    const getIncorrectCount = useSpeechDiagnosticsStore((s) => s.getIncorrectCount);
    const getEmptyCount = useSpeechDiagnosticsStore((s) => s.getEmptyCount);
    const getApiErrorCount = useSpeechDiagnosticsStore((s) => s.getApiErrorCount);
    const getAverageLatencyMs = useSpeechDiagnosticsStore((s) => s.getAverageLatencyMs);
    const getLanguageBreakdown = useSpeechDiagnosticsStore((s) => s.getLanguageBreakdown);
    const getMisrecognizedAnswers = useSpeechDiagnosticsStore((s) => s.getMisrecognizedAnswers);

    const total = getTotalAttempts();
    const correct = getCorrectCount();
    const incorrect = getIncorrectCount();
    const empty = getEmptyCount();
    const errors = getApiErrorCount();
    const avgLatency = getAverageLatencyMs();
    const langStats = getLanguageBreakdown();
    const misrecognized = getMisrecognizedAnswers();

    const accuracyRate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.panelContainer}>
            {/* Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>🛠️ STT Dev Diagnostics</Text>
                <Text style={styles.panelSubtitle}>Real-time Whisper Speech Performance</Text>
              </View>
              <View style={styles.headerButtons}>
                <Pressable onPress={clearDiagnostics} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear Log</Text>
                </Pressable>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* 1. KPI Metric Grid */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{total}</Text>
                  <Text style={styles.kpiLabel}>Total Attempts</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiCardGreen]}>
                  <Text style={[styles.kpiValue, { color: '#4ADE80' }]}>{accuracyRate}%</Text>
                  <Text style={styles.kpiLabel}>Accuracy ({correct}/{total})</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiCardRed]}>
                  <Text style={[styles.kpiValue, { color: '#F87171' }]}>{incorrect}</Text>
                  <Text style={styles.kpiLabel}>Incorrect</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiCardAmber]}>
                  <Text style={[styles.kpiValue, { color: '#FBBF24' }]}>{empty}</Text>
                  <Text style={styles.kpiLabel}>No Speech</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiCardPurple]}>
                  <Text style={[styles.kpiValue, { color: '#C084FC' }]}>{errors}</Text>
                  <Text style={styles.kpiLabel}>API Errors</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{avgLatency}ms</Text>
                  <Text style={styles.kpiLabel}>Avg Latency</Text>
                </View>
              </View>

              {/* 2. Language Breakdown Table */}
              <Text style={styles.sectionTitle}>🌐 Language Breakdown</Text>
              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHead, { flex: 1 }]}>Lang</Text>
                  <Text style={[styles.tableHead, { flex: 1 }]}>Attempts</Text>
                  <Text style={[styles.tableHead, { flex: 1 }]}>Accuracy</Text>
                  <Text style={[styles.tableHead, { flex: 1.2 }]}>Avg Latency</Text>
                </View>
                {langStats.map((stat) => {
                  const langAccuracy =
                    stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0;
                  return (
                    <View key={stat.language} style={styles.tableRow}>
                      <Text style={[styles.tableCellBold, { flex: 1 }]}>
                        {stat.language.toUpperCase()}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{stat.attempts}</Text>
                      <Text style={[styles.tableCell, { flex: 1, color: '#4ADE80' }]}>
                        {langAccuracy}% ({stat.correct})
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.2 }]}>
                        {stat.avgLatencyMs > 0 ? `${stat.avgLatencyMs}ms` : '—'}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* 3. Frequently Misrecognized Answers */}
              {misrecognized.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>⚠️ Frequent Misrecognitions</Text>
                  <View style={styles.tableCard}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableHead, { flex: 1.2 }]}>Expected</Text>
                      <Text style={[styles.tableHead, { flex: 1.2 }]}>Heard</Text>
                      <Text style={[styles.tableHead, { flex: 0.6 }]}>Lang</Text>
                      <Text style={[styles.tableHead, { flex: 0.6 }]}>Count</Text>
                    </View>
                    {misrecognized.map((item, idx) => (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tableCellBold, { flex: 1.2 }]}>{item.expected}</Text>
                        <Text style={[styles.tableCell, { flex: 1.2, color: '#F87171' }]}>
                          "{item.heard}"
                        </Text>
                        <Text style={[styles.tableCell, { flex: 0.6 }]}>
                          {item.language.toUpperCase()}
                        </Text>
                        <Text style={[styles.tableCellBold, { flex: 0.6, color: '#FBBF24' }]}>
                          {item.count}x
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* 4. Recent Attempts Real-time Log */}
              <Text style={styles.sectionTitle}>📜 Recent Attempts Log ({attempts.length})</Text>
              {attempts.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No speech attempts logged yet in this session.</Text>
                </View>
              ) : (
                attempts.slice(0, 15).map((att) => {
                  const resultColor =
                    att.result === 'CORRECT'
                      ? '#22C55E'
                      : att.result === 'INCORRECT'
                      ? '#EF4444'
                      : att.result === 'EMPTY'
                      ? '#F59E0B'
                      : '#A855F7';

                  return (
                    <View key={att.id} style={styles.attemptCard}>
                      <View style={styles.attemptTopRow}>
                        <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
                          <Text style={styles.resultBadgeText}>{att.result}</Text>
                        </View>
                        <Text style={styles.attemptLang}>
                          [{att.selectedLanguage.toUpperCase()} → {att.languageReturned || '?'}]
                        </Text>
                        <Text style={styles.attemptDuration}>
                          Rec: {att.recordingDurationSec.toFixed(2)}s | API: {att.apiLatencyMs}ms
                        </Text>
                      </View>

                      <View style={styles.attemptBodyRow}>
                        <Text style={styles.attemptExpected}>
                          🎯 Expected: <Text style={styles.boldWhite}>{att.expectedWord}</Text>
                        </Text>
                        <Text style={styles.attemptHeard}>
                          🎙️ Heard: <Text style={styles.boldWhite}>"{att.recognizedText || '—'}"</Text>
                        </Text>
                      </View>

                      {att.errorMessage && (
                        <Text style={styles.attemptError}>⚠️ Error: {att.errorMessage}</Text>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
);

SpeechDiagnosticsModal.displayName = 'SpeechDiagnosticsModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panelContainer: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#1E293B',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  panelSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  scrollBody: {
    padding: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiCardGreen: {
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  kpiCardRed: {
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  kpiCardAmber: {
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  kpiCardPurple: {
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginTop: 12,
    marginBottom: 8,
  },
  tableCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tableHead: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#CBD5E1',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  tableCell: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  tableCellBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  emptyCard: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
  },
  attemptCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  attemptTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  resultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resultBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  attemptLang: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  attemptDuration: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 'auto',
  },
  attemptBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attemptExpected: {
    fontSize: 11,
    color: '#94A3B8',
  },
  attemptHeard: {
    fontSize: 11,
    color: '#94A3B8',
  },
  boldWhite: {
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  attemptError: {
    fontSize: 10,
    color: '#F87171',
    marginTop: 4,
  },
});

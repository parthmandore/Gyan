/**
 * Purpose: Session Complete and Rewards Screen for Missing Letter Words.
 *          Celebrates child's achievement with animated stars, XP breakdown,
 *          spoken praise, replay option, and the universal detailed report modal.
 * Module: Missing Letter Words — Screens
 * Folder: frontend/src/screens/games/MissingLetterWords
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { CuteStar } from '../../../components/CuteStar';
import {
  GameAnalysisReportModal,
  GameQuestionReportItem,
} from '../../../components/GameAnalysisReportModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useProgressStore } from '../../../state/useProgressStore';
import { useMissingLetterWordsStore } from './store/useMissingLetterWordsStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { MissingLetterWordsStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<
  MissingLetterWordsStackParamList,
  'MissingLetterWordsSessionComplete'
>;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const SessionCompleteScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();
  const [showReportModal, setShowReportModal] = useState(false);

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage =
    useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge);

  const totalXp = useProgressStore((s) => s.totalXp);
  const currentLevel = useProgressStore((s) => s.currentLevel);
  const recordSessionCompletion = useProgressStore(
    (s) => s.recordSessionCompletion,
  );

  const resetGame = useMissingLetterWordsStore((s) => s.resetGame);
  const attempts = useMissingLetterWordsStore((s) => s.attempts);
  const rounds = useMissingLetterWordsStore((s) => s.rounds);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 10,
    sessionLength = 10,
    accuracy = 100,
    isTimeExpired = false,
  } = route.params || {};

  const safeSessionLength = Math.max(0, sessionLength);

  const safeItemsCorrect = Math.max(
    0,
    Math.min(itemsCorrect, safeSessionLength),
  );

  const calculatedAccuracy =
    safeSessionLength > 0
      ? Math.round((safeItemsCorrect / safeSessionLength) * 100)
      : 0;

  const safeAccuracy = Math.max(
    0,
    Math.min(
      100,
      Number.isFinite(accuracy) ? accuracy : calculatedAccuracy,
    ),
  );

  const safeStarsEarned = Math.max(
    0,
    Math.min(3, Number.isFinite(starsEarned) ? starsEarned : 0),
  );

  const safeXpEarned = Math.max(
    0,
    Number.isFinite(xpEarned) ? xpEarned : 0,
  );

  /**
   * Stable ID prevents duplicate analytics records when this screen re-renders.
   */
  const sessionIdRef = useRef(
    `missing_letter_words_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`,
  );

  /**
   * Record completed game session for backend analytics.
   *
   * This feeds:
   * Student → progress
   * Parent → child analytics
   * Teacher → student/class analytics
   */
  useEffect(() => {
    recordSessionCompletion({
      sessionId: sessionIdRef.current,
      userId: '',
      gameId: 'missing_letter_words',
      category: 'vocabulary',
      learningLanguage,
      motherTongue,
      age: selectedAge ?? 5,
      timestamp: Date.now(),
      itemsAttempted: safeSessionLength,
      itemsCorrect: safeItemsCorrect,
      accuracy: safeAccuracy,
      starsEarned: safeStarsEarned,
      xpEarned: safeXpEarned,
      durationSeconds: 0,
      xpToAdd: safeXpEarned,
    });
  }, [
    recordSessionCompletion,
    learningLanguage,
    motherTongue,
    selectedAge,
    safeSessionLength,
    safeItemsCorrect,
    safeAccuracy,
    safeStarsEarned,
    safeXpEarned,
  ]);

  useEffect(() => {
    const praiseText = t(
      'missingLetterWords.sessionCompletePraise',
      'You are a spelling superstar! Fantastic job completing all the words!',
    );

    speakPhrase(praiseText, { language: motherTongue });

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      unsubscribe();
      stopSpeech();
    };
  }, [motherTongue, navigation, t]);

  const handlePlayAgain = () => {
    stopSpeech();
    resetGame();

    navigation.navigate('Games', {
      screen: 'MissingLetterWordsGame' as any,
    });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetGame();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  // Formulate comprehensive per-question report items
  const reportItems: GameQuestionReportItem[] = rounds.map((round) => {
    const roundAttempts = attempts.filter(
      (a) => a.roundNumber === round.roundNumber,
    );

    const lastAttempt = roundAttempts[roundAttempts.length - 1];

    if (!lastAttempt) {
      return {
        roundNumber: round.roundNumber,
        questionLabel: `Word: ${round.targetWord.word}`,
        userAnswer: isTimeExpired ? 'Timed Out ⏱️' : 'Skipped',
        correctAnswer: `${round.correctAnswer} (${round.targetWord.word})`,
        isCorrect: false,
        attemptsCount: 0,
        xpEarned: 0,
      };
    }

    const isSuccess = roundAttempts.some((a) => a.isCorrect);
    const successfulAttempt = roundAttempts.find((a) => a.isCorrect);

    const attemptCount = successfulAttempt
      ? successfulAttempt.attemptCount
      : (roundAttempts.length as 1 | 2);

    const xp = isSuccess
      ? attemptCount === 1
        ? 15
        : 10
      : 0;

    return {
      roundNumber: round.roundNumber,
      questionLabel: `Word: ${round.targetWord.word}`,
      userAnswer: isSuccess
        ? `${round.correctAnswer} (${round.targetWord.word})`
        : lastAttempt.chosenLetter,
      correctAnswer: `${round.correctAnswer} (${round.targetWord.word})`,
      isCorrect: isSuccess,
      attemptsCount: attemptCount,
      xpEarned: xp,
    };
  });

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="orchard" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#D97706" />

        <View style={styles.contentContainer}>
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Celebrating Mascot */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="celebrating" />
            </View>

            {/* Time Expired Notice if applicable */}
            {isTimeExpired && (
              <View style={styles.timeExpiredPill}>
                <Text style={styles.timeExpiredText}>
                  ⏱️{' '}
                  {t(
                    'common.timeExpiredNotice',
                    'Time is up! Great effort!',
                  )}
                </Text>
              </View>
            )}

            {/* Header Title */}
            <Text style={styles.title}>
              {safeStarsEarned === 3
                ? t('common.outstanding', 'Outstanding!')
                : safeStarsEarned === 2
                  ? t('common.greatJob', 'Great Job!')
                  : t('common.goodEffort', 'Good Effort!')}
            </Text>

            <Text style={styles.subtitle}>
              {t(
                'missingLetterWords.completedAllWords',
                'You completed the word challenge!',
              )}
            </Text>

            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3].map((starIndex) => (
                <View key={starIndex} style={{ marginHorizontal: 6 }}>
                  <CuteStar
                    size={38}
                    variant="gold"
                    style={{
                      opacity:
                        starIndex <= safeStarsEarned ? 1 : 0.25,
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Metrics Breakdown Card */}
            <View style={styles.metricsCard}>
              <View style={styles.metricColumn}>
                <Text style={styles.metricValue}>
                  +{safeXpEarned}
                </Text>

                <Text style={styles.metricLabel}>
                  {t('common.xpEarned', 'XP Earned')}
                </Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricColumn}>
                <Text style={styles.metricValue}>
                  {safeItemsCorrect} / {safeSessionLength}
                </Text>

                <Text style={styles.metricLabel}>
                  {t('common.correct', 'Correct')}
                </Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricColumn}>
                <Text style={styles.metricValue}>
                  {safeAccuracy}%
                </Text>

                <Text style={styles.metricLabel}>
                  {t('common.accuracy', 'Accuracy')}
                </Text>
              </View>
            </View>

            {/* Level / Total XP Bar */}
            <View style={styles.levelProgressRow}>
              <Text style={styles.levelLabel}>
                {t('common.level', 'Level')} {currentLevel}
              </Text>

              <Text style={styles.totalXpLabel}>
                🌟 {totalXp} {t('common.totalXp', 'Total XP')}
              </Text>
            </View>

            {/* Primary Action: Play Again */}
            <BigTouchTarget
              onPress={handlePlayAgain}
              accessibilityLabel={t(
                'common.playAgain',
                'Play Again',
              )}
              accessibilityRole="button"
              style={styles.playAgainBtn}
            >
              <Text style={styles.playAgainText}>
                🔄 {t('common.playAgain', 'Play Again')}
              </Text>
            </BigTouchTarget>

            {/* Detailed Performance Analysis Report Trigger */}
            <BigTouchTarget
              onPress={() => setShowReportModal(true)}
              accessibilityLabel={t(
                'common.viewDetailedReport',
                'View Detailed Report',
              )}
              accessibilityRole="button"
              style={styles.reportBtn}
            >
              <Text style={styles.reportBtnText}>
                📊{' '}
                {t(
                  'common.viewDetailedReport',
                  'View Detailed Report',
                )}
              </Text>
            </BigTouchTarget>

            {/* Return to Games Action */}
            <BigTouchTarget
              onPress={handleBackToCatalog}
              accessibilityLabel={t(
                'common.backToGames',
                'Back to Games',
              )}
              accessibilityRole="button"
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>
                🏠{' '}
                {t('common.backToGames', 'Back to Games')}
              </Text>
            </BigTouchTarget>
          </View>
        </View>
      </SafeAreaView>

      {/* Universal Detailed Analysis Report Modal */}
      <GameAnalysisReportModal
        visible={showReportModal}
        gameTitle={t(
          'missingLetterWords.reportTitle',
          'Word Challenge Report',
        )}
        items={reportItems}
        onClose={() => setShowReportModal(false)}
      />
    </View>
  );
});

SessionCompleteScreen.displayName =
  'MissingLetterWordsSessionCompleteScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },

  safeArea: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },

  mascotWrapper: {
    marginBottom: 4,
  },

  timeExpiredPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 6,
  },

  timeExpiredText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },

  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  centerStar: {
    marginHorizontal: 8,
    marginBottom: 4,
  },

  metricsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },

  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
    marginBottom: 2,
  },

  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },

  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#CBD5E1',
  },

  levelProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  levelLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },

  totalXpLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },

  playAgainBtn: {
    width: '100%',
    height: 48,
    minHeight: 48,
    backgroundColor: '#F59E0B',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
    borderBottomWidth: 5,
    borderBottomColor: '#B45309',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 6,
  },

  playAgainText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  reportBtn: {
    width: '100%',
    height: 44,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginBottom: 6,
  },

  reportBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },

  backBtn: {
    width: '100%',
    height: 40,
    minHeight: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
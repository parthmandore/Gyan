/**
 * Purpose: Session Complete and Rewards Screen for Find the Correct Word.
 *          Celebrates child's achievement with animated stars, XP breakdown,
 *          spoken praise, replay option, and the universal detailed report modal.
 * Module: Find the Correct Word — Screens
 * Folder: frontend/src/screens/games/FindTheCorrectWord
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { CuteStar } from '../../../components/CuteStar';
import { GameAnalysisReportModal, GameQuestionReportItem } from '../../../components/GameAnalysisReportModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useProgressStore } from '../../../state/useProgressStore';
import { useFindTheCorrectWordStore } from './store/useFindTheCorrectWordStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { FindTheCorrectWordStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<FindTheCorrectWordStackParamList, 'FindTheCorrectWordSessionComplete'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const SessionCompleteScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();
  const [showReportModal, setShowReportModal] = useState(false);

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const totalXp = useProgressStore((s) => s.totalXp);
  const currentLevel = useProgressStore((s) => s.currentLevel);
  const resetGame = useFindTheCorrectWordStore((s) => s.resetGame);
  const attempts = useFindTheCorrectWordStore((s) => s.attempts);
  const rounds = useFindTheCorrectWordStore((s) => s.rounds);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 10,
    sessionLength = 10,
    accuracy = 100,
    isTimeExpired = false,
  } = route.params || {};

  useEffect(() => {
    const praiseText = t(
      'findTheCorrectWord.sessionCompletePraise',
      'You are a spelling champion! Wonderful job finding the correct words!'
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
    navigation.navigate('Games', { screen: 'FindTheCorrectWordGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetGame();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  // Formulate comprehensive per-question report items
  const reportItems: GameQuestionReportItem[] = rounds.map((round) => {
    const roundAttempts = attempts.filter((a) => a.roundNumber === round.roundNumber);
    const lastAttempt = roundAttempts[roundAttempts.length - 1];

    if (!lastAttempt) {
      return {
        roundNumber: round.roundNumber,
        questionLabel: `Word: ${round.targetItem.correctWord}`,
        userAnswer: isTimeExpired ? 'Timed Out ⏱️' : 'Skipped',
        correctAnswer: round.correctAnswer,
        isCorrect: false,
        attemptsCount: 0,
        xpEarned: 0,
      };
    }

    const isSuccess = roundAttempts.some((a) => a.isCorrect);
    const successfulAttempt = roundAttempts.find((a) => a.isCorrect);
    const attemptCount = successfulAttempt ? successfulAttempt.attemptCount : (roundAttempts.length as 1 | 2);
    const xp = isSuccess ? (attemptCount === 1 ? 15 : 10) : 0;

    return {
      roundNumber: round.roundNumber,
      questionLabel: `Word: ${round.targetItem.correctWord}`,
      userAnswer: isSuccess ? round.correctAnswer : lastAttempt.chosenWord,
      correctAnswer: round.correctAnswer,
      isCorrect: isSuccess,
      attemptsCount: attemptCount,
      xpEarned: xp,
    };
  });

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="orchard" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#059669" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Celebrating Mascot */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="celebrating" />
            </View>

            {/* Time Expired Notice if applicable */}
            {isTimeExpired && (
              <View style={styles.timeExpiredPill}>
                <Text style={styles.timeExpiredText}>
                  ⏱️ {t('common.timeExpiredNotice', 'Time is up! Great effort!')}
                </Text>
              </View>
            )}

            {/* Header Title */}
            <Text style={styles.title}>
              {starsEarned === 3
                ? t('common.outstanding', 'Outstanding!')
                : starsEarned === 2
                ? t('common.greatJob', 'Great Job!')
                : t('common.goodEffort', 'Good Effort!')}
            </Text>

            <Text style={styles.subtitle}>
              {t('findTheCorrectWord.completedAllWords', 'You completed the word challenge!')}
            </Text>

            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3].map((starIndex) => (
                <View key={starIndex} style={{ marginHorizontal: 8 }}>
                  <CuteStar
                    size={52}
                    variant="gold"
                    style={{ opacity: starIndex <= starsEarned ? 1 : 0.25 }}
                  />
                </View>
              ))}
            </View>

            {/* Metrics Breakdown Card */}
            <View style={styles.metricsCard}>
              <View style={styles.metricColumn}>
                <Text style={styles.metricValue}>+{xpEarned}</Text>
                <Text style={styles.metricLabel}>{t('common.xpEarned', 'XP Earned')}</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricColumn}>
                <Text style={styles.metricValue}>
                  {itemsCorrect} / {sessionLength}
                </Text>
                <Text style={styles.metricLabel}>{t('common.correct', 'Correct')}</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricColumn}>
                <Text style={styles.metricValue}>{accuracy}%</Text>
                <Text style={styles.metricLabel}>{t('common.accuracy', 'Accuracy')}</Text>
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
              accessibilityLabel={t('common.playAgain', 'Play Again')}
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
              accessibilityLabel={t('common.viewDetailedReport', 'View Detailed Report')}
              accessibilityRole="button"
              style={styles.reportBtn}
            >
              <Text style={styles.reportBtnText}>
                📊 {t('common.viewDetailedReport', 'View Detailed Report')}
              </Text>
            </BigTouchTarget>

            {/* Return to Games Action */}
            <BigTouchTarget
              onPress={handleBackToCatalog}
              accessibilityLabel={t('common.backToGames', 'Back to Games')}
              accessibilityRole="button"
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>
                🏠 {t('common.backToGames', 'Back to Games')}
              </Text>
            </BigTouchTarget>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Universal Detailed Analysis Report Modal */}
      <GameAnalysisReportModal
        visible={showReportModal}
        gameTitle={t('findTheCorrectWord.title', 'Find the Correct Word')}
        items={reportItems}
        onClose={() => setShowReportModal(false)}
      />
    </View>
  );
});

SessionCompleteScreen.displayName = 'FindTheCorrectWordSessionCompleteScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  mascotWrapper: {
    marginBottom: 8,
  },
  timeExpiredPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6EE7B7',
    marginBottom: 8,
  },
  timeExpiredText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  metricsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },
  levelProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  totalXpLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  playAgainBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 12,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  reportBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  reportBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  backBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
});

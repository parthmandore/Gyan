/**
 * Purpose: Session Complete and Rewards Screen for Guess the Shape.
 *          Celebrates child's achievement with animated stars, XP breakdown,
 *          spoken praise, replay option, and the universal detailed report modal.
 * Module: Guess the Shape — Screens
 * Folder: frontend/src/screens/games/GuessTheShape
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
import { useGuessTheShapeStore } from './store/useGuessTheShapeStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { GuessTheShapeStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<GuessTheShapeStackParamList, 'GuessTheShapeSessionComplete'>;
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
  const resetGame = useGuessTheShapeStore((s) => s.resetGame);
  const attempts = useGuessTheShapeStore((s) => s.attempts);
  const rounds = useGuessTheShapeStore((s) => s.rounds);

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
      'guessTheShape.sessionCompletePraise',
      'You are a true shape master! Wonderful job recognizing all the shapes!'
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
    navigation.navigate('Games', { screen: 'GuessTheShapeGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetGame();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  // Formulate comprehensive per-question report items
  const reportItems: GameQuestionReportItem[] = rounds.map((round) => {
    // Find attempts for this round
    const roundAttempts = attempts.filter((a) => a.roundNumber === round.roundNumber);
    const lastAttempt = roundAttempts[roundAttempts.length - 1];

    if (!lastAttempt) {
      return {
        roundNumber: round.roundNumber,
        questionLabel: `Shape: ${round.correctAnswer}`,
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
      questionLabel: `Shape: ${round.correctAnswer}`,
      userAnswer: isSuccess ? round.correctAnswer : lastAttempt.chosenWord,
      correctAnswer: round.correctAnswer,
      isCorrect: isSuccess,
      attemptsCount: attemptCount,
      xpEarned: xp,
    };
  });

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="geometry" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

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

            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3].map((starIndex) => (
                <View key={starIndex} style={styles.starWrapper}>
                  <CuteStar
                    size={48}
                    variant="gold"
                    style={{ opacity: starIndex <= starsEarned ? 1 : 0.25 }}
                  />
                </View>
              ))}
            </View>

            {/* Completion Title */}
            <Text style={styles.completeTitle}>
              {t('guessTheShape.sessionCompleteTitle', 'Shape Adventure Complete! 🎉')}
            </Text>
            <Text style={styles.completeDesc}>
              {t('guessTheShape.sessionCompleteDesc', {
                defaultValue: 'You identified {{correct}} of {{total}} shapes correctly!',
                correct: itemsCorrect,
                total: sessionLength,
              })}
            </Text>

            {/* Stats Summary Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>⭐ +{xpEarned}</Text>
                <Text style={styles.statLabel}>{t('common.xpEarned', 'XP Earned')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {itemsCorrect} / {sessionLength}
                </Text>
                <Text style={styles.statLabel}>{t('common.correct', 'Correct')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{accuracy}%</Text>
                <Text style={styles.statLabel}>{t('common.accuracy', 'Accuracy')}</Text>
              </View>
            </View>

            {/* Overall Level Progress Banner */}
            <View style={styles.levelBanner}>
              <Text style={styles.levelBannerText}>
                🏆 Level {currentLevel} • Total {totalXp} XP
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <BigTouchTarget
                onPress={() => setShowReportModal(true)}
                accessibilityLabel="View Detailed Question Report"
                accessibilityRole="button"
                style={styles.viewReportButton}
              >
                <Text style={styles.viewReportButtonText}>
                  📋 View Detailed Report
                </Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={handlePlayAgain}
                accessibilityLabel={t('common.playAgain', 'Play Again')}
                accessibilityRole="button"
                style={styles.playAgainButton}
              >
                <Text style={styles.playAgainButtonText}>
                  🔄 {t('common.playAgain', 'Play Again')}
                </Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={handleBackToCatalog}
                accessibilityLabel={t('common.moreGames', 'More Games')}
                accessibilityRole="button"
                style={styles.catalogButton}
              >
                <Text style={styles.catalogButtonText}>
                  🎮 {t('common.moreGames', 'More Games')}
                </Text>
              </BigTouchTarget>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Universal Analysis Report Modal */}
      <GameAnalysisReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        gameTitle={t('guessTheShape.title', 'Guess the Shape')}
        items={reportItems}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingBottom: 36,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 6,
    borderBottomColor: '#6366F1',
    padding: 24,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  mascotWrapper: {
    marginVertical: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  starWrapper: {
    transform: [{ scale: 1 }],
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 6,
  },
  completeDesc: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 22,
  },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },
  levelBanner: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#93C5FD',
    marginBottom: 20,
  },
  levelBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  viewReportButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewReportButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  playAgainButton: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  catalogButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderBottomWidth: 4,
    borderBottomColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
});

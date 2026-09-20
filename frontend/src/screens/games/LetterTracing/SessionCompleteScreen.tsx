/**
 * Purpose: Session Complete and Rewards Screen for Letter Tracing.
 *          Celebrates child's handwriting achievements with animated stars, XP breakdown,
 *          spoken praise in mother tongue, and navigation options.
 * Module: Letter Tracing — Screens
 * Folder: frontend/src/screens/games/LetterTracing
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

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { CuteStar } from '../../../components/CuteStar';
import { GameAnalysisReportModal, GameQuestionReportItem } from '../../../components/GameAnalysisReportModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useProgressStore } from '../../../state/useProgressStore';
import { useLetterTracingStore } from './store/useLetterTracingStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { LetterTracingStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<LetterTracingStackParamList, 'LetterTracingSessionComplete'>;
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
  const resetSession = useLetterTracingStore((s) => s.resetSession);
  const attempts = useLetterTracingStore((s) => s.attempts);
  const rounds = useLetterTracingStore((s) => s.rounds);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 5,
    sessionLength = 5,
    accuracy = 100,
  } = (route.params as any) || {};

  useEffect(() => {
    const praiseText = t('letterTracing.sessionCompletePraise', { lng: motherTongue });
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
    resetSession();
    navigation.navigate('Games', { screen: 'LetterTracingGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetSession();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  const reportItems: GameQuestionReportItem[] = attempts.map((att, idx) => {
    const r = rounds[att.roundIndex] || rounds[idx];
    const letterChar = r?.letter?.displayChar || att.letterId;
    return {
      roundNumber: att.roundIndex + 1,
      questionLabel: `Trace: ${letterChar}`,
      userAnswer: att.isSuccess ? 'Traced ✓' : 'Incomplete',
      correctAnswer: letterChar,
      isCorrect: att.isSuccess,
      xpEarned: att.isSuccess ? 15 : 0,
    };
  });

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="art" />
      <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <BigTouchTarget
            onPress={handleBackToCatalog}
            accessibilityLabel="Go back to Games Catalog"
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>🏠</Text>
          </BigTouchTarget>
        </View>

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
              {t('letterTracing.sessionCompleteTitle', 'Handwriting Practice Complete!')}
            </Text>
            <Text style={styles.completeDesc}>
              {t('letterTracing.sessionCompleteDesc', { correct: itemsCorrect })}
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

            {/* Overall Progress Banner */}
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
                style={styles.moreGamesButton}
              >
                <Text style={styles.moreGamesButtonText}>
                  🎮 {t('common.moreGames', 'More Games')}
                </Text>
              </BigTouchTarget>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <GameAnalysisReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        gameTitle="Letter Tracing"
        items={reportItems}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  homeButtonText: {
    fontSize: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  mascotWrapper: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 12,
  },
  starWrapper: {
    padding: 4,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#065F46',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  completeDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065F46',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#86EFAC',
  },
  levelBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    marginBottom: 24,
  },
  levelBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  viewReportButton: {
    backgroundColor: '#ECFDF5',
    borderRadius: 22,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewReportButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
  playAgainButton: {
    backgroundColor: '#10B981',
    borderRadius: 22,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  moreGamesButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  moreGamesButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
});

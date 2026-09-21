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
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

        <View style={styles.contentContainer}>
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Celebrating Mascot */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="celebrating" style={{ width: 80, height: 80 }} />
            </View>

            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3].map((starIndex) => (
                <View key={starIndex} style={styles.starWrapper}>
                  <CuteStar
                    size={38}
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
        </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  mascotWrapper: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  starWrapper: {
    padding: 2,
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#065F46',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  completeDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065F46',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#86EFAC',
  },
  levelBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    marginBottom: 12,
  },
  levelBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  actionsContainer: {
    width: '100%',
    gap: 6,
  },
  viewReportButton: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    height: 44,
    minHeight: 44,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  playAgainButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    height: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  playAgainButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  moreGamesButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    height: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  moreGamesButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
});

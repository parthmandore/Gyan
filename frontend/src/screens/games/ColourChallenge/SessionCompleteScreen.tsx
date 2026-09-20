/**
 * Purpose: Session Complete and Rewards Screen for Colour Challenge.
 *          Celebrates child's performance with stars, XP display, voice praise,
 *          and navigation back to games catalog or replay.
 * Module: Colour Challenge — Screens
 * Folder: frontend/src/screens/games/ColourChallenge
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
import { useColourChallengeStore } from './store/useColourChallengeStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { ColourChallengeStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<ColourChallengeStackParamList, 'ColourChallengeSessionComplete'>;
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
  const resetSession = useColourChallengeStore((s) => s.resetSession);
  const attempts = useColourChallengeStore((s) => s.attempts);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 5,
    sessionLength = 5,
    accuracy = 100,
  } = route.params || {};

  useEffect(() => {
    const praiseText = t('colourChallenge.sessionCompletePraise', { lng: motherTongue });
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
    navigation.navigate('Games', { screen: 'ColourChallengeGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetSession();
    navigation.navigate('GameCatalog');
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  const reportItems: GameQuestionReportItem[] = attempts.map((att) => ({
    roundNumber: att.roundNumber,
    questionLabel: `Color: ${att.expectedWord}`,
    userAnswer: att.selectedOptionId || att.spokenWord || (att.isCorrect ? att.expectedWord : 'Incorrect'),
    correctAnswer: att.expectedWord,
    isCorrect: att.isCorrect,
    attemptsCount: att.attemptCount,
    xpEarned: att.isCorrect ? (att.attemptCount === 1 ? 15 : 10) : 0,
  }));

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="rainbow" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#D97706" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Mascot */}
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
              {t('colourChallenge.sessionCompleteTitle')}
            </Text>
            <Text style={styles.completeDesc}>
              {t('colourChallenge.sessionCompleteDesc', { correct: itemsCorrect })}
            </Text>

            {/* Stats Summary Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>⭐ +{xpEarned}</Text>
                <Text style={styles.statLabel}>{t('common.xpEarned')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{itemsCorrect} / {sessionLength}</Text>
                <Text style={styles.statLabel}>{t('common.correct')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{accuracy}%</Text>
                <Text style={styles.statLabel}>{t('common.accuracy')}</Text>
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
                accessibilityLabel={t('common.playAgain')}
                accessibilityRole="button"
                style={styles.playAgainButton}
              >
                <Text style={styles.playAgainButtonText}>🔄 {t('common.playAgain')}</Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={handleBackToCatalog}
                accessibilityLabel={t('common.catalog')}
                accessibilityRole="button"
                style={styles.catalogButton}
              >
                <Text style={styles.catalogButtonText}>🏠 {t('common.catalog')}</Text>
              </BigTouchTarget>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <GameAnalysisReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        gameTitle="Colour Challenge"
        items={reportItems}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
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
    paddingVertical: 20,
    paddingBottom: 36,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 6,
    borderBottomColor: '#F59E0B',
    padding: 24,
    alignItems: 'center',
    elevation: 6,
  },
  mascotWrapper: {
    marginVertical: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
  starWrapper: {
    transform: [{ scale: 1 }],
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  completeDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 24,
  },
  levelBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
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
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#059669',
    borderBottomWidth: 6,
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
    paddingVertical: 14,
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

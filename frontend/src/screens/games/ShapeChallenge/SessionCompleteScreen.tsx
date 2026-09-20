/**
 * Purpose: Session Complete and Rewards Screen for Shape Challenge.
 *          Celebrates child's performance with stars, XP display, voice praise,
 *          and navigation back to games catalog or replay.
 * Module: Shape Challenge — Screens
 * Folder: frontend/src/screens/games/ShapeChallenge
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
import { useShapeChallengeStore } from './store/useShapeChallengeStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { ShapeChallengeStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<ShapeChallengeStackParamList, 'ShapeChallengeSessionComplete'>;
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
  const resetSession = useShapeChallengeStore((s) => s.resetSession);
  const attempts = useShapeChallengeStore((s) => s.attempts);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 5,
    sessionLength = 5,
    accuracy = 100,
  } = route.params || {};

  useEffect(() => {
    const praiseText = t('shapeChallenge.sessionCompletePraise', { lng: motherTongue });
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
    navigation.navigate('Games', { screen: 'ShapeChallengeGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetSession();
    navigation.navigate('GameCatalog');
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  const reportItems: GameQuestionReportItem[] = attempts.map((att) => ({
    roundNumber: att.roundNumber,
    questionLabel: `Shape: ${att.expectedWord}`,
    userAnswer: att.selectedOptionId || att.spokenWord || (att.isCorrect ? att.expectedWord : 'Incorrect'),
    correctAnswer: att.expectedWord,
    isCorrect: att.isCorrect,
    attemptsCount: att.attemptCount,
    xpEarned: att.isCorrect ? (att.attemptCount === 1 ? 15 : 10) : 0,
  }));

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="geometry" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

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
              {t('shapeChallenge.sessionCompleteTitle')}
            </Text>
            <Text style={styles.completeDesc}>
              {t('shapeChallenge.sessionCompleteDesc', { correct: itemsCorrect })}
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
        gameTitle="Shape Challenge"
        items={reportItems}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EFF6FF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    borderBottomWidth: 6,
    borderBottomColor: '#3B82F6',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
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
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  completeDesc: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 18,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D4ED8',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
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
    paddingVertical: 13,
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

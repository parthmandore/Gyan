/**
 * Purpose: Session Complete and Rewards screen for Missing Letters (Age 5).
 *          Celebrates sequence completion with 3-star rating, XP tally,
 *          spoken praise, and replay / catalog navigation.
 * Module: Missing Letters — Session Complete Screen
 * Folder: frontend/src/screens/games/MissingLetters
 */

import React, { useEffect, useState } from 'react';
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

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { CuteStar } from '../../../components/CuteStar';
import { GameAnalysisReportModal, GameQuestionReportItem } from '../../../components/GameAnalysisReportModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useProgressStore } from '../../../state/useProgressStore';
import { useMissingLettersStore } from './store/useMissingLettersStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { MissingLettersStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<
  MissingLettersStackParamList,
  'MissingLettersSessionComplete'
>;
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
  const resetGame = useMissingLettersStore((s) => s.resetGame);
  const attempts = useMissingLettersStore((s) => s.attempts);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 5,
    sessionLength = 5,
    accuracy = 100,
  } = (route.params as any) || {};

  useEffect(() => {
    const praiseText = t('missingLetters.sessionCompletePraise', { lng: motherTongue });
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
    navigation.navigate('Games', { screen: 'MissingLettersGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetGame();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  const reportItems: GameQuestionReportItem[] = attempts.map((att) => ({
    roundNumber: att.roundNumber,
    questionLabel: `Missing: ${att.correctLetter}`,
    userAnswer: att.selectedLetter,
    correctAnswer: att.correctLetter,
    isCorrect: att.isCorrect,
    attemptsCount: att.attemptCount,
    xpEarned: att.isCorrect ? (att.attemptCount === 1 ? 15 : 10) : 0,
  }));

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="alphabet" />
      <StatusBar barStyle="dark-content" backgroundColor="#EEF2FF" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={[styles.header, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={handleBackToCatalog}
            accessibilityRole="button"
            accessibilityLabel="Go back to Games Catalog"
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>🏠</Text>
          </BigTouchTarget>

          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              Lv. {currentLevel} • {totalXp} XP
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Mascot Celebration */}
          <View style={styles.mascotContainer}>
            <MascotCharacter state="celebrating" />
          </View>

          {/* Celebratory Title */}
          <Text style={styles.titleText}>
            {t('missingLetters.sessionCompleteTitle', 'Alphabet Superstar! 🌟')}
          </Text>
          <Text style={styles.subtitleText}>
            {t(
              'missingLetters.sessionCompleteDesc',
              'You completed all 5 letter sequences!'
            )}
          </Text>

          {/* 3-Star Rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map((starIndex) => (
              <View key={starIndex} style={styles.starWrapper}>
                <CuteStar
                  size={starIndex === 2 ? 62 : 48}
                  variant="gold"
                  style={{ opacity: starIndex <= starsEarned ? 1 : 0.25 }}
                />
              </View>
            ))}
          </View>

          {/* Performance & XP Cards */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>
                {itemsCorrect}/{sessionLength}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={[styles.statValue, styles.xpValue]}>+{xpEarned}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>

          {/* Action CTAs */}
          <View style={styles.actionButtons}>
            <BigTouchTarget
              onPress={() => setShowReportModal(true)}
              style={styles.viewReportBtn}
              accessibilityRole="button"
              accessibilityLabel="View Detailed Question Report"
            >
              <Text style={styles.viewReportBtnText}>📋 View Detailed Report</Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handlePlayAgain}
              style={styles.playAgainBtn}
              accessibilityRole="button"
              accessibilityLabel="Play Missing Letters again"
            >
              <Text style={styles.playAgainBtnText}>Play Again 🔄</Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handleBackToCatalog}
              style={styles.moreGamesBtn}
              accessibilityRole="button"
              accessibilityLabel="Explore more games in catalog"
            >
              <Text style={styles.moreGamesBtnText}>More Games 🎮</Text>
            </BigTouchTarget>
          </View>
        </View>
      </SafeAreaView>

      <GameAnalysisReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        gameTitle="Missing Letters"
        items={reportItems}
      />
    </View>
  );
});

SessionCompleteScreen.displayName = 'MissingLettersSessionCompleteScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  homeButton: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonText: {
    fontSize: 20,
  },
  levelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mascotContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginTop: 2,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  starWrapper: {
    marginHorizontal: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  xpValue: {
    color: '#D97706',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1.5,
    height: 28,
    backgroundColor: '#E0E7FF',
  },
  actionButtons: {
    width: '100%',
    gap: 6,
  },
  viewReportBtn: {
    width: '100%',
    height: 44,
    minHeight: 44,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewReportBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },
  playAgainBtn: {
    width: '100%',
    height: 48,
    minHeight: 48,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    borderWidth: 2.5,
    borderColor: '#6366F1',
    borderBottomWidth: 5,
    borderBottomColor: '#3730A3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  playAgainBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  moreGamesBtn: {
    width: '100%',
    height: 44,
    minHeight: 44,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreGamesBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4338CA',
  },
});

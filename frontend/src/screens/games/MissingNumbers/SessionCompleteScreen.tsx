/**
 * Purpose: Session Complete and Rewards screen for Missing Numbers (Age 5).
 *          Celebrates number counting completion with 3-star rating, XP tally,
 *          spoken praise, and replay / catalog navigation.
 * Module: Missing Numbers — Session Complete Screen
 * Folder: frontend/src/screens/games/MissingNumbers
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
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { CuteStar } from '../../../components/CuteStar';
import { GameAnalysisReportModal, GameQuestionReportItem } from '../../../components/GameAnalysisReportModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useProgressStore } from '../../../state/useProgressStore';
import { useMissingNumbersStore } from './store/useMissingNumbersStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { MissingNumbersStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<
  MissingNumbersStackParamList,
  'MissingNumbersSessionComplete'
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
  const resetGame = useMissingNumbersStore((s) => s.resetGame);
  const attempts = useMissingNumbersStore((s) => s.attempts);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 5,
    sessionLength = 5,
    accuracy = 100,
  } = (route.params as any) || {};

  useEffect(() => {
    const praiseText = t('missingNumbers.sessionCompletePraise', { lng: motherTongue });
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
    navigation.navigate('Games', { screen: 'MissingNumbersGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetGame();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  const reportItems: GameQuestionReportItem[] = attempts.map((att) => ({
    roundNumber: att.roundNumber,
    questionLabel: `Missing: ${att.correctValue}`,
    userAnswer: String(att.selectedValue),
    correctAnswer: String(att.correctValue),
    isCorrect: att.isCorrect,
    attemptsCount: att.attemptCount,
    xpEarned: att.isCorrect ? (att.attemptCount === 1 ? 15 : 10) : 0,
  }));

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="math" />
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={[styles.header, { width: containerWidth }]}>
          <TouchableOpacity
            onPress={handleBackToCatalog}
            accessibilityRole="button"
            accessibilityLabel="Go back to Games Catalog"
            style={styles.homeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.homeButtonText}>🏠</Text>
          </TouchableOpacity>

          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              Lv. {currentLevel} • {totalXp} XP
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { width: containerWidth }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Mascot Celebration */}
          <View style={styles.mascotContainer}>
            <MascotCharacter state="celebrating" />
          </View>

          {/* Celebratory Title */}
          <Text style={styles.titleText}>
            {t('missingNumbers.sessionCompleteTitle', 'Counting Superstar! 🌟')}
          </Text>
          <Text style={styles.subtitleText}>
            {t(
              'missingNumbers.sessionCompleteDesc',
              'You completed all 5 number sequences!'
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
            <TouchableOpacity
              onPress={() => setShowReportModal(true)}
              style={styles.viewReportBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View Detailed Question Report"
            >
              <Text style={styles.viewReportBtnText}>📋 View Detailed Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlayAgain}
              style={styles.playAgainBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Play Missing Numbers again"
            >
              <Text style={styles.playAgainBtnText}>Play Again 🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackToCatalog}
              style={styles.moreGamesBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Explore more games in catalog"
            >
              <Text style={styles.moreGamesBtnText}>More Games 🎮</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <GameAnalysisReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        gameTitle="Missing Numbers"
        items={reportItems}
      />
    </View>
  );
});

SessionCompleteScreen.displayName = 'MissingNumbersSessionCompleteScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EFF6FF',
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
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
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
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 32,
  },
  mascotContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  starWrapper: {
    marginHorizontal: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  xpValue: {
    color: '#D97706',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1.5,
    height: 38,
    backgroundColor: '#E2E8F0',
  },
  actionButtons: {
    width: '100%',
    gap: 10,
  },
  viewReportBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewReportBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0284C7',
  },
  playAgainBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0284C7',
    borderWidth: 3,
    borderColor: '#38BDF8',
    borderBottomWidth: 5,
    borderBottomColor: '#0369A1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  playAgainBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  moreGamesBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#BAE6FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreGamesBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0284C7',
  },
});

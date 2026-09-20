/**
 * Purpose: Session Complete and Rewards screen for Number Counting (Age 5).
 *          Celebrates counting completion with 3-star rating, Mascot celebration, XP summary,
 *          spoken praise, and replay / catalog navigation.
 * Module: Number Counting — Session Complete Screen
 * Folder: frontend/src/screens/games/NumberCounting
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
import { useNumberCountingStore } from './store/useNumberCountingStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { NumberCountingStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<
  NumberCountingStackParamList,
  'NumberCountingSessionComplete'
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
  const resetGame = useNumberCountingStore((s) => s.resetGame);
  const attempts = useNumberCountingStore((s) => s.attempts);

  const {
    score = 50,
    totalQuestions = 5,
    correctAnswers = 5,
    xpEarned = 75,
    durationSeconds = 30,
  } = (route.params as any) || {};

  const accuracy = Math.round((correctAnswers / Math.max(totalQuestions, 1)) * 100);
  const starCount = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

  useEffect(() => {
    const praiseText = t(
      'numberCounting.sessionCompletePraise',
      'You are a counting champion!'
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
      screen: 'NumberCountingGame' as any,
    });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetGame();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  const reportItems: GameQuestionReportItem[] = attempts.map((att) => ({
    roundNumber: att.roundIndex + 1,
    questionLabel: `Count: ${att.correctNumber}`,
    userAnswer: String(att.selectedNumber),
    correctAnswer: String(att.correctNumber),
    isCorrect: att.isCorrect,
    attemptsCount: 1,
    xpEarned: att.isCorrect ? 15 : 0,
  }));

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="orchard" />
      <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={[styles.header, { width: containerWidth }]}>
          <TouchableOpacity
            onPress={handleBackToCatalog}
            style={styles.closeBtn}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { width: containerWidth }]}>
            {/* Mascot in celebrating state */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="celebrating" />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>
              {t('numberCounting.sessionCompleteTitle', 'Super Counter! 🍎')}
            </Text>
            <Text style={styles.subtitle}>
              {t(
                'numberCounting.sessionCompleteDesc',
                'You counted all the objects like a champ!'
              )}
            </Text>

            {/* 3 CuteStar Badges */}
            <View style={styles.starsRow}>
              <CuteStar
                size={46}
                variant="gold"
                style={{ opacity: starCount < 1 ? 0.25 : 1 }}
              />
              <CuteStar
                size={58}
                variant="gold"
                style={{ marginTop: -10, opacity: starCount < 2 ? 0.25 : 1 }}
              />
              <CuteStar
                size={46}
                variant="gold"
                style={{ opacity: starCount < 3 ? 0.25 : 1 }}
              />
            </View>

            {/* Score & XP Cards */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statValue}>
                  {correctAnswers}/{totalQuestions}
                </Text>
                <Text style={styles.statLabel}>
                  {t('common.score', 'Correct')}
                </Text>
              </View>

              <View style={[styles.statBox, styles.statBoxHighlight]}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={[styles.statValue, styles.xpValue]}>+{xpEarned}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={styles.statValue}>{durationSeconds}s</Text>
                <Text style={styles.statLabel}>
                  {t('common.time', 'Time')}
                </Text>
              </View>
            </View>

            {/* Level & Total XP Badge */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                🏆 Level {currentLevel} • Total XP: {totalXp}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.viewReportBtn}
                onPress={() => setShowReportModal(true)}
                activeOpacity={0.85}
                accessibilityLabel="View Detailed Question Report"
                accessibilityRole="button"
              >
                <Text style={styles.viewReportBtnText}>📋 View Detailed Report</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playAgainBtn}
                onPress={handlePlayAgain}
                activeOpacity={0.85}
                accessibilityLabel="Play again"
                accessibilityRole="button"
              >
                <Text style={styles.playAgainText}>
                  {t('common.playAgain', 'Play Again! 🔄')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moreGamesBtn}
                onPress={handleBackToCatalog}
                activeOpacity={0.85}
                accessibilityLabel="More games"
                accessibilityRole="button"
              >
                <Text style={styles.moreGamesText}>
                  {t('common.moreGames', 'More Games 🎮')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <GameAnalysisReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        gameTitle="Number Counting"
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
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  mascotWrapper: {
    marginTop: -10,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#064E3B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 8,
  },
  starCenter: {
    marginTop: -10,
  },
  starDimmed: {
    opacity: 0.25,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  statBoxHighlight: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  xpValue: {
    color: '#D97706',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  actionButtons: {
    width: '100%',
    gap: 10,
  },
  viewReportBtn: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewReportBtnText: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '800',
  },
  playAgainBtn: {
    backgroundColor: '#10B981',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  moreGamesBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  moreGamesText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
});

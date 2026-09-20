/**
 * Purpose: Session Complete and Rewards Screen for Basic Grammar Games.
 *          Celebrates language achievements with stars, XP breakdown, spoken praise,
 *          and navigation to replay or games catalog.
 * Module: Grammar Challenge — Screens
 * Folder: frontend/src/screens/games/GrammarChallenge
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
import { useGrammarGameStore } from './store/useGrammarGameStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { GrammarChallengeStackParamList, GrammarTopic } from './types';
import { RootStackParamList } from '../../../types';

type RouteProps = RouteProp<
  GrammarChallengeStackParamList,
  'GrammarChallengeSessionComplete'
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
  const resetSession = useGrammarGameStore((s) => s.resetSession);
  const attempts = useGrammarGameStore((s) => s.attempts);

  const {
    topic = 'noun_or_verb' as GrammarTopic,
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 5,
    sessionLength = 5,
    accuracy = 100,
  } = (route.params as any) || {};

  useEffect(() => {
    const praiseText = t('grammarChallenge.sessionCompletePraise', { lng: motherTongue });
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
    navigation.navigate('Games', {
      screen: 'GrammarChallengeGame' as any,
      params: { topic },
    });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetSession();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  const reportItems: GameQuestionReportItem[] = attempts.map((att) => ({
    roundNumber: att.roundNumber,
    questionLabel: `Grammar Question ${att.roundNumber}`,
    userAnswer: att.selectedOptionId || (att.isCorrect ? 'Correct' : 'Incorrect'),
    correctAnswer: 'Correct Option',
    isCorrect: att.isCorrect,
    attemptsCount: att.attemptCount,
    xpEarned: att.isCorrect ? (att.attemptCount === 1 ? 15 : 10) : 0,
  }));

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="library" />
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Mascot */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="celebrating" />
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {t('grammarChallenge.sessionCompleteTitle', 'Grammar Quest Complete!')}
            </Text>
            <Text style={styles.subtitle}>
              {t('grammarChallenge.sessionCompleteDesc', {
                defaultValue: 'You got {{correct}} of 5 questions correct!',
                correct: itemsCorrect,
              })}
            </Text>

            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3].map((starIndex) => (
                <View key={starIndex} style={starIndex === 2 ? styles.centerStar : undefined}>
                  <CuteStar
                    size={starIndex === 2 ? 'lg' : 'md'}
                    variant="gold"
                    style={{ opacity: starIndex <= starsEarned ? 1 : 0.25 }}
                  />
                </View>
              ))}
            </View>

            {/* Reward Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>⚡</Text>
                <Text style={styles.statValue}>+{xpEarned}</Text>
                <Text style={styles.statLabel}>{t('common.xp', 'XP Earned')}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statValue}>{accuracy}%</Text>
                <Text style={styles.statLabel}>{t('common.accuracy', 'Accuracy')}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>⏱️</Text>
                <Text style={styles.statValue}>{sessionLength}s</Text>
                <Text style={styles.statLabel}>{t('common.time', 'Time')}</Text>
              </View>
            </View>

            {/* Level / Total XP Info */}
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>
                🏆 {t('common.level', 'Level')} {currentLevel} • {totalXp}{' '}
                {t('common.totalXp', 'Total XP')}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <BigTouchTarget
                onPress={() => setShowReportModal(true)}
                accessibilityLabel="View Detailed Question Report"
                accessibilityRole="button"
                style={styles.viewReportBtn}
              >
                <Text style={styles.viewReportBtnText}>
                  📋 View Detailed Report
                </Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={handlePlayAgain}
                accessibilityLabel="Play this game again"
                style={styles.playAgainBtn}
              >
                <Text style={styles.playAgainBtnText}>
                  {t('common.playAgain', 'Play Again 🔄')}
                </Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={handleBackToCatalog}
                accessibilityLabel="Explore more games"
                style={styles.catalogBtn}
              >
                <Text style={styles.catalogBtnText}>
                  {t('common.moreGames', 'More Games 🎮')}
                </Text>
              </BigTouchTarget>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <GameAnalysisReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        gameTitle="Grammar Challenge"
        items={reportItems}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  homeButtonText: {
    fontSize: 22,
  },
  scrollContent: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mascotWrapper: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  centerStar: {
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#CBD5E1',
  },
  levelPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  viewReportBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    elevation: 2,
  },
  viewReportBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  playAgainBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  playAgainBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  catalogBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  catalogBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#475569',
  },
});

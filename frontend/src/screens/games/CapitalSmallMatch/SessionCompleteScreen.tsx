/**
 * Purpose: Complete Session Complete Screen for Capital & Small Letter Match.
 *          Displays playful rewards (Stars, XP, Accuracy), mascot celebration,
 *          submits session progress to backend API (game_type: "capital_small_match", difficulty: 1),
 *          and provides seamless navigation to re-play or return to the Game Catalog.
 * Module: Capital Small Match
 * Folder: frontend/src/screens/games/CapitalSmallMatch
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { useCapitalSmallMatchStore } from './store/capitalSmallMatchStore';
import { CapitalSmallMatchStackParamList } from './types';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { submitGameProgress } from '../../../services/progressService';
import { fetchRewardsSummary, RewardsSummaryData } from '../../../services/rewardsService';
import { fetchAchievements, AchievementsData } from '../../../services/achievementsService';
import { useProgressStore } from '../../../state/useProgressStore';
import { calculateLevelProgress } from '../../../config/xpConfig';
import { speakPraise } from '../../../services/praiseService';
import { triggerHapticSuccess } from '../../../services/hapticsService';

type NavProp = NativeStackNavigationProp<CapitalSmallMatchStackParamList>;
type RouteProps = RouteProp<CapitalSmallMatchStackParamList, 'CapitalSmallMatchSessionComplete'>;

export const SessionCompleteScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();

  const routeParams = route.params || {
    starsEarned: 3,
    xpEarned: 120,
    itemsCorrect: 12,
    sessionLength: 12,
    accuracy: 100,
    durationSeconds: 60,
    sessionResults: [],
  };

  const { starsEarned, xpEarned, itemsCorrect, sessionLength, accuracy, durationSeconds, sessionResults } = routeParams;
  const finalXpEarned = (xpEarned && xpEarned > 0) ? xpEarned : (itemsCorrect * 10);

  const resetSession = useCapitalSmallMatchStore((s) => s.resetSession);
  const itemsAttempted = useCapitalSmallMatchStore((s) => s.itemsAttempted);

  const [rewards, setRewards] = useState<RewardsSummaryData>(() => {
    const store = useProgressStore.getState();
    const info = calculateLevelProgress(store.totalXp);
    return {
      xp_total: info.totalXp,
      level: info.currentLevel,
      xp_earned_in_level: info.xpInCurrentLevel,
      xp_to_next_level: info.xpToNextLevel,
    };
  });
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);

  // Entrance Animation Values
  const mascotScale = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    return () => { mounted = false; };
  }, []);

  // Submit session progress & load rewards on mount
  useEffect(() => {
    let isMounted = true;
    const timeoutTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingRewards(false);
      }
    }, 1200);

    triggerHapticSuccess();
    speakPraise();

    const loadDataAndSubmit = async () => {
      try {
        // Fire submit in background non-blocking
        submitGameProgress({
          game_type: 'capital_small_match',
          difficulty: 1,
          items_attempted: itemsAttempted || itemsCorrect,
          items_correct: itemsCorrect,
          time_taken_seconds: durationSeconds,
        }).catch((err) => {
          console.warn('[CapitalSmallMatchSessionComplete] Non-critical progress submit error:', err);
        });

        const [rewardsRes, achievementsRes] = await Promise.allSettled([
          fetchRewardsSummary(),
          fetchAchievements(),
        ]);

        if (isMounted) {
          if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.data) {
            setRewards(rewardsRes.value.data);
          }
          if (achievementsRes.status === 'fulfilled' && achievementsRes.value?.data) {
            setAchievements(achievementsRes.value.data);
          }
        }
      } catch (err) {
        console.warn('[CapitalSmallMatchSessionComplete] Error fetching rewards:', err);
      } finally {
        if (isMounted) setIsLoadingRewards(false);
      }
    };

    loadDataAndSubmit();

    // Trigger entrance animations
    if (!reduceMotion) {
      mascotScale.value = withSpring(1, { damping: 10, stiffness: 180 });
      cardOpacity.value = withDelay(150, withTiming(1, { duration: 300 }));
      cardScale.value = withDelay(150, withSpring(1, { damping: 12, stiffness: 200 }));
      buttonsOpacity.value = withDelay(350, withTiming(1, { duration: 300 }));
    } else {
      mascotScale.value = 1;
      cardOpacity.value = 1;
      cardScale.value = 1;
      buttonsOpacity.value = 1;
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
    };
  }, [itemsAttempted, itemsCorrect, sessionLength, starsEarned, xpEarned, durationSeconds, reduceMotion, mascotScale, cardOpacity, cardScale, buttonsOpacity]);

  const handlePlayAgain = useCallback(() => {
    resetSession();
    navigation.navigate('CapitalSmallMatchGame');
  }, [resetSession, navigation]);

  const handleChooseGame = useCallback(() => {
    resetSession();
    navigation.getParent()?.navigate('GameCatalog');
  }, [resetSession, navigation]);

  const mascotAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const buttonsAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const containerWidth = Math.min(screenWidth - 32, 420);

  return (
    <View style={styles.webOuterContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2B5A" />
        <CartoonBackground theme="evening" />

        <View style={styles.contentContainer}>
          {/* Title Header */}
          <Text style={styles.titleText}>{t('game.correct', 'Great Job!')}</Text>

          {/* Main Reward Card */}
          <Animated.View style={[styles.card, { width: containerWidth }, cardAnimStyle]}>
            {/* 12-Star Session-Wide Progress Trail */}
            <View style={styles.starsRow}>
              <ProgressStarTrail
                current={sessionResults ? sessionResults.length : 12}
                total={12}
                roundResults={sessionResults || []}
              />
            </View>

            {/* Metrics Breakdown */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricBadge}>
                <Text style={styles.metricValue}>+{finalXpEarned} XP</Text>
                <Text style={styles.metricLabel}>Earned</Text>
              </View>

              <View style={styles.metricBadge}>
                <Text style={styles.metricValue}>{itemsCorrect}/{sessionLength}</Text>
                <Text style={styles.metricLabel}>Correct</Text>
              </View>
            </View>

            {/* Rewards Summary if available */}
            {isLoadingRewards ? (
              <ActivityIndicator color={Colors.primary.main} style={{ marginVertical: 8 }} />
            ) : rewards ? (
              <View style={styles.rewardsRow}>
                <Text style={styles.rewardsText}>
                  Total XP: ⭐ {rewards.xp_total} | Level: {rewards.level}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View style={[styles.buttonsContainer, { width: containerWidth }, buttonsAnimStyle]}>
            <BigTouchTarget
              onPress={handlePlayAgain}
              accessibilityLabel="Play Again"
              accessibilityRole="button"
              style={styles.playAgainButton}
            >
              <Text style={styles.playAgainButtonText}>▶ Play Again</Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handleChooseGame}
              accessibilityLabel="Choose Game"
              accessibilityRole="button"
              style={styles.chooseGameButton}
            >
              <Text style={styles.chooseGameButtonText}>🌐 Choose Game</Text>
            </BigTouchTarget>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
});

SessionCompleteScreen.displayName = 'CapitalSmallMatchSessionCompleteScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#1B2B5A',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1B2B5A',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  mascotWrapper: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: Colors.sessionComplete.cardBg,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: Colors.sessionComplete.cardBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  starWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 44,
  },
  starUnearned: {
    opacity: 0.35,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  metricBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    minWidth: 90,
  },
  metricValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#0F2042',
  },
  metricLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rewardsRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#BAE6FD',
    width: '100%',
    alignItems: 'center',
  },
  rewardsText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: 14,
    color: '#1E40AF',
  },
  buttonsContainer: {
    gap: 10,
    width: '100%',
  },
  playAgainButton: {
    width: '100%',
    height: 52,
    minHeight: 52,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  playAgainButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  chooseGameButton: {
    width: '100%',
    height: 48,
    minHeight: 48,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 5,
    borderBottomColor: '#1D4ED8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  chooseGameButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
});

/**
 * Purpose: Session Complete Screen for Vowel & Matra Match game.
 * Module: Vowel Matra Match
 * Folder: frontend/src/screens/games/VowelMatraMatch
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

import { useVowelMatraMatchStore } from './store/vowelMatraMatchStore';
import { VowelMatraMatchStackParamList } from './types';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { submitGameProgress } from '../../../services/progressService';
import { fetchRewardsSummary, RewardsSummaryData } from '../../../services/rewardsService';
import { useProgressStore } from '../../../state/useProgressStore';
import { calculateLevelProgress } from '../../../config/xpConfig';
import { triggerHapticSuccess } from '../../../services/hapticsService';
import { speakPraise } from '../../../services/praiseService';

type NavProp = NativeStackNavigationProp<VowelMatraMatchStackParamList>;
type RouteProps = RouteProp<VowelMatraMatchStackParamList, 'VowelMatraMatchSessionComplete'>;

export const SessionCompleteScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();

  const routeParams = route.params || {
    starsEarned: 3,
    xpEarned: 110,
    itemsCorrect: 11,
    sessionLength: 11,
    accuracy: 100,
    durationSeconds: 60,
    sessionResults: [],
  };

  const { xpEarned, itemsCorrect, sessionLength, durationSeconds, sessionResults } = routeParams;
  const finalXpEarned = xpEarned && xpEarned > 0 ? xpEarned : itemsCorrect * 10;

  const resetSession = useVowelMatraMatchStore((s) => s.resetSession);
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
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);

  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    return () => {
      mounted = false;
    };
  }, []);

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
          game_type: 'vowel_matra_match',
          difficulty: 1,
          items_attempted: itemsCorrect,
          items_correct: itemsCorrect,
          time_taken_seconds: durationSeconds,
        }).catch((err) => {
          console.warn('[VowelMatraMatchSessionComplete] Non-critical progress submit error:', err);
        });

        const rewardsRes = await fetchRewardsSummary();
        if (isMounted && rewardsRes?.success && rewardsRes?.data) {
          setRewards(rewardsRes.data);
        }
      } catch (err) {
        console.warn('[VowelMatraMatchSessionComplete] Progress submit error:', err);
      } finally {
        if (isMounted) setIsLoadingRewards(false);
      }
    };

    loadDataAndSubmit();

    if (!reduceMotion) {
      cardOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withSpring(1, { damping: 10, stiffness: 150 });
      buttonsOpacity.value = withDelay(350, withTiming(1, { duration: 300 }));
    } else {
      cardOpacity.value = 1;
      cardScale.value = 1;
      buttonsOpacity.value = 1;
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
    };
  }, [itemsCorrect, durationSeconds, reduceMotion, cardOpacity, cardScale, buttonsOpacity]);

  const handlePlayAgain = useCallback(() => {
    resetSession();
    navigation.navigate('VowelMatraMatchGame');
  }, [resetSession, navigation]);

  const handleChooseGame = useCallback(() => {
    resetSession();
    navigation.getParent()?.navigate('GameCatalog');
  }, [resetSession, navigation]);

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
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <CartoonBackground theme="evening" />

        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{t('sessionComplete.greatJob')}</Text>

          <Animated.View style={[styles.card, { width: containerWidth }, cardAnimStyle]}>
            <View style={styles.starsRow}>
              <ProgressStarTrail
                current={sessionResults ? sessionResults.length : 11}
                total={11}
                roundResults={sessionResults || []}
              />
            </View>

            <View style={styles.metricsContainer}>
              <View style={styles.metricBadge}>
                <Text style={styles.metricValue}>+{finalXpEarned} XP</Text>
                <Text style={styles.metricLabel}>{t('sessionComplete.earned')}</Text>
              </View>

              <View style={styles.metricBadge}>
                <Text style={styles.metricValue}>
                  {t('sessionComplete.correct', { correct: itemsCorrect, total: sessionLength })}
                </Text>
              </View>
            </View>

            {isLoadingRewards ? (
              <ActivityIndicator color={Colors.primary.main} style={{ marginVertical: 8 }} />
            ) : rewards ? (
              <View style={styles.rewardsRow}>
                <Text style={styles.rewardsText}>
                  {t('sessionComplete.totalXpLevel', { xp: rewards.xp_total, level: rewards.level })}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          <Animated.View style={[styles.buttonsContainer, { width: containerWidth }, buttonsAnimStyle]}>
            <BigTouchTarget
              onPress={handlePlayAgain}
              accessibilityLabel={t('sessionComplete.playAgain')}
              accessibilityRole="button"
              style={styles.playAgainButton}
            >
              <Text style={styles.playAgainButtonText}>{t('sessionComplete.playAgain')}</Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handleChooseGame}
              accessibilityLabel={t('sessionComplete.chooseGame')}
              accessibilityRole="button"
              style={styles.chooseGameButton}
            >
              <Text style={styles.chooseGameButtonText}>{t('sessionComplete.chooseGame')}</Text>
            </BigTouchTarget>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
});

SessionCompleteScreen.displayName = 'VowelMatraMatchSessionCompleteScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1E1B4B',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  starsRow: {
    width: '100%',
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    marginBottom: 16,
  },
  metricBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  metricValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#0F172A',
  },
  metricLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rewardsRow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  rewardsText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#92400E',
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  chooseGameButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});

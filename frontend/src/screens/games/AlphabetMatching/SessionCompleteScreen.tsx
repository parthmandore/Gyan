/**
 * Purpose: Redesigned Session Complete screen — Mobile-first, playful children's reward screen
 *          matching Khan Kids / Duolingo ABC aesthetic with zero star count mismatch.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useAlphabetMatchingStore } from './store/alphabetMatchingStore';
import { useSpeechPlaybackStore } from './store/speechPlaybackStore';
import { AlphabetMatchingStackParamList, GameMode } from './types';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import {
  fetchRewardsSummary,
  RewardsSummaryData,
} from '../../../services/rewardsService';
import {
  fetchAchievements,
  AchievementsData,
  EarnedBadge,
} from '../../../services/achievementsService';
import { useProgressStore } from '../../../state/useProgressStore';
import { calculateLevelProgress } from '../../../config/xpConfig';

const BADGE_ICONS: Record<string, string> = {
  quick_learner: '⚡',
  reading_streak_7: '🔥',
  first_session: '🌟',
  perfect_round: '🎯',
};
const DEFAULT_BADGE_ICON = '🏆';

type NavigationProp = NativeStackNavigationProp<
  AlphabetMatchingStackParamList,
  'AlphabetMatchingSessionComplete'
>;

export const SessionCompleteScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();

  const itemsCorrect = useAlphabetMatchingStore((state) => state.itemsCorrect);
  const sessionLength = useAlphabetMatchingStore((state) => state.sessionLength) || 10;
  const mode = useAlphabetMatchingStore((state) => state.mode);
  const setMode = useAlphabetMatchingStore((state) => state.setMode);
  const resetSession = useAlphabetMatchingStore((state) => state.resetSession);
  const resetPlaybackState = useSpeechPlaybackStore((state) => state.resetPlaybackState);

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
  const [rewardsFetchFailed, setRewardsFetchFailed] = useState(false);

  const capturedModeRef = useRef<GameMode>(mode);

  // Entrance Reanimated Values
  const mascotScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const scoreCardScale = useSharedValue(0.85);
  const scoreCardOpacity = useSharedValue(0);
  const xpCardOpacity = useSharedValue(0);
  const xpCardTranslateY = useSharedValue(25);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);
  const xpBarWidth = useSharedValue(0);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled: boolean) => {
      if (isMounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        if (isMounted) setReduceMotion(enabled);
      }
    );
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    mascotScale.value = withSpring(1, { damping: 8, stiffness: 120 });
    titleOpacity.value = withDelay(150, withTiming(1, { duration: 350 }));
    titleTranslateY.value = withDelay(150, withSpring(0, { damping: 12, stiffness: 100 }));

    scoreCardScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 140 }));
    scoreCardOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

    xpCardOpacity.value = withDelay(500, withTiming(1, { duration: 350 }));
    xpCardTranslateY.value = withDelay(500, withSpring(0, { damping: 12, stiffness: 100 }));

    buttonsOpacity.value = withDelay(700, withTiming(1, { duration: 350 }));
    buttonsTranslateY.value = withDelay(700, withSpring(0, { damping: 12, stiffness: 100 }));
  }, [
    mascotScale,
    titleOpacity,
    titleTranslateY,
    scoreCardScale,
    scoreCardOpacity,
    xpCardOpacity,
    xpCardTranslateY,
    buttonsOpacity,
    buttonsTranslateY,
  ]);

  useEffect(() => {
    let isMounted = true;
    const timeoutTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingRewards(false);
      }
    }, 1200);

    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          fetchRewardsSummary(),
          fetchAchievements(),
        ]);

        if (!isMounted) return;

        const rewardsResult = results[0];
        if (rewardsResult.status === 'fulfilled' && rewardsResult.value?.success && rewardsResult.value?.data) {
          setRewards(rewardsResult.value.data);
        }

        const achievementsResult = results[1];
        if (achievementsResult.status === 'fulfilled' && achievementsResult.value?.success && achievementsResult.value?.data) {
          setAchievements(achievementsResult.value.data);
        }
      } catch (error) {
        console.warn('[AlphabetMatchingSessionComplete] Error fetching rewards/achievements:', error);
      } finally {
        if (isMounted) {
          setIsLoadingRewards(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
    };
  }, []);

  useEffect(() => {
    if (rewards) {
      const totalSpan = rewards.xp_earned_in_level + rewards.xp_to_next_level;
      const progressFraction =
        totalSpan > 0 ? Math.min(1, Math.max(0, rewards.xp_earned_in_level / totalSpan)) : 0.65;

      xpBarWidth.value = withDelay(
        600,
        withTiming(progressFraction * 100, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        }),
      );
    }
  }, [rewards, xpBarWidth]);

  const handlePlayAgain = useCallback(() => {
    const previousMode = capturedModeRef.current;
    resetSession();
    resetPlaybackState();
    if (previousMode) setMode(previousMode);
    navigation.navigate('AlphabetMatchingGame');
  }, [resetSession, resetPlaybackState, setMode, navigation]);

  const handleChooseGame = useCallback(() => {
    resetSession();
    resetPlaybackState();
    navigation.navigate('AlphabetMatchingModeSelection');
  }, [resetSession, resetPlaybackState, navigation]);

  const mascotAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ scale: 1 }] };
    return { transform: [{ scale: mascotScale.value }] };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ translateY: 0 }] };
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const scoreCardAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ scale: 1 }] };
    return {
      opacity: scoreCardOpacity.value,
      transform: [{ scale: scoreCardScale.value }],
    };
  });

  const xpCardAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ translateY: 0 }] };
    return {
      opacity: xpCardOpacity.value,
      transform: [{ translateY: xpCardTranslateY.value }],
    };
  });

  const buttonsAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ translateY: 0 }] };
    return {
      opacity: buttonsOpacity.value,
      transform: [{ translateY: buttonsTranslateY.value }],
    };
  });

  const xpBarAnimatedStyle = useAnimatedStyle(() => ({
    width: `${xpBarWidth.value}%`,
  }));

  const accuracyFraction = sessionLength > 0 ? itemsCorrect / sessionLength : 0;
  const accuracyPercentage = Math.round(accuracyFraction * 100);
  const encouragementText = accuracyFraction >= 0.8 ? t('sessionComplete.amazingWork') : t('sessionComplete.greatEffort');

  const earnedBadges: EarnedBadge[] = achievements?.earned ?? [];
  const cardWidth = Math.min(screenWidth - 32, 380);

  // Render Large Animated Stars Row: Golden Stars for correct, Red Stars for missed/wrong
  const renderLargeStarsRow = () => {
    const starNodes = [];
    for (let i = 1; i <= sessionLength; i++) {
      const isFilled = i <= itemsCorrect;
      starNodes.push(
        <Text key={i} style={[styles.largeStarItem, isFilled ? styles.largeStarFilled : styles.largeStarRed]}>
          {isFilled ? '⭐' : '★'}
        </Text>
      );
    }
    return starNodes;
  };

  return (
    <View style={styles.webOuterContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2B5A" />

        {/* Playful Layered Background Scenery */}
        <CartoonBackground />

        <View style={styles.contentContainer}>
          {/* Celebratory Title */}
          <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
            <Text style={styles.titleText}>🎉 {t('game.greatJob')}</Text>
            <Text style={styles.subtitleText}>{t('game.finishedGame')}</Text>
          </Animated.View>

          {/* Large Animated Stars Row */}
          <View style={styles.starsRowContainer}>
            {renderLargeStarsRow()}
          </View>

          {/* Rounded Reward Score Card */}
          <Animated.View
            style={[
              styles.rewardScoreCard,
              { width: cardWidth },
              scoreCardAnimatedStyle,
            ]}
          >
            <View style={styles.scoreHeaderRow}>
              <Text style={styles.scoreCardTitle}>⭐ {t('sessionComplete.score')}</Text>
              <View style={styles.percentagePill}>
                <Text style={styles.percentagePillText}>{accuracyPercentage}%</Text>
              </View>
            </View>

            <Text style={styles.scoreFractionText}>
              {t('sessionComplete.correct', { correct: itemsCorrect, total: sessionLength })}
            </Text>

            <Text style={styles.encouragementText}>{encouragementText}</Text>
          </Animated.View>

          {/* Fun XP & Level Card */}
          {!rewardsFetchFailed && (
            <Animated.View
              style={[
                styles.xpRewardCard,
                { width: cardWidth },
                xpCardAnimatedStyle,
              ]}
            >
              {isLoadingRewards ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                </View>
              ) : (
                <>
                  <View style={styles.xpHeaderRow}>
                    <View style={styles.levelBadgePill}>
                      <Text style={styles.levelBadgeText}>
                        ⭐ {t('sessionComplete.level', { level: rewards?.level || 1 })}
                      </Text>
                    </View>
                    <Text style={styles.xpEarnedText}>+{rewards?.xp_earned_in_level || 100} XP</Text>
                  </View>

                  {/* Animated XP Progress Bar */}
                  <View style={styles.xpBarTrack}>
                    <Animated.View style={[styles.xpBarFill, xpBarAnimatedStyle]} />
                  </View>
                </>
              )}
            </Animated.View>
          )}

          {/* Earned Badges Section */}
          {earnedBadges.length > 0 && (
            <View style={[styles.badgesSection, { width: cardWidth }]}>
              <Text style={styles.badgesSectionTitle}>{t('sessionComplete.badgesEarned')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesScrollContent}
              >
                {earnedBadges.map((badge) => {
                  const icon = BADGE_ICONS[badge.badge_id] || DEFAULT_BADGE_ICON;
                  const badgeText = t(`badge.${badge.badge_id}`, {
                    defaultValue: badge.badge_id.replace('_', ' '),
                  });

                  return (
                    <View key={badge.badge_id} style={styles.badgeCard}>
                      <Text style={styles.badgeIcon}>{icon}</Text>
                      <Text style={styles.badgeTitle}>{badgeText}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Action Buttons: Play Again & Choose Mode */}
          <Animated.View
            style={[
              styles.buttonsContainer,
              { width: cardWidth },
              buttonsAnimatedStyle,
            ]}
          >
            <BigTouchTarget
              onPress={handlePlayAgain}
              accessibilityLabel={t('sessionComplete.playAgain')}
              style={styles.primaryPlayAgainButton}
            >
              <Text style={styles.primaryPlayAgainText}>{t('sessionComplete.playAgain')} 🔄</Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handleChooseGame}
              accessibilityLabel={t('sessionComplete.chooseGame')}
              style={styles.secondaryChooseModeButton}
            >
              <Text style={styles.secondaryChooseModeText}>{t('sessionComplete.chooseGame')} 🎮</Text>
            </BigTouchTarget>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
});

SessionCompleteScreen.displayName = 'SessionCompleteScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#1B2B5A',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1B2B5A',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
  },

  /* Top Section */
  mascotContainer: {
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 26,
    color: '#0F2042',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#1E3A8A',
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  /* Large Stars Row */
  starsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  largeStarItem: {
    fontSize: 24,
  },
  largeStarFilled: {
    textShadowColor: 'rgba(253, 224, 71, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  largeStarRed: {
    color: '#EF4444',
    textShadowColor: 'rgba(239, 68, 68, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  /* Rounded Reward Score Card */
  rewardScoreCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    borderWidth: 3,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#0F2042',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  scoreHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreCardTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#0F2042',
  },
  percentagePill: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  percentagePillText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#0284C7',
  },
  scoreFractionText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 4,
  },
  encouragementText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#16A34A',
    textAlign: 'center',
  },

  /* Fun XP & Level Card */
  xpRewardCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  xpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelBadgePill: {
    backgroundColor: '#FDE047',
    borderColor: '#EAB308',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  levelBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#713F12',
  },
  xpEarnedText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#2563EB',
  },
  xpBarTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#CBD5E1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },

  /* Badges Section */
  badgesSection: {
    marginBottom: 8,
  },
  badgesSectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  badgesScrollContent: {
    gap: 8,
  },
  badgeCard: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderColor: '#FDE047',
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  badgeTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 10,
    color: '#0F2042',
    textAlign: 'center',
  },

  /* Action Buttons */
  buttonsContainer: {
    gap: 8,
    marginTop: 4,
  },
  primaryPlayAgainButton: {
    width: '100%',
    height: 52,
    minHeight: 52,
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    borderWidth: 3,
    borderBottomWidth: 5,
    borderBottomColor: '#1E40AF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryPlayAgainText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  secondaryChooseModeButton: {
    width: '100%',
    height: 48,
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 2,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryChooseModeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#0F2042',
  },
});

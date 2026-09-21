/**
 * Purpose: Session Complete Screen for Language Pair Match (Age 6).
 *          Celebrates successful completion with rotating 3-star reward cluster,
 *          XP awarded, accuracy metrics, match report launcher, and safe speech cleanup.
 * Module: Language Pair Match — Screens
 * Folder: frontend/src/screens/games/LanguagePairMatch
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CartoonBackground } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { LanguagePairReportModal } from './components/LanguagePairReportModal';
import { Typography } from '../../../theme/typography';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useLanguagePairMatchStore } from './store/useLanguagePairMatchStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { LanguagePairMatchStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const SessionCompleteScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<LanguagePairMatchStackParamList, 'LanguagePairMatchSessionComplete'>>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const resetSession = useLanguagePairMatchStore((s) => s.resetSession);
  const setSessionStartTime = useLanguagePairMatchStore((s) => s.setSessionStartTime);
  const roundAttempts = useLanguagePairMatchStore((s) => s.roundAttempts);

  const [showReportModal, setShowReportModal] = useState(false);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 10,
    sessionLength = 10,
    accuracy = 100,
  } = route.params || {};

  const starScale = useSharedValue(0.5);

  useEffect(() => {
    starScale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 120 }),
      withTiming(1.0, { duration: 300 })
    );

    const praiseText = t(
      'languagePairMatch.sessionCompletePraise',
      'Awesome job! You matched the language pairs!'
    );
    speakPhrase(praiseText, { language: motherTongue });

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      unsubscribe();
      stopSpeech();
    };
  }, [motherTongue, starScale, navigation, t]);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const handlePlayAgain = () => {
    stopSpeech();
    resetSession();
    setSessionStartTime(Date.now());
    navigation.navigate('Games', {
      screen: 'LanguagePairMatchGame' as any,
    });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    resetSession();
    navigation.navigate('GameCatalog');
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  return (
    <View style={styles.webOuterContainer}>
      <CartoonBackground theme="evening" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.contentContainer}>
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Mascot */}
            <View style={styles.mascotContainer}>
              <MascotCharacter state="celebrating" style={{ width: 80, height: 80 }} />
            </View>

            {/* Stars Cluster */}
            <Animated.View style={[styles.starsRow, starAnimatedStyle]}>
              <Text style={styles.starGlyph}>{starsEarned >= 1 ? '⭐' : '☆'}</Text>
              <Text style={[styles.starGlyph, styles.centerStar]}>
                {starsEarned >= 2 ? '⭐' : '☆'}
              </Text>
              <Text style={styles.starGlyph}>{starsEarned >= 3 ? '⭐' : '☆'}</Text>
            </Animated.View>

            {/* Title */}
            <Text style={styles.titleText}>
              {t('languagePairMatch.sessionCompleteTitle', 'Language Adventure Complete!')}
            </Text>

            {/* Subtitle description */}
            <Text style={styles.subtitleText}>
              {t(
                'languagePairMatch.sessionCompleteDesc',
                `You matched ${itemsCorrect} of ${sessionLength} pairs!`,
                { correct: itemsCorrect, total: sessionLength }
              )}
            </Text>

            {/* Summary Metrics Bar */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>🎯 {accuracy}%</Text>
                <Text style={styles.metricLabel}>{t('common.accuracy', 'Accuracy')}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: '#059669' }]}>
                  ✓ {itemsCorrect}
                </Text>
                <Text style={styles.metricLabel}>{t('common.correct', 'Matched')}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: '#EC4899' }]}>
                  +{xpEarned} XP
                </Text>
                <Text style={styles.metricLabel}>{t('common.xpEarned', 'XP Earned')}</Text>
              </View>
            </View>

            {/* View Report Button */}
            <BigTouchTarget
              onPress={() => setShowReportModal(true)}
              accessibilityLabel={t('languagePairMatch.seeReport', 'See Match Report')}
              accessibilityRole="button"
              style={styles.reportButton}
            >
              <Text style={styles.reportButtonText}>
                📊 {t('languagePairMatch.seeReport', 'See Match Report')}
              </Text>
            </BigTouchTarget>

            {/* Action Buttons: Play Again & Catalog */}
            <View style={styles.actionsRow}>
              <BigTouchTarget
                onPress={handlePlayAgain}
                accessibilityLabel={t('common.playAgain', 'Play Again')}
                accessibilityRole="button"
                style={styles.playAgainBtn}
              >
                <Text style={styles.playAgainBtnText}>
                  🔄 {t('common.playAgain', 'Play Again')}
                </Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={handleBackToCatalog}
                accessibilityLabel={t('common.catalog', 'Games Hub')}
                accessibilityRole="button"
                style={styles.catalogBtn}
              >
                <Text style={styles.catalogBtnText}>
                  🏠 {t('common.catalog', 'Games Hub')}
                </Text>
              </BigTouchTarget>
            </View>
          </View>
        </View>

        {/* Detailed Match Report Modal */}
        <LanguagePairReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          attempts={roundAttempts}
          totalPairs={sessionLength}
        />
      </SafeAreaView>
    </View>
  );
});

SessionCompleteScreen.displayName = 'LanguagePairMatchSessionCompleteScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 6,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  mascotContainer: {
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starGlyph: {
    fontSize: 32,
  },
  centerStar: {
    fontSize: 42,
    marginTop: -4,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 10,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#1E3A8A',
  },
  metricLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  reportButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
    width: '100%',
    height: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#334155',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  playAgainBtn: {
    flex: 1,
    backgroundColor: '#EC4899',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F472B6',
    borderBottomWidth: 4,
    borderBottomColor: '#BE185D',
    height: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playAgainBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  catalogBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#60A5FA',
    borderBottomWidth: 4,
    borderBottomColor: '#1D4ED8',
    height: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

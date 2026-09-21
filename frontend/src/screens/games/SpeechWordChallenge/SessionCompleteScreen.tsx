/**
 * Purpose: Session Complete / Reward screen for Speech Word Challenge.
 *          Features Star celebrations, detailed Speech Report button, Play Again, and Back to Catalog.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge
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

import { StorybookGardenBackground } from './components/StorybookGardenBackground';
import { SpeechReportModal } from './components/SpeechReportModal';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { Typography } from '../../../theme/typography';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useSpeechWordChallengeStore } from './store/speechWordChallengeStore';
import { speakPhrase } from '../../../services/speechService';
import { SpeechWordChallengeStackParamList } from './types';
import { RootStackParamList } from '../../../types';

type SessionCompleteRouteProp = RouteProp<
  SpeechWordChallengeStackParamList,
  'SpeechWordChallengeSessionComplete'
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const SessionCompleteScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SessionCompleteRouteProp>();
  const { width: screenWidth } = useWindowDimensions();
  const selectedLanguage = useAppLanguageStore((s) => s.selectedLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;
  const resetSession = useSpeechWordChallengeStore((s) => s.resetSession);
  const setSessionStartTime = useSpeechWordChallengeStore((s) => s.setSessionStartTime);
  const sessionAttempts = useSpeechWordChallengeStore((s) => s.sessionAttempts);

  const [showReportModal, setShowReportModal] = useState(false);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 10,
    sessionLength = 10,
    accuracy = 100,
  } = route.params || {};

  const needsPracticeCount = Math.max(0, sessionLength - itemsCorrect);

  useEffect(() => {
    const praise =
      selectedLanguage === 'hi'
        ? 'बहुत बढ़िया! आपने सभी शब्द बहुत अच्छे से बोले!'
        : selectedLanguage === 'mr'
        ? 'अभिनंदन! तुम्ही सर्व शब्द खूप छान बोललात!'
        : 'Awesome speaking! You earned stars for speaking clearly!';
    speakPhrase(praise);
  }, [selectedLanguage]);

  const handlePlayAgain = () => {
    resetSession();
    setSessionStartTime(Date.now());
    navigation.navigate('Games', { screen: 'SpeechWordChallengeGame' as any });
  };

  const handleBackToCatalog = () => {
    resetSession();
    navigation.navigate('GameCatalog');
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  return (
    <View style={styles.webOuterContainer}>
      <StorybookGardenBackground />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#7DD3FC" />

        <View style={styles.contentContainer}>
          {/* Main Reward Card */}
          <View style={[styles.rewardCard, { width: containerWidth }]}>
            <View style={styles.cardHighlight} />

            {/* Mascot Celebrating */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="celebrating" style={styles.mascot} />
            </View>

            <Text style={styles.titleText}>
              {t('speechWordChallenge.sessionCompleteTitle')}
            </Text>

            <Text style={styles.subtitleText}>
              {t('speechWordChallenge.sessionCompleteDesc', {
                correct: itemsCorrect,
                total: sessionLength,
              })}
            </Text>

            {/* Star & XP Summary Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statValue}>{starsEarned}</Text>
                <Text style={styles.statLabel}>{t('speechWordChallenge.stars')}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statValue}>{accuracy}%</Text>
                <Text style={styles.statLabel}>{t('speechWordChallenge.accuracy')}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={styles.statValue}>+{xpEarned}</Text>
                <Text style={styles.statLabel}>{t('speechWordChallenge.xp')}</Text>
              </View>
            </View>

            {/* Accuracy Breakdown Banner */}
            <View style={styles.breakdownBanner}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownItemText}>
                  ✓ {t('speechWordChallenge.correct')}: <Text style={{ color: '#15803D' }}>{itemsCorrect}</Text>
                </Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownItemText}>
                  ✗ {t('speechWordChallenge.needsPractice')}: <Text style={{ color: '#B45309' }}>{needsPracticeCount}</Text>
                </Text>
              </View>
            </View>

            {/* "See My Speech Report" Action Button */}
            <BigTouchTarget
              onPress={() => setShowReportModal(true)}
              accessibilityLabel={t('speechWordChallenge.seeMyReport')}
              accessibilityRole="button"
              style={styles.seeReportButton}
            >
              <Text style={styles.seeReportButtonText}>📊 {t('speechWordChallenge.seeMyReport')}</Text>
            </BigTouchTarget>

            {/* Action Buttons */}
            <View style={styles.actionButtonsCol}>
              <BigTouchTarget
                onPress={handlePlayAgain}
                accessibilityLabel={t('speechWordChallenge.playAgain')}
                accessibilityRole="button"
                style={styles.playAgainButton}
              >
                <Text style={styles.playAgainButtonText}>🔄 {t('speechWordChallenge.playAgain')}</Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={handleBackToCatalog}
                accessibilityLabel={t('speechWordChallenge.gameCatalog')}
                accessibilityRole="button"
                style={styles.catalogButton}
              >
                <Text style={styles.catalogButtonText}>🏠 {t('speechWordChallenge.gameCatalog')}</Text>
              </BigTouchTarget>
            </View>
          </View>
        </View>

        {/* Detailed Speech Report Modal */}
        <SpeechReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          attempts={sessionAttempts}
          totalRounds={sessionLength}
        />
      </SafeAreaView>
    </View>
  );
});

SessionCompleteScreen.displayName = 'SessionCompleteScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#0E7490',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    maxHeight: 920,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FBCFE8',
    borderBottomWidth: 6,
    borderBottomColor: '#F472B6',
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHighlight: {
    position: 'absolute',
    top: 3,
    left: 12,
    right: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(244, 114, 182, 0.3)',
  },
  mascotWrapper: {
    width: 72,
    height: 72,
    marginBottom: 4,
  },
  mascot: {
    width: 72,
    height: 72,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#831843',
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FDF2F8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    borderBottomWidth: 3,
    borderBottomColor: '#FBCFE8',
    paddingVertical: 6,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 1,
  },
  statValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 17,
    color: '#831843',
  },
  statLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 10,
    color: '#9D174D',
    marginTop: 1,
  },
  breakdownBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownItemText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#334155',
  },
  breakdownDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  seeReportButton: {
    width: '100%',
    minHeight: 42,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderBottomWidth: 3,
    borderBottomColor: '#93C5FD',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  seeReportButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#1D4ED8',
  },
  actionButtonsCol: {
    width: '100%',
    gap: 8,
  },
  playAgainButton: {
    width: '100%',
    minHeight: 46,
    backgroundColor: '#EC4899',
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: '#BE185D',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  playAgainButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  catalogButton: {
    width: '100%',
    minHeight: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderBottomWidth: 3,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#374151',
  },
});

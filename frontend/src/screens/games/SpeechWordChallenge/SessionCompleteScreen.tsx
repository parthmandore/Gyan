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
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>

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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
    alignItems: 'center',
  },
  rewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#FBCFE8',
    borderBottomWidth: 8,
    borderBottomColor: '#F472B6',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHighlight: {
    position: 'absolute',
    top: 4,
    left: 12,
    right: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(244, 114, 182, 0.3)',
  },
  mascotWrapper: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  mascot: {
    width: 100,
    height: 100,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: '#831843',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FDF2F8',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FCE7F3',
    borderBottomWidth: 4,
    borderBottomColor: '#FBCFE8',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#831843',
  },
  statLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#9D174D',
    marginTop: 1,
  },
  breakdownBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownItemText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#334155',
  },
  breakdownDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  seeReportButton: {
    width: '100%',
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderBottomWidth: 4,
    borderBottomColor: '#93C5FD',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  seeReportButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#1D4ED8',
  },
  actionButtonsCol: {
    width: '100%',
    gap: 10,
  },
  playAgainButton: {
    backgroundColor: '#EC4899',
    borderRadius: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#BE185D',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  playAgainButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  catalogButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderBottomWidth: 4,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#374151',
  },
});

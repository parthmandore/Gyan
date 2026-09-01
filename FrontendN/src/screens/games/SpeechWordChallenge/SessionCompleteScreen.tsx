/**
 * Purpose: Session Complete / Reward screen for Speech Word Challenge.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge
 */

import React, { useEffect } from 'react';
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
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { Colors } from '../../../theme/colors';
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
  const resetSession = useSpeechWordChallengeStore((s) => s.resetSession);
  const setSessionStartTime = useSpeechWordChallengeStore((s) => s.setSessionStartTime);

  const {
    starsEarned = 3,
    xpEarned = 50,
    itemsCorrect = 10,
    sessionLength = 10,
    accuracy = 100,
  } = route.params || {};

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
          {/* Main Card */}
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
    width: 110,
    height: 110,
    marginBottom: 8,
  },
  mascot: {
    width: 110,
    height: 110,
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
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 22,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FDF2F8',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FCE7F3',
    borderBottomWidth: 4,
    borderBottomColor: '#FBCFE8',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#831843',
  },
  statLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#9D174D',
    marginTop: 2,
  },
  actionButtonsCol: {
    width: '100%',
    gap: 12,
  },
  playAgainButton: {
    width: '100%',
    height: 54,
    minHeight: 56,
    backgroundColor: '#EC4899',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 6,
    borderBottomColor: '#BE185D',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  playAgainButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  catalogButton: {
    width: '100%',
    height: 50,
    minHeight: 52,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#475569',
    borderBottomWidth: 5,
    borderBottomColor: '#1E293B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
});

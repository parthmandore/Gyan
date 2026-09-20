/**
 * Purpose: Intro and onboarding screen for Language Pair Match (Age 6).
 *          Introduces the language translation pair challenge, handles
 *          same-language guard gracefully, and provides accessible navigation.
 * Module: Language Pair Match — Screens
 * Folder: frontend/src/screens/games/LanguagePairMatch
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { Typography } from '../../../theme/typography';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useLanguagePairMatchStore } from './store/useLanguagePairMatchStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { RootStackParamList } from '../../../types';
import { LanguageCode } from './types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

const LANGUAGE_NAMES: Record<LanguageCode, { en: string; native: string; flag: string }> = {
  en: { en: 'English', native: 'English', flag: '🔤' },
  hi: { en: 'Hindi', native: 'हिन्दी', flag: '🗣️' },
  mr: { en: 'Marathi', native: 'मराठी', flag: '📚' },
};

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();

  const isInitialized = useAppLanguageStore((s) => s.isInitialized);
  const rawMotherTongue = useAppLanguageStore((s) => s.motherTongue);
  const rawLearningLanguage = useAppLanguageStore((s) => s.learningLanguage);
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 6;
  const appLanguage = useAppLanguageStore((s) => s.appLanguage) || rawMotherTongue || 'en';

  const motherTongue = (rawMotherTongue || 'en') as LanguageCode;
  const learningLanguage = (rawLearningLanguage || (rawMotherTongue === 'en' ? 'hi' : 'en')) as LanguageCode;

  console.log(
    `[LANGUAGE DEBUG] LanguagePairMatch Intro: motherTongue = ${motherTongue}, learningLanguage = ${learningLanguage}, appLanguage = ${appLanguage}, age = ${selectedAge}, isInitialized = ${isInitialized}`
  );

  const resetSession = useLanguagePairMatchStore((s) => s.resetSession);
  const setSessionStartTime = useLanguagePairMatchStore((s) => s.setSessionStartTime);

  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const isSameLanguage = motherTongue === learningLanguage;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      unsubscribe();
      stopSpeech();
    };
  }, [navigation]);

  const handleStartGame = () => {
    stopSpeech();
    if (isSameLanguage) return;

    resetSession();
    setSessionStartTime(Date.now());
    navigation.navigate('Games', {
      screen: 'LanguagePairMatchGame' as any,
      params: {
        motherTongue,
        learningLanguage,
      },
    });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    navigation.navigate('GameCatalog');
  };

  const handleSwitchLanguage = () => {
    stopSpeech();
    navigation.navigate('LanguageGate', { initialStep: 'learningLanguage' });
  };

  const containerWidth = Math.min(screenWidth - 32, 420);
  const sourceInfo = LANGUAGE_NAMES[motherTongue] || LANGUAGE_NAMES.en;
  const targetInfo = LANGUAGE_NAMES[learningLanguage] || LANGUAGE_NAMES.hi;

  if (!isInitialized || !rawMotherTongue || !rawLearningLanguage) {
    return (
      <View style={styles.webOuterContainer}>
        <CartoonBackground theme="hub" />
        <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.webOuterContainer}>
      <CartoonBackground theme="hub" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#7DD3FC" />

        {/* Top Header Card */}
        <View style={[styles.headerCard, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={handleBackToCatalog}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← {t('common.back')}</Text>
          </BigTouchTarget>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitleText}>
              {t('games.languagePairMatch.title', 'Language Pair Match')}
            </Text>
            <Text style={styles.headerSubtitleText}>
              {t('languagePairMatch.subtitle', 'Language Adventure')}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Hero Card */}
          <View style={[styles.heroCard, { width: containerWidth }]}>
            {/* Age Badge */}
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>🚀 Age 6 • Language Adventure</Text>
            </View>

            {/* Mascot */}
            <View style={styles.mascotContainer}>
              <MascotCharacter state="idle" style={{ width: 90, height: 90 }} />
            </View>

            {/* Title */}
            <Text style={styles.heroTitle}>
              {t('games.languagePairMatch.title', 'Language Pair Match')} 🧩
            </Text>

            {/* Subtitle / Instruction Description */}
            <Text style={styles.heroSubtitle}>
              {t(
                'languagePairMatch.instructions',
                `Match words in ${sourceInfo.native} with their translations in ${targetInfo.native}!`,
                { source: sourceInfo.native, target: targetInfo.native }
              )}
            </Text>

            {/* Dynamic Language Pair Indicator */}
            <View style={styles.languagePairRow}>
              <View style={[styles.languagePill, styles.sourcePill]}>
                <Text style={styles.languagePillFlag}>{sourceInfo.flag}</Text>
                <Text style={styles.languagePillText}>{sourceInfo.native}</Text>
                <Text style={styles.languagePillRole}>{t('common.homeLanguage', 'Home')}</Text>
              </View>

              <Text style={styles.pairArrow}>➔</Text>

              <View style={[styles.languagePill, styles.targetPill]}>
                <Text style={styles.languagePillFlag}>{targetInfo.flag}</Text>
                <Text style={styles.languagePillText}>{targetInfo.native}</Text>
                <Text style={styles.languagePillRole}>{t('common.learningLanguage', 'Learning')}</Text>
              </View>
            </View>

            {/* Same-Language Warning Banner (if MT === LL) */}
            {isSameLanguage && (
              <View style={styles.sameLanguageBanner}>
                <Text style={styles.sameLanguageTitle}>
                  ⚠️ {t('languagePairMatch.sameLanguageTitle', 'Same Language Selected')}
                </Text>
                <Text style={styles.sameLanguageDesc}>
                  {t(
                    'languagePairMatch.sameLanguageDesc',
                    `Your home language and learning language are both ${sourceInfo.native}. To play the translation game, choose a different learning language!`,
                    { language: sourceInfo.native }
                  )}
                </Text>
                <BigTouchTarget
                  onPress={handleSwitchLanguage}
                  accessibilityLabel={t('languagePairMatch.switchLanguage', 'Choose Another Language')}
                  accessibilityRole="button"
                  style={styles.switchLanguageBtn}
                >
                  <Text style={styles.switchLanguageBtnText}>
                    🔄 {t('languagePairMatch.switchLanguage', 'Choose Another Language')}
                  </Text>
                </BigTouchTarget>
              </View>
            )}

            {/* Tutorial Button */}
            <BigTouchTarget
              onPress={() => setShowTutorialModal(true)}
              accessibilityLabel={t('languagePairMatch.howToPlayTitle', 'How to Play')}
              accessibilityRole="button"
              style={styles.tutorialButton}
            >
              <Text style={styles.tutorialButtonText}>
                ❓ {t('languagePairMatch.howToPlayTitle', 'How to Play')}
              </Text>
            </BigTouchTarget>

            {/* Start Button (disabled if same language) */}
            <BigTouchTarget
              onPress={handleStartGame}
              disabled={isSameLanguage}
              accessibilityLabel={t('common.play', 'Play')}
              accessibilityRole="button"
              style={[
                styles.startButton,
                isSameLanguage && styles.startButtonDisabled,
              ]}
            >
              <Text style={styles.startButtonText}>
                {t('common.play', 'PLAY ▶')}
              </Text>
            </BigTouchTarget>
          </View>
        </ScrollView>

        {/* How to Play Modal */}
        <FriendlyModal
          visible={showTutorialModal}
          title={t('languagePairMatch.howToPlayTitle', 'How to Play')}
          description={t(
            'languagePairMatch.howToPlayDesc',
            '1. Tap a card on the left in your language.\n2. Tap the matching translation on the right.\n3. Match all pairs to advance to the next round!'
          )}
          dismissText={t('common.gotIt', 'Got It!')}
          onDismiss={() => setShowTutorialModal(false)}
        />
      </SafeAreaView>
    </View>
  );
});

IntroScreen.displayName = 'LanguagePairMatchIntroScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#7DD3FC',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  backButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#334155',
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 17,
    color: '#0F172A',
  },
  headerSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    borderBottomColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  ageBadge: {
    backgroundColor: '#FDF2F8',
    borderColor: '#F472B6',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 12,
  },
  ageBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#BE185D',
  },
  mascotContainer: {
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  languagePairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  languagePill: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  sourcePill: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  targetPill: {
    backgroundColor: '#FDF4FF',
    borderColor: '#D8B4FE',
  },
  languagePillFlag: {
    fontSize: 22,
    marginBottom: 2,
  },
  languagePillText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  languagePillRole: {
    fontFamily: Typography.fonts.medium,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  pairArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  sameLanguageBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FCD34D',
    padding: 14,
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  sameLanguageTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  sameLanguageDesc: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 10,
  },
  switchLanguageBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#B45309',
  },
  switchLanguageBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#451A03',
  },
  tutorialButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  tutorialButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#475569',
  },
  startButton: {
    backgroundColor: '#EC4899',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#F472B6',
    borderBottomWidth: 6,
    borderBottomColor: '#BE185D',
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 19,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: 16,
    color: '#0369A1',
    marginTop: 12,
  },
});

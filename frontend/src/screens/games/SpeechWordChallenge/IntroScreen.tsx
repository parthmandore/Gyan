/**
 * Purpose: Intro / Tutorial screen for Speech Word Challenge.
 *          Adapts instructions for Age 5 (Letter Challenge) and Age 6 (Word Challenge).
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { StorybookGardenBackground } from './components/StorybookGardenBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useSpeechWordChallengeStore } from './store/speechWordChallengeStore';
import { checkSTTHealth } from '../../../services/sttService';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { RootStackParamList } from '../../../types';
import { GameCategory, SpeechWordChallengeStackParamList } from './types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<SpeechWordChallengeStackParamList, 'SpeechWordChallengeIntro'>>();
  const { width: screenWidth } = useWindowDimensions();
  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;
  const category = route.params?.category as GameCategory | undefined;
  const isLetterGame = category === 'letters' || (selectedAge === 5 && !category);
  const isCategory = !!category && category !== 'letters';
  const resetSession = useSpeechWordChallengeStore((s) => s.resetSession);
  const setSessionStartTime = useSpeechWordChallengeStore((s) => s.setSessionStartTime);

  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    checkSTTHealth().then((health) => {
      setBackendReady(health.status === 'ok' && health.model_loaded);
    });

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
    resetSession();
    setSessionStartTime(Date.now());
    navigation.navigate('Games', {
      screen: 'SpeechWordChallengeGame' as any,
      params: category ? { category } : (isLetterGame ? { category: 'letters' } : undefined),
    });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    navigation.navigate('GameCatalog');
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  return (
    <View style={styles.webOuterContainer}>
      <StorybookGardenBackground />

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

          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitleText}>
              {isLetterGame
                ? t('games.speechLetters.title', 'Say the Letters')
                : category === 'animals'
                ? t('games.speechAnimals.title', 'Animal Words')
                : category === 'fruits'
                ? t('games.speechFruits.title', 'Fruits & Veggies')
                : category === 'nature'
                ? t('games.speechEveryday.title', 'Everyday Things')
                : t('games.speechLetters.title', 'Say the Letters')}
            </Text>
            <Text style={styles.headerSubtitleText}>
              {isLetterGame
                ? t('games.speechLetters.description', 'Look at the letter and say it aloud!')
                : category === 'animals'
                ? t('games.speechAnimals.description', 'Say the animal name aloud!')
                : category === 'fruits'
                ? t('games.speechFruits.description', 'Say the fruit or vegetable aloud!')
                : category === 'nature'
                ? t('games.speechEveryday.description', 'Say the object name aloud!')
                : t('speechWordChallenge.whatIsThis', 'What is this? Say the word.')}
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
            <View style={styles.heroCardHighlight} />

            {/* Mascot */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="idle" style={styles.mascot} />
            </View>

            {/* Badge */}
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>
                {isLetterGame
                  ? '⭐ Age 5 Letter Speech'
                  : category === 'animals'
                  ? '🚀 🐾 Animals'
                  : category === 'fruits'
                  ? '🚀 🍎 Fruits & Vegetables'
                  : category === 'nature'
                  ? '🚀 🌿 Everyday Things'
                  : '🚀 Age 6 Word Speech'}
              </Text>
            </View>

            {/* Title & Tagline */}
            <Text style={styles.heroTitle}>
              {isLetterGame
                ? 'Say the Letters! 🔤'
                : category === 'animals'
                ? '🐾 Animal Words!'
                : category === 'fruits'
                ? '🍎 Fruits & Veggies!'
                : category === 'nature'
                ? '🌳 Things Around Us!'
                : 'Speak the Words! 🎙️'}
            </Text>

            <Text style={styles.heroSubtitle}>
              {isLetterGame
                ? 'Practice letter pronunciation with friendly speech feedback!'
                : category === 'animals'
                ? 'Look at the animal picture and say its name!'
                : category === 'fruits'
                ? 'Look at the fruit or vegetable picture and say its name!'
                : category === 'nature'
                ? 'Look at the everyday object picture and say its name!'
                : 'Identify everyday objects and build your vocabulary!'}
            </Text>

            {/* Backend Status Pill */}
            <View
              style={[
                styles.statusPill,
                backendReady === true
                  ? styles.statusReady
                  : backendReady === false
                  ? styles.statusError
                  : styles.statusChecking,
              ]}
            >
              <Text
                style={[
                  styles.statusDot,
                  backendReady === true
                    ? styles.statusDotReady
                    : backendReady === false
                    ? styles.statusDotError
                    : styles.statusDotChecking,
                ]}
              >
                {backendReady === true ? '●' : backendReady === false ? '●' : '○'}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  backendReady === true
                    ? styles.statusTextReady
                    : backendReady === false
                    ? styles.statusTextError
                    : styles.statusTextChecking,
                ]}
              >
                {backendReady === true
                  ? 'Speech Engine Ready'
                  : backendReady === false
                  ? 'Speech Engine Connecting...'
                  : 'Checking speech service...'}
              </Text>
            </View>

            {/* Tutorial Button */}
            <BigTouchTarget
              onPress={() => setShowTutorialModal(true)}
              accessibilityLabel={t('speechWordChallenge.howToPlayTitle', 'How to Play')}
              accessibilityRole="button"
              style={styles.tutorialButton}
            >
              <Text style={styles.tutorialButtonText}>❓ {t('speechWordChallenge.howToPlayTitle', 'How to Play')}</Text>
            </BigTouchTarget>

            {/* Big Start Game Button */}
            <BigTouchTarget
              onPress={handleStartGame}
              accessibilityLabel={t('speechWordChallenge.startChallenge', 'START CHALLENGE ▶')}
              accessibilityRole="button"
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>{t('speechWordChallenge.startChallenge', 'START CHALLENGE ▶')}</Text>
            </BigTouchTarget>
          </View>
        </ScrollView>

        {/* How to Play Modal */}
        <FriendlyModal
          visible={showTutorialModal}
          title={t('speechWordChallenge.howToPlayTitle', 'How to Play')}
          description={
            isLetterGame
              ? t(
                  'speechWordChallenge.howToPlayLetters',
                  '1. Look at the large letter on the screen.\n2. Tap the microphone button.\n3. Say the letter clearly!\n4. Complete all 10 rounds to earn 3 stars! ⭐'
                )
              : t(
                  'speechWordChallenge.howToPlayWords',
                  '1. Look at the picture on the screen.\n2. Think of the word (the answer is hidden!).\n3. Tap the microphone and say the word aloud!\n4. Complete all 10 rounds to earn 3 stars! ⭐'
                )
          }
          dismissText={t('speechWordChallenge.gotIt', 'Got it! ▶')}
          onDismiss={() => setShowTutorialModal(false)}
        />
      </SafeAreaView>
    </View>
  );
});

IntroScreen.displayName = 'IntroScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#7DD3FC',
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
  headerCard: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  headerTextCol: {
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
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#FED7AA',
    borderBottomWidth: 8,
    borderBottomColor: '#FDBA74',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCardHighlight: {
    position: 'absolute',
    top: 4,
    left: 12,
    right: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(253, 186, 116, 0.3)',
  },
  mascotWrapper: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  mascot: {
    width: 100,
    height: 100,
  },
  modeBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  modeBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#92400E',
  },
  heroTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: '#7C2D12',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    marginBottom: 16,
  },
  statusReady: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
  },
  statusChecking: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE047',
    borderWidth: 1,
  },
  statusError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  statusDot: {
    fontSize: 10,
  },
  statusDotReady: {
    color: '#15803D',
  },
  statusDotError: {
    color: '#DC2626',
  },
  statusDotChecking: {
    color: '#D97706',
  },
  statusText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
  },
  statusTextReady: {
    color: '#166534',
  },
  statusTextError: {
    color: '#991B1B',
  },
  statusTextChecking: {
    color: '#92400E',
  },
  tutorialButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    width: '100%',
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 12,
  },
  tutorialButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#475569',
  },
  startButton: {
    backgroundColor: '#EC4899',
    borderRadius: 22,
    borderBottomWidth: 6,
    borderBottomColor: '#BE185D',
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 17,
    color: '#FFFFFF',
  },
});

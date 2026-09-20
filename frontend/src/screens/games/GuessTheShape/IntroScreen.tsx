/**
 * Purpose: Pre-game Intro and Instructions Screen for Guess the Shape.
 *          Features age-adaptive badges (Age 6 vs Age 7), audio guidance,
 *          tutorial modal popup, and launch action into the 10-round challenge.
 * Module: Guess the Shape — Screens
 * Folder: frontend/src/screens/games/GuessTheShape
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 6;
  const isAge7 = selectedAge >= 7;

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const welcomeKey = isAge7
      ? 'guessTheShape.introPraiseAge7'
      : 'guessTheShape.introPraiseAge6';

    const defaultWelcome = isAge7
      ? 'Welcome to Advanced Shape Challenge! Look closely at the sides and corners.'
      : 'Welcome! Can you guess each shape by its name? Let us play!';

    const welcomeText = t(welcomeKey, defaultWelcome);
    speakPhrase(welcomeText, { language: motherTongue });

    return () => {
      stopSpeech();
    };
  }, [isAge7, motherTongue, t]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', { screen: 'GuessTheShapeGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="geometry" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* Cloud & Sun Clearance: ensures sky, clouds, sun and mobile notification panel are 100% free */}
        <CloudClearanceSpacer />

        {/* Top Header Bar */}
        <View style={[styles.headerBar, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={handleBackToCatalog}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← {t('common.back')}</Text>
          </BigTouchTarget>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Mascot */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="idle" />
            </View>

            {/* Age Badge */}
            <View style={[styles.ageBadge, isAge7 && styles.age7Badge]}>
              <Text style={styles.ageBadgeText}>
                {isAge7
                  ? t('guessTheShape.age7Badge', '🚀 Age 7 • Advanced Shapes')
                  : t('guessTheShape.age6Badge', '⭐ Age 6 • Intermediate Shapes')}
              </Text>
            </View>

            {/* Hero Title */}
            <Text style={styles.heroTitle}>
              {t('guessTheShape.title', 'Guess the Shape! 🔷')}
            </Text>

            {/* Subtitle */}
            <Text style={styles.heroSubtitle}>
              {t(
                'guessTheShape.subtitle',
                'Look at the shape and choose the matching name!'
              )}
            </Text>

            {/* Feature Highlights Pills */}
            <View style={styles.featuresRow}>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>🎯 10 Rounds</Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>⏱️ 90 Seconds</Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>⭐ +15 XP / Round</Text>
              </View>
            </View>

            {/* Primary Action: Start Challenge */}
            <BigTouchTarget
              onPress={handleStartGame}
              accessibilityLabel={t('guessTheShape.startChallenge', 'Start Challenge')}
              accessibilityRole="button"
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>
                {t('guessTheShape.startChallenge', 'Start Challenge ▶')}
              </Text>
            </BigTouchTarget>

            {/* Secondary Action: How to Play Button below Start */}
            <BigTouchTarget
              onPress={() => setShowHowToPlay(true)}
              accessibilityLabel={t('common.howToPlay', 'How to Play')}
              accessibilityRole="button"
              style={styles.tutorialButton}
            >
              <Text style={styles.tutorialButtonText}>
                📖 {t('common.howToPlay', 'How to Play')}
              </Text>
            </BigTouchTarget>
          </View>
        </ScrollView>

        {/* How to Play Modal Popup */}
        <FriendlyModal
          visible={showHowToPlay}
          title={t('common.howToPlay', 'How to Play')}
          onDismiss={() => setShowHowToPlay(false)}
        >
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                {t(
                  'guessTheShape.rule1',
                  'Look at the colorful shape shown in the middle of the card.'
                )}
              </Text>
            </View>

            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                {t(
                  'guessTheShape.rule2',
                  'Read the choices below and tap the matching shape name!'
                )}
              </Text>
            </View>

            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                {t(
                  'guessTheShape.rule3',
                  'If you miss on your first try, you get a helpful hint and a second chance!'
                )}
              </Text>
            </View>

            <BigTouchTarget
              onPress={() => setShowHowToPlay(false)}
              accessibilityLabel={t('common.gotIt', 'Got it!')}
              accessibilityRole="button"
              style={styles.gotItButton}
            >
              <Text style={styles.gotItButtonText}>
                {t('common.gotIt', 'Got it! 👍')}
              </Text>
            </BigTouchTarget>
          </View>
        </FriendlyModal>
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4338CA',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingBottom: 36,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 6,
    borderBottomColor: '#6366F1',
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  mascotWrapper: {
    marginVertical: 4,
  },
  ageBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#818CF8',
    marginBottom: 12,
  },
  age7Badge: {
    backgroundColor: '#FAF5FF',
    borderColor: '#C084FC',
  },
  ageBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4338CA',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  startButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4338CA',
    borderBottomWidth: 6,
    borderBottomColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tutorialButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderBottomWidth: 4,
    borderBottomColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  instructionsContainer: {
    width: '100%',
    paddingVertical: 8,
    gap: 14,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 22,
  },
  gotItButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#059669',
    borderBottomWidth: 4,
    borderBottomColor: '#047857',
    alignItems: 'center',
    marginTop: 10,
  },
  gotItButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

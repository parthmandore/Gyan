/**
 * Purpose: Intro Screen for Capital & Small Letter Match featuring first-time auto-tutorial trigger,
 *          persisted seen state, manual "How to Play" tutorial replay button, and start action.
 * Module: Capital Small Match
 * Folder: frontend/src/screens/games/CapitalSmallMatch
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { TutorialOverlay, TutorialStep } from '../../../components/TutorialOverlay';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { CapitalSmallMatchStackParamList } from './types';
import { useCapitalSmallMatchStore } from './store/capitalSmallMatchStore';
import { isTutorialSeen } from '../../../services/tutorialService';

type NavProp = NativeStackNavigationProp<CapitalSmallMatchStackParamList, 'CapitalSmallMatchIntro'>;

const GAME_ID = 'capital_small_match';

const CAPITAL_SMALL_MATCH_TUTORIAL_STEPS: TutorialStep[] = [
  {
    titleKey: 'capitalSmallMatch.tutorialStep1Title',
    bodyKey: 'capitalSmallMatch.tutorialStep1Body',
    defaultTitle: 'Step 1: Pick a Capital Letter',
    defaultBody: 'Tap any uppercase capital letter in the left column to select it!',
    icon: '🔤',
    narrationText: 'Step 1: Pick a Capital Letter. Tap any uppercase capital letter in the left column to select it!',
  },
  {
    titleKey: 'capitalSmallMatch.tutorialStep2Title',
    bodyKey: 'capitalSmallMatch.tutorialStep2Body',
    defaultTitle: 'Step 2: Find its Small Letter Pair',
    defaultBody: 'Now tap its matching lowercase small letter in the right column!',
    icon: '🧩',
    narrationText: 'Step 2: Find its Small Letter Pair. Now tap its matching lowercase small letter in the right column!',
  },
  {
    titleKey: 'capitalSmallMatch.tutorialStep3Title',
    bodyKey: 'capitalSmallMatch.tutorialStep3Body',
    defaultTitle: 'Step 3: Complete the Round!',
    defaultBody: 'Match all 4 pairs to finish the round and earn 3 stars! 🌟',
    icon: '⭐',
    narrationText: 'Step 3: Complete the Round! Match all 4 pairs to finish the round and earn 3 stars!',
  },
];

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const resetSession = useCapitalSmallMatchStore((s) => s.resetSession);

  const [showTutorial, setShowTutorial] = useState(false);

  // Auto-trigger tutorial on true first launch
  useEffect(() => {
    let mounted = true;
    isTutorialSeen(GAME_ID).then((seen) => {
      if (mounted && !seen) {
        setShowTutorial(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleStart = useCallback(() => {
    resetSession();
    navigation.navigate('CapitalSmallMatchGame');
  }, [resetSession, navigation]);

  const handleOpenTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2B5A" />
        <CartoonBackground theme="evening" />

        {/* Tutorial Overlay */}
        <TutorialOverlay
          gameId={GAME_ID}
          visible={showTutorial}
          steps={CAPITAL_SMALL_MATCH_TUTORIAL_STEPS}
          onComplete={handleCloseTutorial}
          onSkip={handleCloseTutorial}
        />

        <View style={styles.content}>
          <View style={styles.mascotWrapper}>
            <MascotCharacter state="encouraging" style={styles.mascot} />
          </View>

          <Text style={styles.title}>{t('games.capitalSmallMatch.title')}</Text>
          <Text style={styles.subtitle}>{t('games.capitalSmallMatch.description')}</Text>

          <View style={styles.buttonsContainer}>
            <BigTouchTarget
              onPress={handleStart}
              accessibilityLabel={t('games.capitalSmallMatch.title')}
              accessibilityRole="button"
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>▶ Start</Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handleOpenTutorial}
              accessibilityLabel={t('capitalSmallMatch.howToPlay', 'How to Play')}
              accessibilityRole="button"
              style={styles.tutorialButton}
            >
              <Text style={styles.tutorialButtonText}>
                {t('capitalSmallMatch.howToPlay', '📖 How to Play')}
              </Text>
            </BigTouchTarget>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
});

IntroScreen.displayName = 'CapitalSmallMatchIntroScreen';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B2B5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safe: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    maxHeight: 920,
    backgroundColor: '#1B2B5A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  mascotWrapper: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  mascot: {
    width: 100,
    height: 100,
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 14,
  },
  startButton: {
    width: '100%',
    height: 64,
    minHeight: 84,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 7,
    borderBottomColor: '#047857',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  startButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  tutorialButton: {
    width: '100%',
    height: 56,
    minHeight: 84,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 6,
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
  tutorialButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});

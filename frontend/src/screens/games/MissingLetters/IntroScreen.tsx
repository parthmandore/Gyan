/**
 * Purpose: Introduction and onboarding screen for Missing Letters (Age 5).
 *          Presents the game concept, instructions, animated sequence preview, and launch CTA.
 * Module: Missing Letters — Intro Screen
 * Folder: frontend/src/screens/games/MissingLetters
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { LetterSequenceDisplay } from './components/LetterSequenceDisplay';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Spoken introduction on mount
  useEffect(() => {
    const welcomeText = t(
      'missingLetters.heroSubtitle',
      'Look at the letters and pick the one that comes next in line!'
    );
    speakPhrase(welcomeText, { language: motherTongue });

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      stopSpeech();
      unsubscribe();
    };
  }, [t, motherTongue, navigation]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', { screen: 'MissingLettersGame' as any });
  };

  const isTablet = screenWidth >= 600;
  const contentMaxWidth = isTablet ? 560 : 420;

  // Demo sequence preview based on language
  const demoSequence =
    learningLanguage === 'hi' || learningLanguage === 'mr'
      ? ['अ', 'आ', null, 'ई']
      : ['A', 'B', null, 'D'];

  return (
    <View style={styles.container}>
      <CartoonBackground theme="alphabet" />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            stopSpeech();
            navigation.goBack();
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Age & Topic Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⭐ Age 5: Missing Letters</Text>
        </View>

        {/* Hero Title */}
        <Text style={styles.heroTitle}>
          {t('missingLetters.heroTitle', 'Find the Missing Letter! ⭐')}
        </Text>

        {/* Hero Subtitle */}
        <Text style={styles.heroSubtitle}>
          {t(
            'missingLetters.heroSubtitle',
            'Look at the letters and pick the one that comes next in line!'
          )}
        </Text>

        {/* Interactive Animated Sequence Demo */}
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>
            {t('missingLetters.whichLetterIsMissing', 'Which letter is missing?')}
          </Text>
          <LetterSequenceDisplay
            sequence={demoSequence}
            missingIndex={2}
            revealedLetter={null}
          />
        </View>

        {/* Start Game CTA */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Start game"
        >
          <Text style={styles.startButtonText}>
            {t('missingLetters.startGame', 'Start Challenge 🚀')}
          </Text>
        </TouchableOpacity>

        {/* How to Play / Tutorial Button below Start Button */}
        <TouchableOpacity
          style={styles.tutorialButton}
          onPress={() => setShowHowToPlay(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="How to play tutorial"
        >
          <Text style={styles.tutorialButtonText}>
            ❓ {t('missingLetters.howToPlayTitle', 'How to Play')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* How to Play Modal */}
      <Modal
        visible={showHowToPlay}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHowToPlay(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: contentMaxWidth }]}>
            <Text style={styles.modalTitle}>
              📖 {t('missingLetters.howToPlayTitle', 'How to Play')}
            </Text>

            <View style={styles.modalSteps}>
              <Text style={styles.modalStep}>
                1️⃣ {t('missingLetters.howToPlayStep1', 'Look at the letters in the row.')}
              </Text>
              <Text style={styles.modalStep}>
                2️⃣{' '}
                {t(
                  'missingLetters.howToPlayStep2',
                  'Find the empty box with the question mark.'
                )}
              </Text>
              <Text style={styles.modalStep}>
                3️⃣{' '}
                {t(
                  'missingLetters.howToPlayStep3',
                  'Tap the correct letter below to complete the line!'
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHowToPlay(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>Got It! 👍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

IntroScreen.displayName = 'MissingLettersIntroScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3730A3',
  },
  infoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  demoBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 18,
  },
  demoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4338CA',
    marginBottom: 6,
  },
  tutorialButton: {
    marginTop: 14,
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 2.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tutorialButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4338CA',
  },
  startButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#4F46E5',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#6366F1',
    borderBottomWidth: 6,
    borderBottomColor: '#3730A3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#C7D2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#312E81',
    marginBottom: 16,
  },
  modalSteps: {
    width: '100%',
    marginBottom: 20,
  },
  modalStep: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    lineHeight: 22,
  },
  modalCloseButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#10B981',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

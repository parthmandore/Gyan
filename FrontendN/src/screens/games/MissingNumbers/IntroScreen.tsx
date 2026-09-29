/**
 * Purpose: Introduction and onboarding screen for Missing Numbers (Age 5).
 *          Presents the game concept, instructions, animated counting sequence preview, and launch CTA.
 * Module: Missing Numbers — Intro Screen
 * Folder: frontend/src/screens/games/MissingNumbers
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
import { NumberSequenceDisplay } from './components/NumberSequenceDisplay';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Spoken introduction on mount
  useEffect(() => {
    const welcomeText = t(
      'missingNumbers.heroSubtitle',
      'Look at the counting train and find the missing number!'
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
    navigation.navigate('Games', { screen: 'MissingNumbersGame' as any });
  };

  const isTablet = screenWidth >= 600;
  const contentMaxWidth = isTablet ? 560 : 420;

  // Demo sequence preview
  const demoSequence = [1, 2, null, 4];

  return (
    <View style={styles.container}>
      <CartoonBackground theme="math" />

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

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowHowToPlay(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="How to play"
        >
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Age & Topic Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⭐ Age 5: Missing Numbers</Text>
        </View>

        {/* Hero Title */}
        <Text style={styles.heroTitle}>
          {t('missingNumbers.heroTitle', 'Find the Missing Number! 🔢')}
        </Text>

        {/* Hero Subtitle */}
        <Text style={styles.heroSubtitle}>
          {t(
            'missingNumbers.heroSubtitle',
            'Look at the counting train and find the missing number!'
          )}
        </Text>

        {/* Interactive Animated Sequence Demo */}
        <View style={styles.demoBox}>
          <Text style={styles.demoLabel}>
            {t('missingNumbers.whichNumberIsMissing', 'Which number is missing?')}
          </Text>
          <NumberSequenceDisplay
            sequence={demoSequence}
            missingIndex={2}
            revealedNumber={null}
          />
        </View>

        {/* How to Play Card */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>
            💡 {t('missingNumbers.howToPlayTitle', 'How to Play')}
          </Text>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>🚂</Text>
            <Text style={styles.ruleText}>
              {t('missingNumbers.howToPlayStep1', 'Count the numbers in the row.')}
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>❓</Text>
            <Text style={styles.ruleText}>
              {t(
                'missingNumbers.howToPlayStep2',
                'Find the empty box with the question mark.'
              )}
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>👆</Text>
            <Text style={styles.ruleText}>
              {t(
                'missingNumbers.howToPlayStep3',
                'Tap the right number below to complete the count!'
              )}
            </Text>
          </View>
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
            {t('missingNumbers.startGame', 'Start Challenge 🚀')}
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
              📖 {t('missingNumbers.howToPlayTitle', 'How to Play')}
            </Text>

            <View style={styles.modalSteps}>
              <Text style={styles.modalStep}>
                1️⃣ {t('missingNumbers.howToPlayStep1', 'Count the numbers in the row.')}
              </Text>
              <Text style={styles.modalStep}>
                2️⃣{' '}
                {t(
                  'missingNumbers.howToPlayStep2',
                  'Find the empty box with the question mark.'
                )}
              </Text>
              <Text style={styles.modalStep}>
                3️⃣{' '}
                {t(
                  'missingNumbers.howToPlayStep3',
                  'Tap the right number below to complete the count!'
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

IntroScreen.displayName = 'MissingNumbersIntroScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
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
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0369A1',
  },
  infoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  infoButtonText: {
    fontSize: 22,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
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
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
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
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  demoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 6,
  },
  rulesCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  rulesTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  ruleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  startButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#0284C7',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#38BDF8',
    borderBottomWidth: 6,
    borderBottomColor: '#0369A1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
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
    borderColor: '#BAE6FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
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

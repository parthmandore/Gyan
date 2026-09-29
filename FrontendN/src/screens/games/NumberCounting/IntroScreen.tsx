/**
 * Purpose: Introduction and onboarding screen for Number Counting (Age 5).
 *          Presents the game concept, interactive preview, audio prompt, and launch CTA.
 * Module: Number Counting — Intro Screen
 * Folder: frontend/src/screens/games/NumberCounting
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
import { CountingStage } from './components/CountingStage';
import { RootStackParamList } from '../../../types';
import { CountableObjectItem } from './types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const DEMO_OBJECT: CountableObjectItem = {
  id: 'apple',
  emoji: '🍎',
  category: 'fruits',
  names: {
    en: { singular: 'apple', plural: 'apples' },
    hi: { singular: 'सेब', plural: 'सेब' },
    mr: { singular: 'सफरचंद', plural: 'सफरचंद' },
  },
};

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Spoken introduction on mount
  useEffect(() => {
    const welcomeText = t(
      'numberCounting.heroSubtitle',
      'Count the friendly objects and tap the matching number!'
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
    navigation.navigate('Games', { screen: 'NumberCountingGame' as any });
  };

  const isTablet = screenWidth >= 600;
  const contentMaxWidth = isTablet ? 560 : 420;

  return (
    <View style={styles.container}>
      <CartoonBackground theme="orchard" />

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
        <View style={styles.badgeRow}>
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>
              {t('numberCounting.badge', '⭐ Age 5 Counting Quest')}
            </Text>
          </View>
        </View>

        {/* Hero Title & Subtitle */}
        <Text style={styles.heroTitle}>
          {t('numberCounting.heroTitle', 'Count the Objects! 🍎')}
        </Text>
        <Text style={styles.heroSubtitle}>
          {t(
            'numberCounting.heroSubtitle',
            'Count the friendly objects and tap the matching number!'
          )}
        </Text>

        {/* Interactive Counting Preview */}
        <View style={styles.previewContainer}>
          <CountingStage
            targetCount={3}
            objectItem={DEMO_OBJECT}
            questionText={t('numberCounting.demoQuestion', 'How many apples?')}
            onPressSpeakPrompt={() => {
              speakPhrase('How many apples do you see? Count them!', {
                language: motherTongue,
              });
            }}
          />
        </View>

        {/* Quick Tips Cards */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            {t(
              'numberCounting.tip',
              'Tap each object with your finger to count 1, 2, 3!'
            )}
          </Text>
        </View>

        {/* Start Game CTA Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Start game"
        >
          <Text style={styles.startButtonText}>
            {t('numberCounting.startGame', 'Start Counting! 🚀')}
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
              {t('numberCounting.howToPlayTitle', 'How to Play 📖')}
            </Text>

            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                {t(
                  'numberCounting.howToPlayStep1',
                  'Look at the friendly objects inside the white box.'
                )}
              </Text>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                {t(
                  'numberCounting.howToPlayStep2',
                  'Tap each object with your finger to count them one by one!'
                )}
              </Text>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                {t(
                  'numberCounting.howToPlayStep3',
                  'Choose the matching number card at the bottom!'
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHowToPlay(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>
                {t('common.gotIt', 'Got It! 👍')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoButtonText: {
    fontSize: 20,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badgeRow: {
    marginTop: 10,
    marginBottom: 12,
  },
  ageBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ageBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#064E3B',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  previewContainer: {
    width: '100%',
    marginVertical: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 14,
    width: '100%',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#059669',
    borderBottomWidth: 6,
    borderBottomColor: '#047857',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

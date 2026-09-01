/**
 * Purpose: Intro / Tutorial screen for Speech Word Challenge.
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
import { useNavigation } from '@react-navigation/native';
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
import { speakPhrase } from '../../../services/speechService';
import { RootStackParamList } from '../../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const selectedLanguage = useAppLanguageStore((s) => s.selectedLanguage) || 'en';
  const resetSession = useSpeechWordChallengeStore((s) => s.resetSession);
  const setSessionStartTime = useSpeechWordChallengeStore((s) => s.setSessionStartTime);

  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    checkSTTHealth().then((health) => {
      setBackendReady(health.status === 'ok' && health.model_loaded);
    });
  }, []);

  const handleStartGame = () => {
    resetSession();
    setSessionStartTime(Date.now());
    speakPhrase(
      selectedLanguage === 'hi'
        ? 'चित्र देखकर शब्द बोलिए!'
        : selectedLanguage === 'mr'
        ? 'चित्र पाहून शब्द बोला!'
        : 'Look at the picture and say the word!'
    );
    navigation.navigate('Games', { screen: 'SpeechWordChallengeGame' as any });
  };

  const handleBackToCatalog = () => {
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
              {t('games.speechWordChallenge.title', 'Speech Word Challenge')}
            </Text>
            <Text style={styles.headerSubtitleText}>
              {t('games.speechWordChallenge.subtitle', 'Speak words into the microphone!')}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Frosted Intro Card */}
          <View style={[styles.introCard, { width: containerWidth }]}>
            <View style={styles.cardHighlight} />

            {/* Mascot Companion */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="idle" style={styles.mascot} />
            </View>

            <Text style={styles.welcomeTitle}>
              {selectedLanguage === 'hi'
                ? 'शब्द बोलो और जीतो! 🎙️'
                : selectedLanguage === 'mr'
                ? 'शब्द बोला आणि जिंका! 🎙️'
                : 'Say the Word! 🎙️'}
            </Text>

            <Text style={styles.welcomeSubtitle}>
              {selectedLanguage === 'hi'
                ? 'स्क्रीन पर दिख रहे चित्र का नाम माइक में साफ-साफ बोलें!'
                : selectedLanguage === 'mr'
                ? 'स्क्रीनवर दिसणाऱ्या चित्राचे नाव माइकवर स्पष्टपणे बोला!'
                : 'See the fun picture, tap the microphone, and speak clearly to earn stars!'}
            </Text>

            {/* How to Play Pill Button */}
            <BigTouchTarget
              onPress={() => setShowTutorialModal(true)}
              accessibilityLabel="How to Play Tutorial"
              accessibilityRole="button"
              style={styles.howToPlayButton}
            >
              <Text style={styles.howToPlayText}>❓ How to Play</Text>
            </BigTouchTarget>

            {/* Backend Status Indicator */}
            {backendReady === false && (
              <View style={styles.backendWarningPill}>
                <Text style={styles.backendWarningText}>
                  ⚠️ Speech AI server offline. Please start the backend!
                </Text>
              </View>
            )}

            {/* Large Start Action Button */}
            <BigTouchTarget
              onPress={handleStartGame}
              accessibilityLabel="Start Playing Speech Word Challenge"
              accessibilityRole="button"
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>▶ START GAME</Text>
            </BigTouchTarget>
          </View>
        </ScrollView>

        {/* Friendly How to Play Modal */}
        <FriendlyModal
          visible={showTutorialModal}
          title="How to Play 🎙️"
          description={
            selectedLanguage === 'hi'
              ? '1. स्क्रीन पर चित्र देखें (जैसे: सेब 🍎)\n2. गुलाबी माइक बटन 🎙️ दबाएं\n3. माइक में साफ-साफ शब्द बोलें\n4. सही बोलने पर चमकता हुआ गोल्ड स्टार ⭐ जीतें!'
              : selectedLanguage === 'mr'
              ? '1. स्क्रीनवर चित्र पहा (उदा: सफरचंद 🍎)\n2. गुलाबी माइक बटण 🎙️ दाबा\n3. माइकवर स्पष्टपणे शब्द बोला\n4. बरोबर बोलल्यास चमकणारा गोल्ड स्टार ⭐ जिंका!'
              : '1. Look at the fun picture shown on screen (e.g. Apple 🍎)\n2. Tap the big pink microphone button 🎙️\n3. Speak the word clearly into your device\n4. Earn glowing gold stars ⭐ for every word you say correctly!'
          }
          dismissText="Got it!"
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
  headerCard: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#334155',
    borderWidth: 1.5,
    borderColor: '#64748B',
    marginRight: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#F8FAFC',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    alignItems: 'center',
  },
  introCard: {
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
  welcomeTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: '#831843',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  howToPlayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FDF2F8',
    borderWidth: 1.5,
    borderColor: '#F472B6',
    marginBottom: 16,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  howToPlayText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#BE185D',
  },
  backendWarningPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  backendWarningText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
    height: 56,
    minHeight: 60,
    backgroundColor: '#EC4899',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 6,
    borderBottomColor: '#BE185D',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

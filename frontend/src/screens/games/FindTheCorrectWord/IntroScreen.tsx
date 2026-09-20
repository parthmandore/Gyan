/**
 * Purpose: Pre-game Intro and Instructions Screen for Find the Correct Word.
 *          Features age-adaptive badges (Age 6 vs Age 7), audio guidance,
 *          tutorial modal popup, and launch action into the 10-round challenge.
 * Module: Find the Correct Word — Screens
 * Folder: frontend/src/screens/games/FindTheCorrectWord
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
      ? 'findTheCorrectWord.introPraiseAge7'
      : 'findTheCorrectWord.introPraiseAge6';

    const defaultWelcome = isAge7
      ? 'Look at the picture and find the word with the correct spelling! Are you ready?'
      : 'Look at the picture and pick the correctly spelled word! Let us play!';

    const welcomeText = t(welcomeKey, defaultWelcome);
    speakPhrase(welcomeText, { language: motherTongue });

    return () => {
      stopSpeech();
    };
  }, [isAge7, motherTongue, t]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', { screen: 'FindTheCorrectWordGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    navigation.navigate('GameCatalog' as any);
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="orchard" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#059669" />
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
                  ? t('findTheCorrectWord.age7Badge', '🚀 Age 7 • Tricky Spellings')
                  : t('findTheCorrectWord.age6Badge', '⭐ Age 6 • Word Spelling')}
              </Text>
            </View>

            {/* Hero Title */}
            <Text style={styles.heroTitle}>
              {t('findTheCorrectWord.title', 'Find the Correct Word! 📝')}
            </Text>

            {/* Subtitle */}
            <Text style={styles.heroSubtitle}>
              {t(
                'findTheCorrectWord.subtitle',
                'Look at the picture and find the word spelled correctly!'
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
              accessibilityLabel={t('findTheCorrectWord.startChallenge', 'Start Challenge!')}
              accessibilityRole="button"
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>
                🎮 {t('findTheCorrectWord.startChallenge', 'Start Challenge!')}
              </Text>
            </BigTouchTarget>

            {/* Secondary Action: How to Play Tutorial Modal Trigger */}
            <BigTouchTarget
              onPress={() => setShowHowToPlay(true)}
              accessibilityLabel={t('findTheCorrectWord.howToPlay', 'How to Play')}
              accessibilityRole="button"
              style={styles.tutorialButton}
            >
              <Text style={styles.tutorialButtonText}>
                ❓ {t('findTheCorrectWord.howToPlay', 'How to Play')}
              </Text>
            </BigTouchTarget>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Friendly Popup Modal for Instructions */}
      <FriendlyModal
        visible={showHowToPlay}
        title={t('findTheCorrectWord.howToPlay', 'How to Play')}
        onDismiss={() => setShowHowToPlay(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>1️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'findTheCorrectWord.rule1',
                'Look closely at the picture displayed on the card.'
              )}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>2️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'findTheCorrectWord.rule2',
                'Look at the word options below. Watch out for tricky spellings!'
              )}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>3️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'findTheCorrectWord.rule3',
                'Choose the correctly spelled word on your 1st attempt for +15 XP!'
              )}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>4️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'findTheCorrectWord.rule4',
                'If you make a mistake, you get a helpful tip and 1 more chance for +10 XP.'
              )}
            </Text>
          </View>

          <BigTouchTarget
            onPress={() => setShowHowToPlay(false)}
            accessibilityLabel={t('common.gotIt', 'Got It!')}
            accessibilityRole="button"
            style={styles.gotItButton}
          >
            <Text style={styles.gotItButtonText}>
              👍 {t('common.gotIt', 'Got It!')}
            </Text>
          </BigTouchTarget>
        </View>
      </FriendlyModal>
    </View>
  );
});

IntroScreen.displayName = 'FindTheCorrectWordIntroScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 36,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginTop: 10,
  },
  mascotWrapper: {
    marginVertical: 4,
  },
  ageBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    marginBottom: 12,
  },
  age7Badge: {
    backgroundColor: '#EDE9FE',
    borderColor: '#DDD6FE',
  },
  ageBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  featurePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  startButton: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 14,
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
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  tutorialButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  modalContent: {
    paddingVertical: 8,
    gap: 14,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ruleNumber: {
    fontSize: 18,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 20,
  },
  gotItButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  gotItButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

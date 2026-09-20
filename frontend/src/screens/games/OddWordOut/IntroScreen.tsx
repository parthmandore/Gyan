/**
 * Purpose: Pre-game Intro and Instructions Screen for Odd Word Out (Age 7).
 *          Features Age 7 badge, audio guidance, tutorial modal popup,
 *          and launch action into the 10-round challenge.
 * Module: Odd Word Out — Screens
 * Folder: frontend/src/screens/games/OddWordOut
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

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const welcomeText = t(
      'oddWordOut.introPraise',
      'Welcome to Odd Word Out! Find the word that does not belong to the group. Are you ready?'
    );
    speakPhrase(welcomeText, { language: motherTongue });

    return () => {
      stopSpeech();
    };
  }, [motherTongue, t]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', { screen: 'OddWordOutGame' as any });
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
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
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

            {/* Age Badge — Exclusively Age 7 */}
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>
                {t('oddWordOut.age7Badge', '🚀 Age 7 • Category Reasoning')}
              </Text>
            </View>

            {/* Hero Title */}
            <Text style={styles.heroTitle}>
              {t('oddWordOut.title', 'Odd Word Out! 🔍')}
            </Text>

            {/* Subtitle */}
            <Text style={styles.heroSubtitle}>
              {t(
                'oddWordOut.subtitle',
                'Three words belong together. Find the odd one out!'
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
              accessibilityLabel={t('oddWordOut.startChallenge', 'Start Challenge!')}
              accessibilityRole="button"
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>
                🎮 {t('oddWordOut.startChallenge', 'Start Challenge!')}
              </Text>
            </BigTouchTarget>

            {/* Secondary Action: How to Play Tutorial Modal Trigger */}
            <BigTouchTarget
              onPress={() => setShowHowToPlay(true)}
              accessibilityLabel={t('oddWordOut.howToPlay', 'How to Play')}
              accessibilityRole="button"
              style={styles.tutorialButton}
            >
              <Text style={styles.tutorialButtonText}>
                ❓ {t('oddWordOut.howToPlay', 'How to Play')}
              </Text>
            </BigTouchTarget>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Friendly Popup Modal for Instructions */}
      <FriendlyModal
        visible={showHowToPlay}
        title={t('oddWordOut.howToPlay', 'How to Play')}
        onDismiss={() => setShowHowToPlay(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>1️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'oddWordOut.rule1',
                'Look at the 4 words shown on the screen.'
              )}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>2️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'oddWordOut.rule2',
                'Three words share something in common (like animals, fruits, or vehicles).'
              )}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>3️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'oddWordOut.rule3',
                'Tap the odd word that does NOT belong with the others!'
              )}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>4️⃣</Text>
            <Text style={styles.ruleText}>
              {t(
                'oddWordOut.rule4',
                'Answer correctly on your 1st try for +15 XP! If you need help, you get 1 more try for +10 XP.'
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

IntroScreen.displayName = 'OddWordOutIntroScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F3FF',
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
    shadowColor: '#5B21B6',
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
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    marginBottom: 12,
  },
  ageBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6D28D9',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderBottomWidth: 5,
    borderBottomColor: '#5B21B6',
    shadowColor: '#5B21B6',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  gotItButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

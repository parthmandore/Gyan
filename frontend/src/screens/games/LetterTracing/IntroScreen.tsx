/**
 * Purpose: Age-Adaptive Intro Screen for Letter Tracing.
 *          Dynamically adapts instructions, hero badge, voice prompts, and how-to-play
 *          based on child's selected Age (5, 6, 7) and Learning Language.
 * Module: Letter Tracing — Screens
 * Folder: frontend/src/screens/games/LetterTracing
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

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const learningLabel = LANGUAGE_LABELS[learningLanguage] || 'English';

  useEffect(() => {
    // Speak introductory prompt in child's mother tongue
    const promptKey =
      selectedAge === 5
        ? 'letterTracing.age5Hero'
        : selectedAge === 6
        ? 'letterTracing.age6Hero'
        : 'letterTracing.age7Hero';

    const spokenText = t(promptKey, { lng: motherTongue });
    speakPhrase(spokenText, { language: motherTongue });

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      stopSpeech();
      unsubscribe();
    };
  }, [navigation, selectedAge, motherTongue, t]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', { screen: 'LetterTracingGame' as any });
  };

  const isSmallScreen = screenWidth < 380;
  const containerWidth = Math.min(screenWidth - 32, 480);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="art" />
      <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Navigation Bar */}
          <View style={[styles.headerBar, { width: containerWidth }]}>
            <BigTouchTarget
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back to Games Catalog"
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← {t('common.back', 'Back')}</Text>
            </BigTouchTarget>
            <View style={styles.headerRight}>
              <BigTouchTarget
                onPress={() => setShowHowToPlay(true)}
                accessibilityLabel="How to Play"
                style={styles.helpButton}
              >
                <Text style={styles.helpButtonText}>❓</Text>
              </BigTouchTarget>
            </View>
          </View>

          {/* Age & Learning Language Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.ageBadge}>
              <Text style={styles.badgeText}>
                {selectedAge === 5
                  ? '⭐ Age 5: Guided Tracing'
                  : selectedAge === 6
                  ? '🚀 Age 6: Partial Guide'
                  : '🏆 Age 7: Freehand Writing'}
              </Text>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageBadgeText}>✍️ {learningLabel}</Text>
            </View>
          </View>

          {/* Hero Mascot & Title Section */}
          <View style={[styles.heroSection, { width: containerWidth }]}>
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="idle" />
            </View>
            <Text style={[styles.heroTitle, isSmallScreen && styles.heroTitleSmall]}>
              {selectedAge === 5
                ? t('letterTracing.age5Hero', 'Trace the Letter! ✍️')
                : selectedAge === 6
                ? t('letterTracing.age6Hero', 'Follow the Path! ✏️')
                : t('letterTracing.age7Hero', 'Write the Letter! 📝')}
            </Text>
            <Text style={styles.heroSubtitle}>
              {selectedAge === 5
                ? t(
                    'letterTracing.age5Desc',
                    'Trace over the dotted letter on the screen with your finger!'
                  )
                : selectedAge === 6
                ? t(
                    'letterTracing.age6Desc',
                    'Follow the faint stroke path and anchor dots to form the letter!'
                  )
                : t(
                    'letterTracing.age7Desc',
                    'Write the letter freehand between the notebook guidelines!'
                  )}
            </Text>
          </View>

          {/* Feature Highlights Grid */}
          <View style={[styles.highlightsContainer, { width: containerWidth }]}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>
                {selectedAge === 5 ? '〰️' : selectedAge === 6 ? '📍' : '📏'}
              </Text>
              <Text style={styles.highlightTitle}>
                {selectedAge === 5
                  ? 'Dotted Path'
                  : selectedAge === 6
                  ? 'Anchor Dots'
                  : 'Ruled Lines'}
              </Text>
              <Text style={styles.highlightSub}>
                {selectedAge === 5
                  ? 'Follow touch guides'
                  : selectedAge === 6
                  ? 'Connect the key points'
                  : 'Notebook guidelines'}
              </Text>
            </View>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>✨</Text>
              <Text style={styles.highlightTitle}>5 Rounds</Text>
              <Text style={styles.highlightSub}>5 unique letters</Text>
            </View>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>⭐</Text>
              <Text style={styles.highlightTitle}>Win Stars & XP</Text>
              <Text style={styles.highlightSub}>Boost your progress</Text>
            </View>
          </View>

          {/* Action CTA */}
          <View style={styles.ctaWrapper}>
            <BigTouchTarget
              onPress={handleStartGame}
              accessibilityLabel="Start Letter Tracing Game"
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>
                ✍️ {t('common.letsPlay', "Let's Play!")}
              </Text>
            </BigTouchTarget>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* How to Play Modal */}
      <FriendlyModal
        visible={showHowToPlay}
        title={t('letterTracing.howToPlayTitle', 'How to Play Letter Tracing')}
        onDismiss={() => setShowHowToPlay(false)}
      >
        <Text style={styles.modalBody}>
          {selectedAge === 5
            ? t(
                'letterTracing.howToPlayAge5',
                '1. Look at the letter shown above.\n2. Trace over the dotted lines with your finger.\n3. Tap "Check" when you finish tracing.\n4. Complete all 5 rounds to win 3 stars! ⭐'
              )
            : selectedAge === 6
            ? t(
                'letterTracing.howToPlayAge6',
                '1. Look at the letter and faint guide.\n2. Connect the dots and trace the strokes.\n3. Tap "Check" when done.\n4. Complete all 5 rounds to win 3 stars! ⭐'
              )
            : t(
                'letterTracing.howToPlayAge7',
                '1. Look at the target letter.\n2. Write it freehand between the notebook lines.\n3. Tap "Check" to verify your writing.\n4. Complete all 5 rounds to win 3 stars! ⭐'
              )}
        </Text>
      </FriendlyModal>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 2,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 2,
  },
  helpButtonText: {
    fontSize: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  ageBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  languageBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  languageBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mascotWrapper: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroTitleSmall: {
    fontSize: 22,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 22,
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 28,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  highlightIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  highlightSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 13,
  },
  ctaWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    maxWidth: 320,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 2,
    borderColor: '#059669',
  },
  ctaButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalBody: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1E293B',
    fontWeight: '500',
    padding: 8,
  },
});

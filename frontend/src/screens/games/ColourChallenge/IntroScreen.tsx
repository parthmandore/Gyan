/**
 * Purpose: Age-Adaptive Intro Screen for Colour Challenge.
 *          Adapts instructions, hero badge, and spoken prompt dynamically based on
 *          child's selected Age (5, 6, 7) and Learning Language.
 * Module: Colour Challenge — Screens
 * Folder: frontend/src/screens/games/ColourChallenge
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
import { ColourChallengeStackParamList } from './types';
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
        ? 'colourChallenge.age5Hero'
        : selectedAge === 6
        ? 'colourChallenge.age6Hero'
        : 'colourChallenge.age7Hero';

    const spokenText = t(promptKey, { lng: motherTongue });
    speakPhrase(spokenText, { language: motherTongue });

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      unsubscribe();
      stopSpeech();
    };
  }, [motherTongue, selectedAge, navigation, t]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', { screen: 'ColourChallengeGame' as any });
  };

  const handleBackToCatalog = () => {
    stopSpeech();
    navigation.navigate('GameCatalog');
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  const heroTitle =
    selectedAge === 5
      ? t('colourChallenge.age5Hero')
      : selectedAge === 6
      ? t('colourChallenge.age6Hero')
      : t('colourChallenge.age7Hero');

  const heroDesc =
    selectedAge === 5
      ? t('colourChallenge.age5Desc')
      : selectedAge === 6
      ? t('colourChallenge.age6Desc', { language: learningLabel })
      : t('colourChallenge.age7Desc', { language: learningLabel });

  const howToPlayText =
    selectedAge === 5
      ? t('colourChallenge.howToPlayAge5')
      : selectedAge === 6
      ? t('colourChallenge.howToPlayAge6', { language: learningLabel })
      : t('colourChallenge.howToPlayAge7', { language: learningLabel });

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="rainbow" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#D97706" />
        <CloudClearanceSpacer />

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

          <View style={styles.badgesRow}>
            <View style={styles.badgeAge}>
              <Text style={styles.badgeAgeText}>🎂 Age {selectedAge}</Text>
            </View>
            <View style={styles.badgeLang}>
              <Text style={styles.badgeLangText}>🎯 {learningLabel}</Text>
            </View>
          </View>
        </View>

        {/* Main Content ScrollView */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, { width: containerWidth }]}>
            {/* Mascot Character */}
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="idle" />
            </View>

            {/* Game Title & Subtitle */}
            <Text style={styles.gameTitle}>{t('colourChallenge.title')}</Text>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroDesc}>{heroDesc}</Text>

            {/* Feature Highlights Pill Row */}
            <View style={styles.featurePillsRow}>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>⭐ 5 Rounds</Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>
                  {selectedAge === 5 ? '🎨 Visual Match' : '🎙️ Voice & STT'}
                </Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>🏆 XP Rewards</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <BigTouchTarget
                onPress={handleStartGame}
                accessibilityLabel={t('common.play')}
                accessibilityRole="button"
                style={styles.playButton}
              >
                <Text style={styles.playButtonText}>{t('common.play')} ▶</Text>
              </BigTouchTarget>

              <BigTouchTarget
                onPress={() => setShowHowToPlay(true)}
                accessibilityLabel={t('colourChallenge.howToPlayTitle')}
                accessibilityRole="button"
                style={styles.howToPlayButton}
              >
                <Text style={styles.howToPlayButtonText}>
                  ❓ {t('colourChallenge.howToPlayTitle')}
                </Text>
              </BigTouchTarget>
            </View>
          </View>
        </ScrollView>

        {/* How to Play Modal */}
        <FriendlyModal
          visible={showHowToPlay}
          title={t('colourChallenge.howToPlayTitle')}
          onDismiss={() => setShowHowToPlay(false)}
        >
          <Text style={styles.modalContentText}>{howToPlayText}</Text>
          <BigTouchTarget
            onPress={() => setShowHowToPlay(false)}
            accessibilityLabel={t('common.gotIt')}
            accessibilityRole="button"
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseButtonText}>{t('common.gotIt')}</Text>
          </BigTouchTarget>
        </FriendlyModal>
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 4,
    borderBottomColor: '#FDE68A',
    elevation: 4,
  },
  backButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeAge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  badgeAgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  badgeLang: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  badgeLangText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 8,
    borderBottomColor: '#F59E0B',
    padding: 24,
    alignItems: 'center',
    elevation: 6,
  },
  mascotWrapper: {
    marginVertical: 10,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featurePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  featurePill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featurePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#059669',
    borderBottomWidth: 6,
    borderBottomColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  howToPlayButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howToPlayButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  modalContentText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#B45309',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

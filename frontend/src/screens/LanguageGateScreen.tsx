/**
 * Purpose: First-launch Onboarding Screen — 2-step onboarding:
 *          Step 1: Choose Learning Language (English / हिन्दी / मराठी)
 *          Step 2: Choose Age (Age 5 / Age 6)
 *          Child-friendly cards, mascot companion, and WCAG AA accessible 84dp targets.
 * Module: Screens
 * Folder: frontend/src/screens
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
  AccessibilityInfo,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BigTouchTarget } from '../components/BigTouchTarget';
import { CartoonBackground } from '../components/CartoonBackground';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { AppLanguage, AppAge, useAppLanguageStore } from '../state/appLanguageStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LanguageGate'>;

interface LanguageCardOption {
  id: AppLanguage;
  nativeTitleKey: string;
  subtitleKey: string;
  icon: string;
  bgColor: string;
  bevelColor: string;
}

const LANGUAGE_CARDS: readonly LanguageCardOption[] = [
  {
    id: 'en',
    nativeTitleKey: 'languageGate.english',
    subtitleKey: 'languageGate.englishSub',
    icon: '🔤',
    bgColor: '#3B82F6',
    bevelColor: '#1D4ED8',
  },
  {
    id: 'hi',
    nativeTitleKey: 'languageGate.hindi',
    subtitleKey: 'languageGate.hindiSub',
    icon: '🗣️',
    bgColor: '#F59E0B',
    bevelColor: '#D97706',
  },
  {
    id: 'mr',
    nativeTitleKey: 'languageGate.marathi',
    subtitleKey: 'languageGate.marathiSub',
    icon: '📚',
    bgColor: '#10B981',
    bevelColor: '#047857',
  },
] as const;

interface AgeCardOption {
  age: AppAge;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  bgColor: string;
  bevelColor: string;
}

const AGE_CARDS: readonly AgeCardOption[] = [
  {
    age: 5,
    titleKey: 'ageGate.age5Title',
    subtitleKey: 'ageGate.age5Desc',
    icon: '⭐',
    bgColor: '#EC4899',
    bevelColor: '#BE185D',
  },
  {
    age: 6,
    titleKey: 'ageGate.age6Title',
    subtitleKey: 'ageGate.age6Desc',
    icon: '🚀',
    bgColor: '#8B5CF6',
    bevelColor: '#6D28D9',
  },
] as const;

export const LanguageGateScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const setSelectedLanguage = useAppLanguageStore((s) => s.setSelectedLanguage);
  const setSelectedAge = useAppLanguageStore((s) => s.setSelectedAge);
  const currentLanguage = useAppLanguageStore((s) => s.selectedLanguage);

  const [step, setStep] = useState<'language' | 'age'>('language');
  const [chosenLang, setChosenLang] = useState<AppLanguage>(currentLanguage || 'en');

  const [reduceMotion, setReduceMotion] = useState(false);
  const cardScale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    if (reduceMotion) {
      cardScale.value = 1;
      cardOpacity.value = 1;
    } else {
      cardOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withSpring(1, { damping: 14, stiffness: 140 });
    }

    return () => {
      isMounted = false;
    };
  }, [cardOpacity, cardScale, reduceMotion, step]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ scale: 1 }] };
    return {
      opacity: cardOpacity.value,
      transform: [{ scale: cardScale.value }],
    };
  });

  const handleSelectLanguage = async (lang: AppLanguage) => {
    setChosenLang(lang);
    await setSelectedLanguage(lang);
    setStep('age');
  };

  const handleSelectAge = async (age: AppAge) => {
    await setSelectedAge(age);
    navigation.reset({
      index: 0,
      routes: [{ name: 'GameCatalog' }],
    });
  };

  const cardWidth = Math.min(screenWidth - 32, 400);

  return (
    <View style={styles.webOuterContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2B5A" />

        {/* Decorative Scenery — Hub Theme */}
        <CartoonBackground theme="hub" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 'language' ? (
            <>
              {/* Header Banner: Language */}
              <View style={styles.headerSection}>
                <Text style={styles.titleText}>{t('languageGate.title')}</Text>
                <Text style={styles.subtitleText}>{t('languageGate.subtitle')}</Text>
              </View>

              {/* Language Cards */}
              <Animated.View style={[styles.cardsContainer, animatedStyle]}>
                {LANGUAGE_CARDS.map((card) => {
                  const title = t(card.nativeTitleKey);
                  const subtitle = t(card.subtitleKey);

                  return (
                    <BigTouchTarget
                      key={card.id}
                      onPress={() => handleSelectLanguage(card.id)}
                      accessibilityLabel={`${title}, ${subtitle}`}
                      accessibilityHint={t('languageGate.accessibilityHint', { language: title })}
                      accessibilityRole="button"
                      style={[
                        styles.selectionCard,
                        {
                          width: cardWidth,
                          backgroundColor: card.bgColor,
                          borderBottomColor: card.bevelColor,
                        },
                      ]}
                    >
                      <View style={styles.innerHighlightRibbon} />
                      <View style={styles.cardContentRow}>
                        <View style={styles.iconCircle}>
                          <Text style={styles.cardIconText}>{card.icon}</Text>
                        </View>

                        <View style={styles.cardTextContainer}>
                          <Text style={styles.cardTitleText}>{title}</Text>
                          <Text style={styles.cardSubtitleText}>{subtitle}</Text>
                        </View>
                      </View>
                    </BigTouchTarget>
                  );
                })}
              </Animated.View>
            </>
          ) : (
            <>
              {/* Header Banner: Age */}
              <View style={styles.headerSection}>
                <BigTouchTarget
                  onPress={() => setStep('language')}
                  accessibilityLabel="Change Language"
                  accessibilityRole="button"
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← {t('common.back')}</Text>
                </BigTouchTarget>

                <Text style={styles.titleText}>{t('ageGate.title')}</Text>
                <Text style={styles.subtitleText}>{t('ageGate.subtitle')}</Text>
              </View>

              {/* Age Cards */}
              <Animated.View style={[styles.cardsContainer, animatedStyle]}>
                {AGE_CARDS.map((card) => {
                  const title = t(card.titleKey);
                  const subtitle = t(card.subtitleKey);

                  return (
                    <BigTouchTarget
                      key={card.age}
                      onPress={() => handleSelectAge(card.age)}
                      accessibilityLabel={`${title}, ${subtitle}`}
                      accessibilityRole="button"
                      style={[
                        styles.selectionCard,
                        {
                          width: cardWidth,
                          backgroundColor: card.bgColor,
                          borderBottomColor: card.bevelColor,
                        },
                      ]}
                    >
                      <View style={styles.innerHighlightRibbon} />
                      <View style={styles.cardContentRow}>
                        <View style={styles.iconCircle}>
                          <Text style={styles.cardIconText}>{card.icon}</Text>
                        </View>

                        <View style={styles.cardTextContainer}>
                          <Text style={styles.cardTitleText}>{title}</Text>
                          <Text style={styles.cardSubtitleText}>{subtitle}</Text>
                        </View>
                      </View>
                    </BigTouchTarget>
                  );
                })}
              </Animated.View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
});

LanguageGateScreen.displayName = 'LanguageGateScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#1B2B5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    maxHeight: 920,
    backgroundColor: '#1B2B5A',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  backButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 18,
  },
  selectionCard: {
    height: 110,
    minHeight: 84,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  innerHighlightRibbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconText: {
    fontSize: 32,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 3,
  },
});

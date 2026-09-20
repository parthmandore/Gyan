/**
 * Purpose: Age-adaptive intro screen for Educational Mathematics Games.
 *          Dynamically adapts operation themes, badges, spoken instructions,
 *          and how-to-play guidance for Addition, Subtraction, Bigger Addition,
 *          Multiplication, and Division.
 * Module: Math Challenge — Screens
 * Folder: frontend/src/screens/games/MathChallenge
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { MathChallengeStackParamList, MathOperation } from './types';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;
type RouteProps = RouteProp<MathChallengeStackParamList, 'MathChallengeIntro'>;

const OPERATION_METADATA: Record<
  MathOperation,
  {
    heroKey: string;
    descKey: string;
    howToPlayKey: string;
    icon: string;
    ageBadge: string;
    accentColor: string;
  }
> = {
  addition: {
    heroKey: 'mathChallenge.additionHero',
    descKey: 'mathChallenge.additionDesc',
    howToPlayKey: 'mathChallenge.howToPlayAddition',
    icon: '➕',
    ageBadge: '⭐ Age 6: Addition',
    accentColor: '#3B82F6',
  },
  subtraction: {
    heroKey: 'mathChallenge.subtractionHero',
    descKey: 'mathChallenge.subtractionDesc',
    howToPlayKey: 'mathChallenge.howToPlaySubtraction',
    icon: '➖',
    ageBadge: '⭐ Age 6: Subtraction',
    accentColor: '#EC4899',
  },
  bigger_addition: {
    heroKey: 'mathChallenge.biggerAdditionHero',
    descKey: 'mathChallenge.biggerAdditionDesc',
    howToPlayKey: 'mathChallenge.howToPlayBiggerAddition',
    icon: '➕',
    ageBadge: '🏆 Age 7: Bigger Addition',
    accentColor: '#F59E0B',
  },
  multiplication: {
    heroKey: 'mathChallenge.multiplicationHero',
    descKey: 'mathChallenge.multiplicationDesc',
    howToPlayKey: 'mathChallenge.howToPlayMultiplication',
    icon: '✖️',
    ageBadge: '🏆 Age 7: Multiplication',
    accentColor: '#8B5CF6',
  },
  division: {
    heroKey: 'mathChallenge.divisionHero',
    descKey: 'mathChallenge.divisionDesc',
    howToPlayKey: 'mathChallenge.howToPlayDivision',
    icon: '➗',
    ageBadge: '🏆 Age 7: Division',
    accentColor: '#10B981',
  },
};

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const operation: MathOperation = route.params?.operation || 'addition';
  const meta = OPERATION_METADATA[operation] || OPERATION_METADATA.addition;

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const spokenText = t(meta.heroKey, { lng: motherTongue });
    speakPhrase(spokenText, { language: motherTongue });

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      stopSpeech();
      unsubscribe();
    };
  }, [navigation, meta.heroKey, motherTongue, t]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', {
      screen: 'MathChallengeGame' as any,
      params: { operation },
    });
  };

  const containerWidth = Math.min(screenWidth - 32, 480);
  const isSmallScreen = screenWidth < 380;

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="math" />
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
      <SafeAreaView style={styles.safeArea}>
        <CloudClearanceSpacer />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
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

          {/* Age & Operation Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.ageBadge}>
              <Text style={styles.badgeText}>{meta.ageBadge}</Text>
            </View>
            <View style={styles.opBadge}>
              <Text style={styles.opBadgeText}>{meta.icon} Math</Text>
            </View>
          </View>

          {/* Hero Section */}
          <View style={[styles.heroSection, { width: containerWidth }]}>
            <View style={styles.mascotWrapper}>
              <MascotCharacter state="idle" />
            </View>
            <Text style={[styles.heroTitle, isSmallScreen && styles.heroTitleSmall]}>
              {t(meta.heroKey)}
            </Text>
            <Text style={styles.heroSubtitle}>{t(meta.descKey)}</Text>
          </View>

          {/* Feature Highlights Grid */}
          <View style={[styles.highlightsContainer, { width: containerWidth }]}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>{meta.icon}</Text>
              <Text style={styles.highlightTitle}>Big Numbers</Text>
              <Text style={styles.highlightSub}>Clear equations</Text>
            </View>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>🎯</Text>
              <Text style={styles.highlightTitle}>4 Choices</Text>
              <Text style={styles.highlightSub}>Tap the right answer</Text>
            </View>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>⭐</Text>
              <Text style={styles.highlightTitle}>5 Questions</Text>
              <Text style={styles.highlightSub}>Win stars & XP</Text>
            </View>
          </View>

          {/* Action CTA */}
          <View style={styles.ctaWrapper}>
            <BigTouchTarget
              onPress={handleStartGame}
              accessibilityLabel="Start Math Game"
              style={[styles.ctaButton, { backgroundColor: meta.accentColor }]}
            >
              <Text style={styles.ctaButtonText}>
                {meta.icon} {t('common.letsPlay', "Let's Play!")}
              </Text>
            </BigTouchTarget>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* How to Play Modal */}
      <FriendlyModal
        visible={showHowToPlay}
        title={t('mathChallenge.howToPlayTitle', 'How to Play Math Challenge')}
        onDismiss={() => setShowHowToPlay(false)}
      >
        <Text style={styles.modalBody}>{t(meta.howToPlayKey)}</Text>
      </FriendlyModal>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EFF6FF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  opBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  opBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
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
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroTitleSmall: {
    fontSize: 22,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
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
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
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

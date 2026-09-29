/**
 * Purpose: Topic-adaptive introduction screen for Basic Grammar Games.
 *          Dynamically adapts metadata, voice prompts, and how-to-play guidance
 *          for all 8 grammar topics across English, Hindi, and Marathi.
 * Module: Grammar Challenge — Screens
 * Folder: frontend/src/screens/games/GrammarChallenge
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { MascotCharacter } from '../../../components/MascotCharacter';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { GrammarChallengeStackParamList, GrammarTopic } from './types';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;
type RouteProps = RouteProp<GrammarChallengeStackParamList, 'GrammarChallengeIntro'>;

const TOPIC_METADATA: Record<
  GrammarTopic,
  {
    heroKey: string;
    descKey: string;
    howToPlayKey: string;
    icon: string;
    ageBadge: string;
    accentColor: string;
  }
> = {
  noun_or_verb: {
    heroKey: 'grammarChallenge.nounOrVerbHero',
    descKey: 'grammarChallenge.nounOrVerbDesc',
    howToPlayKey: 'grammarChallenge.howToPlayNounOrVerb',
    icon: '📝',
    ageBadge: '⭐ Age 6: Noun or Verb',
    accentColor: '#3B82F6',
  },
  singular_or_plural: {
    heroKey: 'grammarChallenge.singularOrPluralHero',
    descKey: 'grammarChallenge.singularOrPluralDesc',
    howToPlayKey: 'grammarChallenge.howToPlaySingularOrPlural',
    icon: '🔢',
    ageBadge: '⭐ Age 6: Singular / Plural',
    accentColor: '#10B981',
  },
  complete_the_sentence: {
    heroKey: 'grammarChallenge.completeSentenceHero',
    descKey: 'grammarChallenge.completeSentenceDesc',
    howToPlayKey: 'grammarChallenge.howToPlayCompleteSentence',
    icon: '✏️',
    ageBadge: '⭐ Age 6: Complete Sentence',
    accentColor: '#8B5CF6',
  },
  articles_determiners: {
    heroKey: 'grammarChallenge.articlesHero',
    descKey: 'grammarChallenge.articlesDesc',
    howToPlayKey: 'grammarChallenge.howToPlayArticles',
    icon: '🔤',
    ageBadge: '🏆 Age 7: Determiners',
    accentColor: '#F59E0B',
  },
  pronouns: {
    heroKey: 'grammarChallenge.pronounsHero',
    descKey: 'grammarChallenge.pronounsDesc',
    howToPlayKey: 'grammarChallenge.howToPlayPronouns',
    icon: '👤',
    ageBadge: '🏆 Age 7: Pronouns',
    accentColor: '#EC4899',
  },
  prepositions: {
    heroKey: 'grammarChallenge.prepositionsHero',
    descKey: 'grammarChallenge.prepositionsDesc',
    howToPlayKey: 'grammarChallenge.howToPlayPrepositions',
    icon: '📍',
    ageBadge: '🏆 Age 7: Prepositions',
    accentColor: '#06B6D4',
  },
  basic_tenses: {
    heroKey: 'grammarChallenge.tensesHero',
    descKey: 'grammarChallenge.tensesDesc',
    howToPlayKey: 'grammarChallenge.howToPlayTenses',
    icon: '⏱️',
    ageBadge: '🏆 Age 7: Basic Tenses',
    accentColor: '#6366F1',
  },
  sentence_correction: {
    heroKey: 'grammarChallenge.correctionHero',
    descKey: 'grammarChallenge.correctionDesc',
    howToPlayKey: 'grammarChallenge.howToPlayCorrection',
    icon: '✔️',
    ageBadge: '🏆 Age 7: Fix Sentence',
    accentColor: '#059669',
  },
};

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const topic: GrammarTopic = route.params?.topic || 'noun_or_verb';
  const meta = TOPIC_METADATA[topic] || TOPIC_METADATA.noun_or_verb;

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Auto-speak welcoming instructions
  useEffect(() => {
    const welcomeText = `${t(meta.heroKey, meta.heroKey)}! ${t(meta.descKey, meta.descKey)}`;
    speakPhrase(welcomeText, { language: motherTongue });

    return () => {
      stopSpeech();
    };
  }, [topic, motherTongue, meta, t]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', {
      screen: 'GrammarChallengeGame' as any,
      params: { topic },
    });
  };

  const handleGoBack = () => {
    stopSpeech();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      <CartoonBackground theme="library" />

      {/* Cloud & Sun Clearance: ensures sky, clouds, sun and mobile notification panel are 100% free */}
      <CloudClearanceSpacer />

      {/* Header - positioned cleanly below the clouds */}
      <View style={styles.header}>
        <View style={styles.headerBtnWrapper}>
          <BigTouchTarget
            onPress={handleGoBack}
            accessibilityLabel="Back to game catalog"
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </BigTouchTarget>
        </View>

        <View style={[styles.ageBadgePill, { borderColor: meta.accentColor }]}>
          <Text style={[styles.ageBadgeText, { color: meta.accentColor }]}>
            {meta.ageBadge}
          </Text>
        </View>

        <View style={styles.headerBtnWrapper}>
          <BigTouchTarget
            onPress={() => setShowHowToPlay(true)}
            accessibilityLabel="How to play instructions"
            accessibilityRole="button"
            style={styles.helpButton}
          >
            <Text style={styles.helpButtonText}>❓</Text>
          </BigTouchTarget>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          screenWidth > 600 && styles.wideContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={[styles.iconCircle, { backgroundColor: `${meta.accentColor}1A` }]}>
            <Text style={styles.heroIcon}>{meta.icon}</Text>
          </View>

          <Text style={styles.heroTitle}>{t(meta.heroKey, meta.heroKey)}</Text>
          <Text style={styles.heroSubtitle}>{t(meta.descKey, meta.descKey)}</Text>

          {/* Feature Highlights */}
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightIcon}>🎯</Text>
              <Text style={styles.highlightText}>
                {t('grammarChallenge.highlight5Questions', '5 Child-Friendly Questions')}
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightIcon}>⭐</Text>
              <Text style={styles.highlightText}>
                {t('grammarChallenge.highlightStars', 'Earn Stars & Grammar XP')}
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightIcon}>💡</Text>
              <Text style={styles.highlightText}>
                {t('grammarChallenge.highlightPraise', 'Instant Feedback & Audio')}
              </Text>
            </View>
          </View>
        </View>

        {/* Mascot Greeting */}
        <View style={styles.mascotSection}>
          <MascotCharacter state="idle" />
          <View style={styles.mascotBubble}>
            <Text style={styles.mascotBubbleText}>
              {t(
                'grammarChallenge.mascotSpeech',
                'Ready to master words and sentences? Tap Start!'
              )}
            </Text>
          </View>
        </View>

        {/* Start Game Button */}
        <View style={styles.startBtnContainer}>
          <BigTouchTarget
            onPress={handleStartGame}
            accessibilityLabel="Start playing"
            accessibilityRole="button"
            style={[styles.startButton, { backgroundColor: meta.accentColor }]}
          >
            <Text style={styles.startButtonText}>
              {t('grammarChallenge.startGame', 'Start Adventure! 🚀')}
            </Text>
          </BigTouchTarget>
        </View>
      </ScrollView>

      {/* How to Play Modal */}
      <FriendlyModal
        visible={showHowToPlay}
        title={t('grammarChallenge.howToPlayTitle', 'How to Play')}
        onDismiss={() => setShowHowToPlay(false)}
      >
        <View style={styles.howToPlayModalContent}>
          <Text style={styles.howToPlayText}>
            {t(meta.howToPlayKey, meta.howToPlayKey)}
          </Text>
        </View>
      </FriendlyModal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerBtnWrapper: {
    width: 46,
    height: 46,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#334155',
  },
  ageBadgePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  ageBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  helpButtonText: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wideContent: {
    maxWidth: 580,
    alignSelf: 'center',
    width: '100%',
  },
  heroCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    marginTop: 8,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  highlightsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderRadius: 18,
    padding: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 12,
    width: '100%',
    justifyContent: 'center',
  },
  mascotBubble: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    padding: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginLeft: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mascotBubbleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 20,
  },
  startBtnContainer: {
    width: '100%',
    marginTop: 24,
  },
  startButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  howToPlayModalContent: {
    paddingVertical: 8,
  },
  howToPlayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 24,
  },
});

/**
 * Purpose: Game Mode Selection Screen consuming registered datasets dynamically with Language Selector for testing.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching
 */

import React from 'react';
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
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { useAlphabetMatchingStore } from './store/alphabetMatchingStore';
import { useSpeechPlaybackStore } from './store/speechPlaybackStore';
import { AlphabetMatchingStackParamList, GameMode } from './types';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { ALL_DATASETS } from './datasets';
import { stopSpeech } from '../../../services/speechService';
import { useLearningLanguage } from '../../../language';

type NavigationProp = NativeStackNavigationProp<
  AlphabetMatchingStackParamList,
  'AlphabetMatchingModeSelection'
>;

export const ModeSelectionScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const { learningLanguage, setLearningLanguage } = useLearningLanguage();

  const [showTutorial, setShowTutorial] = React.useState(false);

  const setMode = useAlphabetMatchingStore((s) => s.setMode);
  const resetSession = useAlphabetMatchingStore((s) => s.resetSession);
  const resetPlaybackState = useSpeechPlaybackStore((s) => s.resetPlaybackState);

  React.useEffect(() => {
    stopSpeech();
  }, []);

  const handleSelectMode = (selectedMode: GameMode) => {
    resetSession();
    resetPlaybackState();
    setMode(selectedMode);
    navigation.navigate('AlphabetMatchingGame');
  };

  const cardWidth = Math.min(screenWidth - 32, 380);

  return (
    <View style={styles.webOuterContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2B5A" />

        {/* Cartoon Background Scenery */}
        <CartoonBackground />

        {/* Top Bar Title Header + Back to Catalog & Tutorial Buttons */}
        <View style={styles.headerContainer}>
          <BigTouchTarget
            onPress={() => (navigation as any).navigate('GameCatalog')}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
            style={styles.backPillButton}
          >
            <Text style={styles.backPillText}>← {t('common.back')}</Text>
          </BigTouchTarget>

          <Text style={styles.headerTitleText}>{t('alphabetMatching.modeSelectionTitle', { defaultValue: 'Alphabet Matching' })}</Text>

          <BigTouchTarget
            onPress={() => setShowTutorial(true)}
            accessibilityLabel={t('alphabetMatching.howToPlayBtn')}
            accessibilityRole="button"
            style={styles.tutorialPillButton}
          >
            <Text style={styles.tutorialPillText}>{t('alphabetMatching.howToPlayBtn')}</Text>
          </BigTouchTarget>
        </View>

        {/* Dynamic Cards Container from ALL_DATASETS */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {ALL_DATASETS.map((dataset) => (
            <BigTouchTarget
              key={dataset.id}
              onPress={() => handleSelectMode(dataset.id)}
              accessibilityLabel={`${dataset.title}, ${dataset.subtitle}`}
              accessibilityRole="button"
              style={[
                styles.modeCard,
                {
                  width: cardWidth,
                  backgroundColor: dataset.bgColor,
                  borderBottomColor: dataset.bevelColor,
                },
              ]}
            >
              <View style={styles.innerHighlightRibbon} />
              <View style={styles.cardContentRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.cardIconText}>{dataset.icon}</Text>
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitleText}>{dataset.title}</Text>
                  <Text style={styles.cardSubtitleText}>{dataset.subtitle}</Text>
                </View>
              </View>
            </BigTouchTarget>
          ))}
        </ScrollView>

        {/* Tutorial Modal */}
        <FriendlyModal
          visible={showTutorial}
          onDismiss={() => setShowTutorial(false)}
          title={t('alphabetMatching.howToPlayTitle')}
          dismissText={t('alphabetMatching.gotItBtn')}
        >
          <View style={styles.tutorialContent}>
            <Text style={styles.tutorialStep}>1. {t('alphabetMatching.step1')}</Text>
            <Text style={styles.tutorialStep}>2. {t('alphabetMatching.step2')}</Text>
            <Text style={styles.tutorialStep}>3. {t('alphabetMatching.step3')}</Text>
          </View>
        </FriendlyModal>
      </SafeAreaView>
    </View>
  );
});

ModeSelectionScreen.displayName = 'ModeSelectionScreen';

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
  headerContainer: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: Colors.header.topBarNavy,
    paddingHorizontal: 16,
    zIndex: 20,
    gap: 16,
  },
  headerTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  backPillButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#334155',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPillText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#F8FAFC',
  },
  tutorialPillButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FEF08A',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  tutorialPillText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  tutorialContent: {
    width: '100%',
    marginVertical: 12,
    gap: 8,
  },
  tutorialStep: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: Colors.neutral.textDark,
    lineHeight: 20,
  },
  langSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 4,
    gap: 6,
  },
  langPillButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
    minWidth: 70,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langPillActive: {
    backgroundColor: '#38BDF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  langPillText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#E2E8F0',
  },
  langPillTextActive: {
    fontFamily: Typography.fonts.bold,
    color: '#0F2042',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 18,
  },
  modeCard: {
    height: 115,
    minHeight: 84,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F2042',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  innerHighlightRibbon: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconText: {
    fontSize: 32,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 2,
  },
});

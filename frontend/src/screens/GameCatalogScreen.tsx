/**
 * Purpose: Central Game Catalog Screen — Filters games by selectedLanguage AND selectedAge.
 *          2-Column Grid Layout featuring glassmorphic 3D soft-UI cards with PLAY ▶ action buttons.
 * Module: Screens
 * Folder: frontend/src/screens
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
import { LinearGradient } from 'expo-linear-gradient';

import { BigTouchTarget } from '../components/BigTouchTarget';
import { CartoonBackground } from '../components/CartoonBackground';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { GAME_REGISTRY, GameRegistryEntry } from '../config/gameRegistry';
import { useAppLanguageStore } from '../state/appLanguageStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameCatalog'>;

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

export const GameCatalogScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const selectedLanguage = useAppLanguageStore((s) => s.selectedLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

  const availableGames = GAME_REGISTRY.filter(
    (game) =>
      game.supportedLanguages.includes(selectedLanguage) &&
      game.ageGroups.includes(selectedAge)
  );

  const handleOpenGame = (game: GameRegistryEntry) => {
    if (game.id === 'alphabet_matching') {
      navigation.navigate('Games', { screen: 'AlphabetMatchingModeSelection' });
    } else if (game.id === 'capital_small_match') {
      navigation.navigate('Games', { screen: 'CapitalSmallMatchIntro' });
    } else if (game.id === 'vowel_matra_match') {
      navigation.navigate('Games', { screen: 'VowelMatraMatchIntro' });
    } else if (game.id === 'speech_word_challenge') {
      navigation.navigate('Games', { screen: 'SpeechWordChallengeIntro' as any });
    } else {
      console.log(`[GameCatalog] Selected game: ${game.id}`);
    }
  };

  const handleOpenLanguageGate = () => {
    navigation.navigate('LanguageGate');
  };

  const containerWidth = Math.min(screenWidth - 32, 440);
  const gridCardWidth = (containerWidth - 14) / 2;
  const currentLangLabel = LANGUAGE_LABELS[selectedLanguage] || 'English';

  return (
    <View style={styles.webOuterContainer}>
      {/* Illustrated Scenery Background (Sun, Hills, Sky Gradient) */}
      <CartoonBackground theme="hub" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0E7490" />

        {/* Floating Glassmorphic Header Card */}
        <View style={[styles.headerCard, { width: containerWidth }]}>
          <View style={styles.headerLeftRow}>
            <BigTouchTarget
              onPress={handleOpenLanguageGate}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← {t('common.back')}</Text>
            </BigTouchTarget>

            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitleText}>{t('games.catalogTitle')}</Text>
              <Text style={styles.headerSubtitleText}>
                {t('games.catalogSubtitle')} • {t('ageGate.ageBadge', { age: selectedAge })}
              </Text>
            </View>
          </View>

          <View style={styles.headerRightCol}>
            <BigTouchTarget
              onPress={handleOpenLanguageGate}
              accessibilityLabel={`${t('games.changeLanguage')}, ${currentLangLabel}`}
              accessibilityRole="button"
              style={styles.languageSwitchButton}
            >
              <Text style={styles.languageSwitchText}>🌐 {currentLangLabel}</Text>
            </BigTouchTarget>
            <BigTouchTarget
              onPress={handleOpenLanguageGate}
              accessibilityLabel={`Age ${selectedAge}`}
              accessibilityRole="button"
              style={styles.ageSwitchButton}
            >
              <Text style={styles.ageSwitchText}>🎂 Age {selectedAge}</Text>
            </BigTouchTarget>
          </View>
        </View>

        {/* 2-Column Grid Game Catalog */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {availableGames.length > 0 ? (
            <View style={[styles.gridContainer, { width: containerWidth }]}>
              {availableGames.map((game) => {
                const title = t(game.titleKey);
                const description = t(game.descriptionKey);

                return (
                  <BigTouchTarget
                    key={game.id}
                    onPress={() => handleOpenGame(game)}
                    accessibilityLabel={`${title}, ${description}`}
                    accessibilityHint={t('games.playGameHint', { game: title })}
                    accessibilityRole="button"
                    style={[
                      styles.gameCard,
                      {
                        width: gridCardWidth,
                        borderColor: '#FFFFFF',
                        borderBottomColor: game.bevelColor,
                      },
                    ]}
                  >
                    {/* Linear Gradient Layer */}
                    <LinearGradient
                      colors={game.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />

                    {/* Glass Surface Highlight */}
                    <View style={styles.cardHighlight} />

                    {/* Tag / Badge at Top Right */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>{game.badgeTag}</Text>
                      </View>
                    </View>

                    {/* Central Icon Bubble */}
                    <View style={styles.iconCircleContainer}>
                      <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>{game.iconAsset}</Text>
                      </View>
                    </View>

                    {/* Title & Description */}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {title}
                      </Text>
                      <Text style={styles.cardDescription} numberOfLines={2}>
                        {description}
                      </Text>
                    </View>

                    {/* Bottom Play Action Bar */}
                    <View style={styles.cardFooter}>
                      <View style={styles.playButtonPill}>
                        <Text style={styles.playButtonText}>{t('games.playNow')} ▶</Text>
                      </View>
                    </View>
                  </BigTouchTarget>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { width: containerWidth }]}>
              <Text style={styles.emptyIcon}>🎮</Text>
              <Text style={styles.emptyTitle}>{t('games.noGamesTitle')}</Text>
              <Text style={styles.emptySubtitle}>{t('games.noGamesDesc')}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
});

GameCatalogScreen.displayName = 'GameCatalogScreen';

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 20,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    lineHeight: 22,
  },
  headerSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  languageSwitchButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderBottomWidth: 3,
    borderBottomColor: '#93C5FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  languageSwitchText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#1D4ED8',
  },
  ageSwitchButton: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderBottomWidth: 3,
    borderBottomColor: '#D8B4FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ageSwitchText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 10,
    color: '#7E22CE',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  gameCard: {
    height: 230,
    borderRadius: 24,
    borderWidth: 3,
    borderBottomWidth: 6,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
  },
  cardHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 10,
    color: '#0F172A',
  },
  iconCircleContainer: {
    zIndex: 2,
    marginVertical: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  iconText: {
    fontSize: 32,
  },
  cardBody: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  cardTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    marginTop: 2,
  },
  cardFooter: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 4,
  },
  playButtonPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  playButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#0F172A',
  },
  emptyContainer: {
    marginTop: 60,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

/**
 * Purpose: Central Game Catalog / Choice Screen — 2-Column Grid Layout featuring 2 games per row,
 *          illustrated 'hub' SceneBackground (sun, hills, sky scenery), transparent container wrappers,
 *          and glassmorphic 3D soft-UI cards with PLAY ▶ action buttons.
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
import { MascotCharacter } from '../components/MascotCharacter';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { GAME_REGISTRY, GameRegistryEntry } from '../config/gameRegistry';
import { useAppLanguageStore } from '../state/appLanguageStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GameCatalog'
>;

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

export const GameCatalogScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();

  const selectedLanguage =
    useAppLanguageStore((s) => s.selectedLanguage) || 'en';

  const availableGames = GAME_REGISTRY.filter((game) =>
    game.supportedLanguages.includes(selectedLanguage)
  );

  // Open the selected game.
  const handleOpenGame = (game: GameRegistryEntry) => {
    if (game.id === 'alphabet_matching') {
      navigation.navigate('Games', {
        screen: 'AlphabetMatchingModeSelection',
      });
    } else if (game.id === 'capital_small_match') {
      navigation.navigate('Games', {
        screen: 'CapitalSmallMatchIntro',
      });
    } else if (game.id === 'vowel_matra_match') {
      navigation.navigate('Games', {
        screen: 'VowelMatraMatchIntro',
      });
    } else {
      console.log(`[GameCatalog] Selected game: ${game.id}`);
    }
  };

  // Change language.
  const handleOpenLanguageGate = () => {
    navigation.navigate('LanguageGate');
  };

  // Back from Games → Home.
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const containerWidth = Math.min(screenWidth - 32, 440);
  const gridCardWidth = (containerWidth - 14) / 2;
  const currentLangLabel =
    LANGUAGE_LABELS[selectedLanguage] || 'English';

  return (
    <View style={styles.webOuterContainer}>
      {/* Illustrated Scenery Background */}
      <CartoonBackground theme="hub" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0E7490"
        />

        {/* Header */}
        <View
          style={[
            styles.headerCard,
            {
              width: containerWidth,
            },
          ]}
        >
          <View style={styles.headerLeftRow}>
            <BigTouchTarget
              onPress={handleGoHome}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>
                ← {t('common.back')}
              </Text>
            </BigTouchTarget>

            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitleText}>
                {t('games.catalogTitle')}
              </Text>

              <Text style={styles.headerSubtitleText}>
                {t('games.catalogSubtitle')}
              </Text>
            </View>
          </View>

          {/* Language Switch */}
          <BigTouchTarget
            onPress={handleOpenLanguageGate}
            accessibilityLabel={`${t(
              'games.changeLanguage'
            )}, current language ${currentLangLabel}`}
            accessibilityRole="button"
            style={styles.languageSwitchButton}
          >
            <Text style={styles.languageSwitchText}>
              🌐 {currentLangLabel}
            </Text>
          </BigTouchTarget>
        </View>

        {/* Games */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {availableGames.length > 0 ? (
            <View
              style={[
                styles.gridContainer,
                {
                  width: containerWidth,
                },
              ]}
            >
              {availableGames.map((game) => {
                const title = t(game.titleKey);
                const description = t(game.descriptionKey);

                return (
                  <BigTouchTarget
                    key={game.id}
                    onPress={() => handleOpenGame(game)}
                    accessibilityLabel={`${title}, ${description}`}
                    accessibilityRole="button"
                    style={[
                      styles.gridCardWrapper,
                      {
                        width: gridCardWidth,
                        borderBottomColor: game.bevelColor,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={game.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.cardGradientFill}
                    >
                      {/* Highlight */}
                      <View style={styles.innerHighlightRibbon} />

                      {/* Card Top */}
                      <View style={styles.cardTopRow}>
                        <View style={styles.iconBacking}>
                          <Text style={styles.cardIconText}>
                            {game.iconAsset}
                          </Text>
                        </View>

                        <View style={styles.cardBadgePill}>
                          <Text style={styles.cardBadgeText}>
                            {game.badgeTag}
                          </Text>
                        </View>
                      </View>

                      {/* Card Middle */}
                      <View style={styles.cardMiddleContainer}>
                        <Text
                          style={styles.cardTitleText}
                          numberOfLines={2}
                        >
                          {title}
                        </Text>

                        <Text
                          style={styles.cardSubtitleText}
                          numberOfLines={2}
                        >
                          {description}
                        </Text>
                      </View>

                      {/* Play */}
                      <View style={styles.playActionPill}>
                        <Text style={styles.playActionText}>
                          ▶ PLAY
                        </Text>
                      </View>
                    </LinearGradient>
                  </BigTouchTarget>
                );
              })}
            </View>
          ) : (
            <View
              style={[
                styles.emptyContainer,
                {
                  width: containerWidth,
                },
              ]}
            >
              <View style={styles.emptyMascotWrapper}>
                <MascotCharacter
                  state="encouraging"
                  style={styles.emptyMascot}
                />
              </View>

              <Text style={styles.emptyTitleText}>
                {t('games.emptyStateTitle')}
              </Text>

              <Text style={styles.emptySubtitleText}>
                {t('games.emptyStateSubtitle')}
              </Text>

              <BigTouchTarget
                onPress={handleOpenLanguageGate}
                accessibilityLabel={t(
                  'games.pickAnotherLanguage'
                )}
                accessibilityRole="button"
                style={styles.pickLanguageButton}
              >
                <Text style={styles.pickLanguageButtonText}>
                  {t('games.pickAnotherLanguage')}
                </Text>
              </BigTouchTarget>
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },

  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
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
    fontSize: 19,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  headerSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 1,
  },

  languageSwitchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 4,
    borderBottomColor: '#0369A1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0369A1',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  languageSwitchText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
    width: '100%',
    zIndex: 10,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },

  gridCardWrapper: {
    minHeight: 215,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 7,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 7,
  },

  cardGradientFill: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },

  innerHighlightRibbon: {
    position: 'absolute',
    top: 3,
    left: 8,
    right: 8,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  iconBacking: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  cardIconText: {
    fontSize: 28,
  },

  cardBadgePill: {
    backgroundColor: Colors.catalogCard.badgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  cardBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 10,
    color: Colors.catalogCard.badgeText,
  },

  cardMiddleContainer: {
    marginVertical: 10,
  },

  cardTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
    lineHeight: 20,
  },

  cardSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 4,
    lineHeight: 15,
  },

  playActionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  playActionText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#38BDF8',
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.neutral.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },

  emptyMascotWrapper: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },

  emptyMascot: {
    width: 90,
    height: 90,
  },

  emptyTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#0F2042',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  pickLanguageButton: {
    width: '100%',
    height: 56,
    minHeight: 84,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#1D4ED8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  pickLanguageButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
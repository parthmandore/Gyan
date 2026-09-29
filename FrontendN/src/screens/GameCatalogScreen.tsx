/**
 * Purpose: Central Game Catalog Screen.
 * Displays the complete Gyan game catalog based on selected language and age.
 * Module: Screens
 * Folder: FrontendN/src/screens
 */

import React, { useMemo } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { BigTouchTarget } from '../components/BigTouchTarget';
import { CartoonBackground } from '../components/CartoonBackground';

import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

import {
  GAME_REGISTRY,
  GameRegistryEntry,
} from '../config/gameRegistry';

import { useAppLanguageStore } from '../state/appLanguageStore';

import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GameCatalog'
>;

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

const FALLBACK_ICON = '🎮';

const getGameIcon = (game: GameRegistryEntry): string => {
  if (!game.iconAsset) {
    return FALLBACK_ICON;
  }

  /*
   * The teammate registry stores iconAsset as a string.
   * Some entries may use an emoji/string identifier rather than
   * a directly require()-able React Native asset.
   */
  return game.iconAsset;
};

const getGameTitle = (
  game: GameRegistryEntry,
  t: (key: string, options?: any) => string,
): string => {
  const translated = t(game.titleKey);

  if (
    !translated ||
    translated === game.titleKey ||
    translated.startsWith('translation:')
  ) {
    return game.titleKey
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return translated;
};

const getGameDescription = (
  game: GameRegistryEntry,
  t: (key: string, options?: any) => string,
): string => {
  const translated = t(game.descriptionKey);

  if (
    !translated ||
    translated === game.descriptionKey ||
    translated.startsWith('translation:')
  ) {
    return 'Interactive learning activity';
  }

  return translated;
};

export const GameCatalogScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();

  const navigation = useNavigation<NavigationProp>();

  const { width: screenWidth } = useWindowDimensions();

  const selectedLanguage =
    useAppLanguageStore(
      (state) => state.selectedLanguage,
    ) || 'en';

  const selectedAge =
    useAppLanguageStore(
      (state) => state.selectedAge,
    ) || 5;

  /*
   * The catalog is filtered by both:
   * - currently selected language
   * - currently selected learner age
   */
  const availableGames = useMemo(() => {
    return GAME_REGISTRY.filter(
      (game) =>
        game.supportedLanguages.includes(
          selectedLanguage,
        ) &&
        game.ageGroups.includes(selectedAge),
    );
  }, [selectedLanguage, selectedAge]);

  /*
   * IMPORTANT:
   *
   * We no longer maintain a giant if/else list for games.
   *
   * gameRegistry.ts contains:
   *   navigatorRoute
   *   routeParams
   *
   * Therefore the catalog can automatically launch all
   * registered games and their specific modes.
   */
  const handleOpenGame = (
    game: GameRegistryEntry,
  ) => {
    const screen = game.navigatorRoute as any;

    if (game.routeParams) {
      navigation.navigate('Games', {
        screen,
        params: game.routeParams as any,
      } as any);

      return;
    }

    navigation.navigate('Games', {
      screen,
    } as any);
  };

  const handleOpenLanguageGate = () => {
    navigation.navigate('LanguageGate');
  };

  const containerWidth = Math.min(
    screenWidth - 32,
    440,
  );

  const gridCardWidth =
    (containerWidth - 14) / 2;

  const currentLangLabel =
    LANGUAGE_LABELS[selectedLanguage] ||
    'English';

  return (
    <View style={styles.webOuterContainer}>
      <CartoonBackground theme="hub" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0E7490"
        />

        {/* HEADER */}
        <View
          style={[
            styles.headerCard,
            { width: containerWidth },
          ]}
        >
          <View style={styles.headerLeftRow}>
            <BigTouchTarget
              onPress={handleOpenLanguageGate}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>
                ←
              </Text>
            </BigTouchTarget>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                Learning Games
              </Text>

              <Text style={styles.headerSubtitle}>
                {currentLangLabel} • Age {selectedAge}
              </Text>
            </View>
          </View>

          <View style={styles.gameCountBadge}>
            <Text style={styles.gameCountText}>
              {availableGames.length}
            </Text>

            <Text style={styles.gameCountLabel}>
              games
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              width: containerWidth,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <Text style={styles.introEmoji}>
              🎮
            </Text>

            <View style={styles.introTextContainer}>
              <Text style={styles.introTitle}>
                Let's Learn & Play!
              </Text>

              <Text style={styles.introDescription}>
                Choose a game and start learning
                through fun activities.
              </Text>
            </View>
          </View>

          {availableGames.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>
                🌱
              </Text>

              <Text style={styles.emptyTitle}>
                More games coming soon
              </Text>

              <Text style={styles.emptyDescription}>
                No games are currently available
                for this language and age.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {availableGames.map((game) => {
                const icon = getGameIcon(game);

                const title = getGameTitle(
                  game,
                  t,
                );

                const description =
                  getGameDescription(
                    game,
                    t,
                  );

                return (
                  <Pressable
                    key={game.id}
                    onPress={() =>
                      handleOpenGame(game)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Play ${title}`}
                    style={({ pressed }) => [
                      styles.cardWrapper,
                      {
                        width: gridCardWidth,
                        transform: [
                          {
                            scale: pressed
                              ? 0.97
                              : 1,
                          },
                        ],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.gameCard,
                        {
                          borderColor:
                            game.bevelColor ||
                            'rgba(255,255,255,0.6)',
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={
                          game.gradientColors ||
                          [
                            '#FFFFFF',
                            '#F5F7FF',
                            '#EEF2FF',
                          ]
                        }
                        style={styles.cardGradient}
                      >
                        {/* BADGE */}
                        {!!game.badgeTag && (
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor:
                                  game.bgColor ||
                                  '#8B7CF6',
                              },
                            ]}
                          >
                            <Text
                              style={
                                styles.badgeText
                              }
                              numberOfLines={1}
                            >
                              {game.badgeTag}
                            </Text>
                          </View>
                        )}

                        {/* ICON */}
                        <View
                          style={[
                            styles.iconCircle,
                            {
                              backgroundColor:
                                game.bgColor ||
                                '#EDE9FE',
                            },
                          ]}
                        >
                          <Text
                            style={
                              styles.gameIcon
                            }
                          >
                            {icon || FALLBACK_ICON}
                          </Text>
                        </View>

                        {/* TITLE */}
                        <Text
                          style={styles.gameTitle}
                          numberOfLines={2}
                        >
                          {title}
                        </Text>

                        {/* DESCRIPTION */}
                        <Text
                          style={
                            styles.gameDescription
                          }
                          numberOfLines={3}
                        >
                          {description}
                        </Text>

                        {/* PLAY BUTTON */}
                        <View
                          style={[
                            styles.playButton,
                            {
                              backgroundColor:
                                game.bgColor ||
                                '#8B7CF6',
                            },
                          ]}
                        >
                          <Text
                            style={
                              styles.playButtonText
                            }
                          >
                            PLAY
                          </Text>

                          <Text
                            style={
                              styles.playArrow
                            }
                          >
                            ▶
                          </Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#0E7490',
  },

  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignSelf: 'center',
    paddingTop: 14,
    paddingBottom: 24,
  },

  headerCard: {
    alignSelf: 'center',
    minHeight: 76,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 24,

    backgroundColor:
      'rgba(255,255,255,0.94)',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },

  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#E8F7FA',
    marginRight: 10,
  },

  backButtonText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0E7490',
    lineHeight: 28,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#17324D',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  gameCountBadge: {
    minWidth: 54,
    paddingHorizontal: 9,
    paddingVertical: 7,

    borderRadius: 16,

    backgroundColor: '#F0ECFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  gameCountText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6D5CE7',
  },

  gameCountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8176B5',
  },

  introCard: {
    width: '100%',
    minHeight: 86,

    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,

    borderRadius: 22,

    backgroundColor:
      'rgba(255,255,255,0.91)',

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  introEmoji: {
    fontSize: 38,
    marginRight: 13,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#17324D',
  },

  introDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: '#667085',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },

  cardWrapper: {
    borderRadius: 23,
  },

  gameCard: {
    minHeight: 244,

    borderWidth: 1.5,
    borderRadius: 23,

    overflow: 'hidden',

    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  cardGradient: {
    flex: 1,

    minHeight: 244,

    paddingHorizontal: 11,
    paddingVertical: 11,

    alignItems: 'center',
  },

  badge: {
    alignSelf: 'flex-start',

    maxWidth: '85%',

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 10,

    marginBottom: 5,
  },

  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },

  iconCircle: {
    width: 64,
    height: 64,

    borderRadius: 32,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 2,
    marginBottom: 8,
  },

  gameIcon: {
    fontSize: 32,
    textAlign: 'center',
  },

  gameTitle: {
    width: '100%',

    minHeight: 39,

    textAlign: 'center',

    fontSize: 14,
    lineHeight: 18,

    fontWeight: '900',

    color: '#20324A',
  },

  gameDescription: {
    width: '100%',

    minHeight: 42,

    marginTop: 3,

    textAlign: 'center',

    fontSize: 9.5,
    lineHeight: 13,

    fontWeight: '600',

    color: '#718096',
  },

  playButton: {
    minWidth: 92,

    marginTop: 'auto',

    paddingHorizontal: 11,
    paddingVertical: 8,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  playButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  playArrow: {
    marginLeft: 5,

    fontSize: 9,

    color: '#FFFFFF',
  },

  emptyCard: {
    width: '100%',

    paddingHorizontal: 24,
    paddingVertical: 35,

    borderRadius: 24,

    backgroundColor:
      'rgba(255,255,255,0.92)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyEmoji: {
    fontSize: 45,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#26384D',
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 7,

    fontSize: 12,
    lineHeight: 18,

    color: '#6B7280',
    fontWeight: '600',

    textAlign: 'center',
  },

  bottomSpacing: {
    height: 30,
  },
});

GameCatalogScreen.displayName =
  'GameCatalogScreen';

export default GameCatalogScreen;
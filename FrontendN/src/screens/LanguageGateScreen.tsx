/**
 * Purpose: First-launch Language Gate Screen
 *          LingoBloom branded language selection experience.
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
import { Typography } from '../theme/typography';
import {
  AppLanguage,
  useAppLanguageStore,
} from '../state/appLanguageStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LanguageGate'
>;

interface LanguageCardOption {
  id: AppLanguage;
  nativeTitleKey: string;
  subtitleKey: string;
  icon: string;
  bgColor: string;
  darkColor: string;
  accentColor: string;
}

const LANGUAGE_CARDS: readonly LanguageCardOption[] = [
  {
    id: 'en',
    nativeTitleKey: 'languageGate.english',
    subtitleKey: 'languageGate.englishSub',
    icon: '🔤',
    bgColor: '#8B7CF6',
    darkColor: '#6655D8',
    accentColor: '#C4BCFF',
  },
  {
    id: 'hi',
    nativeTitleKey: 'languageGate.hindi',
    subtitleKey: 'languageGate.hindiSub',
    icon: '🗣️',
    bgColor: '#FF8A7A',
    darkColor: '#D96558',
    accentColor: '#FFC4BC',
  },
  {
    id: 'mr',
    nativeTitleKey: 'languageGate.marathi',
    subtitleKey: 'languageGate.marathiSub',
    icon: '📚',
    bgColor: '#55CFA3',
    darkColor: '#2B9F78',
    accentColor: '#A7EED2',
  },
];

export const LanguageGateScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();

  const setSelectedLanguage = useAppLanguageStore(
    (s) => s.setSelectedLanguage
  );

  const [reduceMotion, setReduceMotion] = useState(false);

  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.96);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      contentOpacity.value = 1;
      contentScale.value = 1;
      return;
    }

    contentOpacity.value = withTiming(1, {
      duration: 450,
    });

    contentScale.value = withSpring(1, {
      damping: 16,
      stiffness: 120,
    });
  }, [reduceMotion, contentOpacity, contentScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        scale: contentScale.value,
      },
    ],
  }));

  const handleSelectLanguage = async (lang: AppLanguage) => {
    await setSelectedLanguage(lang);

    navigation.reset({
      index: 0,
      routes: [{ name: 'GameCatalog' }],
    });
  };

  const cardWidth = Math.min(screenWidth - 32, 420);

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#DDF7F7"
        />

        <CartoonBackground theme="hub" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              animatedStyle,
            ]}
          >
            {/* BRAND */}
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>🌱</Text>
              </View>

              <View>
                <Text style={styles.brandName}>
                  LingoBloom
                </Text>

                <Text style={styles.brandTagline}>
                  Learn • Play • Grow
                </Text>
              </View>
            </View>

            {/* HERO */}
            <View style={styles.heroSection}>
              <View style={styles.sparkleBubble}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>

              <Text style={styles.titleText}>
                {t('languageGate.title')}
              </Text>

              <Text style={styles.subtitleText}>
                {t('languageGate.subtitle')}
              </Text>

              <View style={styles.helperPill}>
                <Text style={styles.helperPillText}>
                  🌍 Choose your learning language
                </Text>
              </View>
            </View>

            {/* LANGUAGE CARDS */}
            <View
              style={[
                styles.cardsContainer,
                {
                  width: cardWidth,
                },
              ]}
            >
              {LANGUAGE_CARDS.map((card, index) => {
                const title = t(card.nativeTitleKey);
                const subtitle = t(card.subtitleKey);

                return (
                  <Animated.View
                    key={card.id}
                    style={styles.cardAnimationWrapper}
                  >
                    <BigTouchTarget
                      onPress={() =>
                        handleSelectLanguage(card.id)
                      }
                      accessibilityLabel={`${title}, ${subtitle}`}
                      accessibilityHint={t(
                        'languageGate.accessibilityHint',
                        {
                          language: title,
                        }
                      )}
                      accessibilityRole="button"
                      style={[
                        styles.languageCard,
                        {
                          backgroundColor: card.bgColor,
                          borderBottomColor: card.darkColor,
                        },
                      ]}
                    >
                      {/* Shine */}
                      <View
                        style={[
                          styles.cardShine,
                          {
                            backgroundColor:
                              card.accentColor,
                          },
                        ]}
                      />

                      {/* Number */}
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberBadgeText}>
                          {index + 1}
                        </Text>
                      </View>

                      {/* Content */}
                      <View style={styles.cardContentRow}>
                        <View style={styles.iconCircle}>
                          <Text style={styles.cardIconText}>
                            {card.icon}
                          </Text>
                        </View>

                        <View style={styles.cardTextContainer}>
                          <Text
                            style={styles.cardTitleText}
                            numberOfLines={1}
                          >
                            {title}
                          </Text>

                          <Text
                            style={styles.cardSubtitleText}
                            numberOfLines={2}
                          >
                            {subtitle}
                          </Text>
                        </View>

                        {/* Arrow */}
                        <View style={styles.arrowCircle}>
                          <Text style={styles.arrowText}>
                            →
                          </Text>
                        </View>
                      </View>
                    </BigTouchTarget>
                  </Animated.View>
                );
              })}
            </View>

            {/* BOTTOM MESSAGE */}
            <View style={styles.bottomMessage}>
              <View style={styles.bottomEmojiBubble}>
                <Text style={styles.bottomEmoji}>🌸</Text>
              </View>

              <View style={styles.bottomTextContainer}>
                <Text style={styles.bottomTitle}>
                  Your learning journey starts here
                </Text>

                <Text style={styles.bottomSubtitle}>
                  Pick a language and let's grow together!
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
});

LanguageGateScreen.displayName = 'LanguageGateScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#DDF7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    maxHeight: 920,
    backgroundColor: 'transparent',
  },

  scrollView: {
    flex: 1,
    zIndex: 10,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
    alignItems: 'center',
  },

  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },

  /* BRAND */

  brandRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    paddingRight: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginBottom: 18,

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF9EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 5,
  },

  brandIconText: {
    fontSize: 25,
  },

  brandName: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#173B5E',
    letterSpacing: 0.3,
  },

  brandTagline: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#527087',
    marginTop: 1,
  },

  /* HERO */

  heroSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },

  sparkleBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF4C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  sparkleText: {
    fontSize: 28,
  },

  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 29,
    lineHeight: 35,
    color: '#173B5E',
    textAlign: 'center',
  },

  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: '#42657E',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },

  helperPill: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  helperPillText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#365A73',
  },

  /* CARDS */

  cardsContainer: {
    alignItems: 'center',
    gap: 15,
  },

  cardAnimationWrapper: {
    width: '100%',
  },

  languageCard: {
    width: '100%',
    minHeight: 112,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    overflow: 'hidden',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 7,
  },

  cardShine: {
    position: 'absolute',
    top: 4,
    left: 10,
    right: 10,
    height: 9,
    borderRadius: 8,
    opacity: 0.65,
  },

  numberBadge: {
    position: 'absolute',
    top: 15,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  numberBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },

  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 24,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },

  cardIconText: {
    fontSize: 31,
  },

  cardTextContainer: {
    flex: 1,
  },

  cardTitleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 23,
    lineHeight: 28,
    color: '#FFFFFF',

    textShadowColor: 'rgba(23,59,94,0.22)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
  },

  cardSubtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.96)',
    marginTop: 2,
  },

  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },

  arrowText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },

  /* BOTTOM MESSAGE */

  bottomMessage: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  bottomEmojiBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF4C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  bottomEmoji: {
    fontSize: 21,
  },

  bottomTextContainer: {
    flex: 1,
  },

  bottomTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#173B5E',
  },

  bottomSubtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#527087',
    marginTop: 2,
  },
});
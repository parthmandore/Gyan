/**
 * Purpose: Main LingoBloom learner home dashboard.
 * Module: Screens
 * Folder: frontend/src/screens
 */

import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Radius, Spacing, Typography } from '../theme';
import type { RootStackParamList } from '../types';

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;

  return (
    <View style={styles.container}>

      {/* ═══════════════════════════════════════
          FIXED HEADER
      ═══════════════════════════════════════ */}

      <View
        style={[
          styles.header,
          {
            paddingHorizontal: isSmallScreen
              ? Spacing.md
              : Spacing.lg,
          },
        ]}
      >
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            Good morning! ☀️
          </Text>

          <Text style={styles.subtitle}>
            Ready to learn something new?
          </Text>
        </View>

        <View
          style={styles.profileBubble}
          accessibilityLabel="Learning garden mascot"
        >
          <Text style={styles.profileEmoji}>
            🌱
          </Text>
        </View>
      </View>

      {/* ═══════════════════════════════════════
          SCROLLABLE CONTENT
      ═══════════════════════════════════════ */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallScreen
              ? Spacing.md
              : Spacing.lg,
          },
        ]}
      >

        {/* ═══════════════════════════════════════
            LEARNING JOURNEY
        ═══════════════════════════════════════ */}

        <View style={styles.journeyCard}>

          <View style={styles.journeyTop}>

            <View style={styles.journeyTitleRow}>

              <View style={styles.journeyIcon}>
                <Ionicons
                  name="sparkles"
                  size={21}
                  color="#A85B00"
                />
              </View>

              <View style={styles.journeyTextContainer}>
                <Text style={styles.journeyLabel}>
                  YOUR LEARNING JOURNEY
                </Text>

                <Text style={styles.journeySubtitle}>
                  Keep growing! 🌱
                </Text>
              </View>

            </View>

            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                LEVEL 1
              </Text>
            </View>

          </View>

          <View style={styles.xpRow}>
            <Text style={styles.xpValue}>
              120 XP
            </Text>

            <Text style={styles.xpGoal}>
              200 XP
            </Text>
          </View>

          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 200,
              now: 120,
            }}
          >
            <View style={styles.progressFill} />
          </View>

          <View style={styles.journeyFooter}>

            <View style={styles.streakContainer}>
              <Ionicons
                name="flame"
                size={17}
                color="#FFD45C"
              />

              <Text style={styles.streakText}>
                3 day streak
              </Text>
            </View>

            <Text style={styles.remainingText}>
              80 XP to next level
            </Text>

          </View>

        </View>

        {/* ═══════════════════════════════════════
            TODAY'S LEARNING
        ═══════════════════════════════════════ */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Today's Learning
          </Text>

          <Text style={styles.sectionSubtitle}>
            One small step at a time 🌱
          </Text>
        </View>

        {/* ═══════════════════════════════════════
            SPEECH STUDIO
        ═══════════════════════════════════════ */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Speech Studio"
          accessibilityHint="Practice listening and speech"
          onPress={() =>
            navigation.navigate('SpeechSynthesis')
          }
          style={({ pressed }) => [
            styles.speechCard,
            pressed && styles.pressed,
          ]}
        >

          <View style={styles.speechTopRow}>

            <View style={styles.speechIcon}>
              <Ionicons
                name="volume-high"
                size={29}
                color="#6655D8"
              />
            </View>

            <View style={styles.speechTag}>
              <Text style={styles.speechTagText}>
                AI SPEECH
              </Text>
            </View>

          </View>

          <Text style={styles.speechTitle}>
            Hear & Learn
          </Text>

          <Text style={styles.speechDescription}>
            Listen to words and sentences clearly in
            your chosen language.
          </Text>

          <View style={styles.speechActionRow}>

            <Text style={styles.speechActionText}>
              Start Learning
            </Text>

            <View style={styles.speechArrow}>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </View>

          </View>

        </Pressable>

        {/* ═══════════════════════════════════════
            PRACTICE & PLAY
        ═══════════════════════════════════════ */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Practice & Play
          </Text>

          <Text style={styles.sectionSubtitle}>
            Learn through fun activities 🎮
          </Text>
        </View>

        <View style={styles.practiceRow}>

          {/* LEARNING GAMES */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Learning Games"
            onPress={() =>
              navigation.navigate('GameCatalog')
            }
            style={({ pressed }) => [
              styles.practiceCard,
              styles.gamesCard,
              pressed && styles.pressed,
            ]}
          >

            <View style={styles.practiceIconGames}>
              <Ionicons
                name="game-controller"
                size={25}
                color="#D96558"
              />
            </View>

            <Text style={styles.practiceTitle}>
              Learning Games
            </Text>

            <Text style={styles.practiceDescription}>
              Play, match & learn
            </Text>

            <View style={styles.cardArrow}>
              <Ionicons
                name="arrow-forward"
                size={17}
                color="#6655D8"
              />
            </View>

          </Pressable>

          {/* TODAY'S GOAL */}

          <View style={styles.practiceCard}>

            <View style={styles.practiceIconGoal}>
              <Ionicons
                name="star"
                size={25}
                color="#A85B00"
              />
            </View>

            <Text style={styles.practiceTitle}>
              Today's Goal
            </Text>

            <Text style={styles.practiceDescription}>
              Complete 1 activity
            </Text>

            <View style={styles.goalProgress}>
              <Text style={styles.goalProgressText}>
                0 / 1
              </Text>
            </View>

          </View>

        </View>

        {/* ═══════════════════════════════════════
            ENCOURAGEMENT
        ═══════════════════════════════════════ */}

        <View style={styles.encouragementCard}>

          <View style={styles.encouragementIcon}>
            <Text style={styles.encouragementEmoji}>
              🌸
            </Text>
          </View>

          <View style={styles.encouragementContent}>

            <Text style={styles.encouragementTitle}>
              You're doing great!
            </Text>

            <Text style={styles.encouragementText}>
              Every word you practise helps you grow.
            </Text>

          </View>

        </View>

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({

  /* ═══════════════════════════════════════
     PAGE
  ═══════════════════════════════════════ */

  container: {
    flex: 1,
    backgroundColor: '#F1FBFB',
  },

  content: {
    paddingTop: 10,
    paddingBottom: 42,
  },

  /* ═══════════════════════════════════════
     FIXED HEADER
  ═══════════════════════════════════════ */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: 12,
    backgroundColor: '#F1FBFB',
    zIndex: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: Spacing.md,
  },

  greeting: {
    fontFamily: Typography.fonts.bold,
    fontSize: 27,
    lineHeight: 34,
    color: '#173B5E',
  },

  subtitle: {
    marginTop: 4,
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    color: '#527087',
  },

  profileBubble: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9EF',
    borderWidth: 2,
    borderColor: '#8B7CF6',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  profileEmoji: {
    fontSize: 30,
  },

  /* ═══════════════════════════════════════
     LEARNING JOURNEY
  ═══════════════════════════════════════ */

  journeyCard: {
    marginTop: 8,
    padding: 18,
    borderRadius: 25,
    backgroundColor: '#8B7CF6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 7,
    borderBottomColor: '#6655D8',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 7,
  },

  journeyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  journeyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },

  journeyIcon: {
    width: 43,
    height: 43,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4C7',
  },

  journeyTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  journeyLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    lineHeight: 19,
    color: '#FFFFFF',
  },

  journeySubtitle: {
    marginTop: 2,
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#F2EFFF',
  },

  levelBadge: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    flexShrink: 0,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  levelText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },

  xpRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  xpValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: 17,
    color: '#FFFFFF',
  },

  xpGoal: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#F2EFFF',
  },

  progressTrack: {
    height: 10,
    marginTop: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.30)',
  },

  progressFill: {
    width: '60%',
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: '#FFD45C',
  },

  journeyFooter: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  streakText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  remainingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#F2EFFF',
  },

  /* ═══════════════════════════════════════
     SECTION HEADERS
  ═══════════════════════════════════════ */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: '#173B5E',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#527087',
  },

  /* ═══════════════════════════════════════
     SPEECH STUDIO
  ═══════════════════════════════════════ */

  speechCard: {
    padding: 18,
    borderRadius: 25,
    backgroundColor: '#FFFDFC',
    borderWidth: 2,
    borderColor: '#8B7CF6',
    borderBottomWidth: 5,
    borderBottomColor: '#C4BCFF',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 6,
  },

  speechTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  speechIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EDFF',
  },

  speechTag: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#FFF4C7',
  },

  speechTagText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 10,
    color: '#A85B00',
  },

  speechTitle: {
    marginTop: 15,
    fontFamily: Typography.fonts.bold,
    fontSize: 28,
    color: '#173B5E',
  },

  speechDescription: {
    marginTop: 5,
    maxWidth: 340,
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: '#527087',
  },

  speechActionRow: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingLeft: 16,
    paddingRight: 5,
    minHeight: 47,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#8B7CF6',
  },

  speechActionText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  speechArrow: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6655D8',
  },

  /* ═══════════════════════════════════════
     PRACTICE & PLAY
  ═══════════════════════════════════════ */

  practiceRow: {
    flexDirection: 'row',
    gap: 12,
  },

  practiceCard: {
    flex: 1,
    minHeight: 170,
    padding: 15,
    borderRadius: 22,
    backgroundColor: '#FFFDFC',
    borderWidth: 1.5,
    borderColor: '#DCE8EC',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },

  gamesCard: {
    borderTopWidth: 3,
    borderTopColor: '#FF8A7A',
  },

  practiceIconGames: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E0',
  },

  practiceIconGoal: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4C7',
  },

  practiceTitle: {
    marginTop: 15,
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#173B5E',
  },

  practiceDescription: {
    marginTop: 5,
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    lineHeight: 17,
    color: '#527087',
  },

  cardArrow: {
    position: 'absolute',
    right: 13,
    bottom: 13,
    width: 33,
    height: 33,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EDFF',
  },

  goalProgress: {
    position: 'absolute',
    right: 13,
    bottom: 13,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#FFF4C7',
  },

  goalProgressText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#A85B00',
  },

  /* ═══════════════════════════════════════
     ENCOURAGEMENT
  ═══════════════════════════════════════ */

  encouragementCard: {
    marginTop: 14,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F8F0',
    borderWidth: 1.5,
    borderColor: '#55CFA3',
  },

  encouragementIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9EF',
  },

  encouragementEmoji: {
    fontSize: 22,
  },

  encouragementContent: {
    flex: 1,
    marginLeft: 10,
  },

  encouragementTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#217A5D',
  },

  encouragementText: {
    marginTop: 2,
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    lineHeight: 17,
    color: '#347A66',
  },

  /* ═══════════════════════════════════════
     PRESS FEEDBACK
  ═══════════════════════════════════════ */

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});

export default HomeScreen;
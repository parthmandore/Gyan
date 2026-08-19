/**
 * Purpose: Parent Dashboard — child progress, learning activity and insights.
 * Module: Screens
 * Folder: FrontendN/src/screens
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
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#F1FBFB',
  white: '#FFFDFC',
  navy: '#173B5E',
  muted: '#527087',
  lightMuted: '#7C94A5',
  border: '#DCE8EC',

  lavender: '#8B7CF6',
  lavenderDark: '#6655D8',
  lavenderLight: '#F0EDFF',

  coral: '#FF8A7A',
  coralLight: '#FFE5E0',
  coralDark: '#D85F52',

  mint: '#55CFA3',
  mintLight: '#E5F8F0',
  mintDark: '#217A5D',

  yellow: '#FFD45C',
  yellowLight: '#FFF4C7',
  yellowDark: '#A85B00',

  blue: '#4D8DFF',
  blueLight: '#EAF1FF',

  green: '#2F9E67',
  greenLight: '#E8F8EF',
};

/* =========================================================
   DUMMY DATA
   This structure can later be replaced by backend/API data.
   ========================================================= */

const parentDashboardData = {
  child: {
    name: 'Aarav',
    initial: 'A',
    level: 1,
    language: 'English',
    streak: 3,
  },

  overview: {
    xp: 120,
    lessons: 4,
    learningTime: '28m',
  },

  weeklyProgress: {
    percentage: 75,
    completed: 6,
    total: 8,
  },

  activities: [
    {
      title: 'Speech Practice',
      description: 'Listening & pronunciation',
      value: '12 min',
      label: 'this week',
      icon: 'volume-high' as const,
      background: COLORS.lavenderLight,
      iconColor: COLORS.lavenderDark,
    },
    {
      title: 'Learning Games',
      description: 'Letters & matching',
      value: '8',
      label: 'completed',
      icon: 'game-controller' as const,
      background: COLORS.coralLight,
      iconColor: COLORS.coralDark,
    },
    {
      title: 'Letter Practice',
      description: 'Alphabet recognition',
      value: '86%',
      label: 'accuracy',
      icon: 'text' as const,
      background: COLORS.mintLight,
      iconColor: COLORS.mintDark,
    },
  ],

  skills: [
    {
      name: 'Alphabet',
      percentage: 80,
      color: COLORS.lavender,
    },
    {
      name: 'Vocabulary',
      percentage: 65,
      color: COLORS.coral,
    },
    {
      name: 'Pronunciation',
      percentage: 72,
      color: COLORS.mint,
    },
  ],

  recentActivity: [
    {
      title: 'Alphabet Matching',
      time: 'Today • 10 minutes ago',
      xp: '+20 XP',
    },
    {
      title: 'Speech Practice',
      time: 'Yesterday • 15 minutes',
      xp: '+15 XP',
    },
    {
      title: 'Letter Practice',
      time: 'Yesterday • 8 minutes',
      xp: '+10 XP',
    },
  ],
};

const ParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;

  const {
    child,
    overview,
    weeklyProgress,
    activities,
    skills,
    recentActivity,
  } = parentDashboardData;

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            paddingHorizontal: isSmallScreen ? 16 : 20,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.navy}
          />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Parent Dashboard
          </Text>

          <Text style={styles.headerSubtitle}>
            See how your child is learning
          </Text>
        </View>

        <View style={styles.profileButton}>
          <Ionicons
            name="people"
            size={22}
            color={COLORS.lavenderDark}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallScreen ? 16 : 20,
          },
        ]}
      >

        {/* WELCOME CARD */}

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeEmoji}>
              🌱
            </Text>
          </View>

          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeSmall}>
              GOOD MORNING! ☀️
            </Text>

            <Text style={styles.welcomeTitle}>
              Your child's learning journey
            </Text>

            <Text style={styles.welcomeDescription}>
              Keep encouraging them — every small step counts!
            </Text>
          </View>
        </View>

        {/* CHILD PROFILE */}

        <View style={styles.childCard}>
          <View style={styles.childAvatar}>
            <Text style={styles.childAvatarText}>
              {child.initial}
            </Text>
          </View>

          <View style={styles.childInfo}>
            <Text style={styles.childName}>
              {child.name}
            </Text>

            <Text style={styles.childDetails}>
              Level {child.level} • {child.language} learner
            </Text>

            <View style={styles.streakRow}>
              <Ionicons
                name="flame"
                size={16}
                color={COLORS.coralDark}
              />

              <Text style={styles.streakText}>
                {child.streak} day learning streak
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.viewButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`View ${child.name}'s profile`}
          >
            <Text style={styles.viewButtonText}>
              View
            </Text>
          </Pressable>
        </View>

        {/* LEARNING OVERVIEW */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Learning overview
          </Text>

          <Text style={styles.sectionSubtitle}>
            This week's progress
          </Text>
        </View>

        {/* STAT CARDS */}

        <View style={styles.statsRow}>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: COLORS.lavenderLight,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#E2DCFF',
                },
              ]}
            >
              <Ionicons
                name="star"
                size={21}
                color={COLORS.lavenderDark}
              />
            </View>

            <Text style={styles.statValue}>
              {overview.xp}
            </Text>

            <Text style={styles.statLabel}>
              XP earned
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: COLORS.mintLight,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#D3F2E5',
                },
              ]}
            >
              <Ionicons
                name="book"
                size={21}
                color={COLORS.mintDark}
              />
            </View>

            <Text style={styles.statValue}>
              {overview.lessons}
            </Text>

            <Text style={styles.statLabel}>
              Lessons
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: COLORS.yellowLight,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#FFEBA4',
                },
              ]}
            >
              <Ionicons
                name="time"
                size={21}
                color={COLORS.yellowDark}
              />
            </View>

            <Text style={styles.statValue}>
              {overview.learningTime}
            </Text>

            <Text style={styles.statLabel}>
              Learning
            </Text>
          </View>

        </View>

        {/* WEEKLY PROGRESS */}

        <View style={styles.progressCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>
                Weekly progress
              </Text>

              <Text style={styles.cardSubtitle}>
                Great work this week! 🌟
              </Text>
            </View>

            <Text style={styles.progressPercentage}>
              {weeklyProgress.percentage}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${weeklyProgress.percentage}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressBottomRow}>
            <Text style={styles.progressBottomText}>
              {weeklyProgress.completed} of{' '}
              {weeklyProgress.total} activities completed
            </Text>

            <Ionicons
              name="trending-up"
              size={17}
              color={COLORS.green}
            />
          </View>
        </View>

        {/* LEARNING ACTIVITY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Learning activity
          </Text>

          <Text style={styles.sectionSubtitle}>
            What your child has been practising
          </Text>
        </View>

        <View style={styles.activityCard}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.title}>

              <View style={styles.activityRow}>

                <View
                  style={[
                    styles.activityIcon,
                    {
                      backgroundColor: activity.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={activity.icon}
                    size={21}
                    color={activity.iconColor}
                  />
                </View>

                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>
                    {activity.title}
                  </Text>

                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                </View>

                <View style={styles.activityValue}>
                  <Text style={styles.activityValueNumber}>
                    {activity.value}
                  </Text>

                  <Text style={styles.activityValueLabel}>
                    {activity.label}
                  </Text>
                </View>

              </View>

              {index < activities.length - 1 && (
                <View style={styles.divider} />
              )}

            </React.Fragment>
          ))}
        </View>

        {/* SKILLS DEVELOPMENT */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Skills development
          </Text>

          <Text style={styles.sectionSubtitle}>
            Current learning strengths
          </Text>
        </View>

        <View style={styles.skillsCard}>
          {skills.map((skill) => (
            <View
              key={skill.name}
              style={styles.skillRow}
            >
              <View style={styles.skillLabelRow}>

                <View
                  style={[
                    styles.skillDot,
                    {
                      backgroundColor: skill.color,
                    },
                  ]}
                />

                <Text style={styles.skillName}>
                  {skill.name}
                </Text>

                <Text style={styles.skillPercentage}>
                  {skill.percentage}%
                </Text>

              </View>

              <View style={styles.skillTrack}>
                <View
                  style={[
                    styles.skillFill,
                    {
                      width: `${skill.percentage}%`,
                      backgroundColor: skill.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* RECENT ACTIVITY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent activity
          </Text>

          <Text style={styles.sectionSubtitle}>
            Latest learning sessions
          </Text>
        </View>

        <View style={styles.recentCard}>
          {recentActivity.map((activity, index) => (
            <React.Fragment key={`${activity.title}-${index}`}>

              <View style={styles.recentRow}>

                <View style={styles.completedIcon}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={COLORS.green}
                  />
                </View>

                <View style={styles.recentText}>
                  <Text style={styles.recentTitle}>
                    {activity.title}
                  </Text>

                  <Text style={styles.recentTime}>
                    {activity.time}
                  </Text>
                </View>

                <Text style={styles.recentXP}>
                  {activity.xp}
                </Text>

              </View>

              {index < recentActivity.length - 1 && (
                <View style={styles.divider} />
              )}

            </React.Fragment>
          ))}
        </View>

        {/* ENCOURAGEMENT */}

        <View style={styles.encouragementCard}>

          <View style={styles.encouragementIcon}>
            <Text style={styles.encouragementEmoji}>
              💚
            </Text>
          </View>

          <View style={styles.encouragementText}>
            <Text style={styles.encouragementTitle}>
              Keep encouraging!
            </Text>

            <Text style={styles.encouragementDescription}>
              A little encouragement from you can make learning
              even more enjoyable.
            </Text>
          </View>

        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.muted,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lavenderLight,
    borderWidth: 1,
    borderColor: '#C9C1FF',
  },

  content: {
    paddingTop: 18,
    paddingBottom: 40,
  },

  welcomeCard: {
    padding: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lavender,
    shadowColor: '#6655D8',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },

  welcomeIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  welcomeEmoji: {
    fontSize: 30,
  },

  welcomeTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  welcomeSmall: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#F0EDFF',
  },

  welcomeTitle: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: COLORS.white,
  },

  welcomeDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#F0EDFF',
  },

  childCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  childAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellowLight,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },

  childAvatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.yellowDark,
  },

  childInfo: {
    flex: 1,
    marginLeft: 13,
  },

  childName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
  },

  childDetails: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.muted,
  },

  streakRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  streakText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.coralDark,
  },

  viewButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COLORS.lavenderLight,
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.lavenderDark,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navy,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.muted,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 126,
    padding: 13,
    borderRadius: 20,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.navy,
  },

  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.muted,
  },

  progressCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lavender,
    shadowColor: '#6655D8',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.muted,
  },

  progressPercentage: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.lavenderDark,
  },

  progressTrack: {
    height: 11,
    marginTop: 17,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E0FF',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.lavender,
  },

  progressBottomRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressBottomText: {
    fontSize: 12,
    color: COLORS.muted,
  },

  activityCard: {
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  activityRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityText: {
    flex: 1,
    marginLeft: 12,
  },

  activityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.navy,
  },

  activityDescription: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.muted,
  },

  activityValue: {
    alignItems: 'flex-end',
  },

  activityValueNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.navy,
  },

  activityValueLabel: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.lightMuted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  skillsCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  skillRow: {
    marginBottom: 17,
  },

  skillRowLast: {
    marginBottom: 0,
  },

  skillLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  skillDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  skillName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },

  skillPercentage: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
  },

  skillTrack: {
    height: 8,
    marginTop: 8,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#EEF2F4',
  },

  skillFill: {
    height: '100%',
    borderRadius: 5,
  },

  recentCard: {
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  recentRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
  },

  completedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.greenLight,
  },

  recentText: {
    flex: 1,
    marginLeft: 11,
  },

  recentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.navy,
  },

  recentTime: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.muted,
  },

  recentXP: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.green,
  },

  encouragementCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mintLight,
    borderWidth: 1.5,
    borderColor: COLORS.mint,
  },

  encouragementIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  encouragementEmoji: {
    fontSize: 22,
  },

  encouragementText: {
    flex: 1,
    marginLeft: 11,
  },

  encouragementTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.mintDark,
  },

  encouragementDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
  },

  bottomSpace: {
    height: 20,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});

export default ParentDashboardScreen;
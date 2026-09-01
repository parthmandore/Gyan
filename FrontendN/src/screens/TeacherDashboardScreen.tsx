/**
 * Purpose: Teacher Dashboard — classroom overview, student progress and insights.
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

  redLight: '#FFE8E8',
  red: '#D9534F',
};

/* =========================================================
   DUMMY DATA
   This structure can later be replaced by backend/API data.
   ========================================================= */

const teacherDashboardData = {
  classroom: {
    name: 'Sunshine Class',
    level: 'Early learners',
    language: 'English',
    students: 24,
    activeToday: 18,
    completedToday: 12,
    status: 'Class is active today',
  },

  classProgress: {
    percentage: 82,
    studentsOnTrack: 20,
    totalStudents: 24,
  },

  activities: [
    {
      title: 'Speech Practice',
      description: 'Listening & pronunciation',
      students: 18,
      icon: 'volume-high' as const,
      background: COLORS.lavenderLight,
      iconColor: COLORS.lavenderDark,
    },
    {
      title: 'Letter Practice',
      description: 'Alphabet recognition',
      students: 21,
      icon: 'text' as const,
      background: COLORS.coralLight,
      iconColor: COLORS.coralDark,
    },
    {
      title: 'Learning Games',
      description: 'Matching & recognition',
      students: 16,
      icon: 'game-controller' as const,
      background: COLORS.mintLight,
      iconColor: COLORS.mintDark,
    },
  ],

  students: [
    {
      name: 'Aarav',
      initial: 'A',
      percentage: 80,
      background: COLORS.lavenderLight,
      textColor: COLORS.lavenderDark,
      progressColor: COLORS.lavender,
    },
    {
      name: 'Anaya',
      initial: 'A',
      percentage: 90,
      background: COLORS.mintLight,
      textColor: COLORS.mintDark,
      progressColor: COLORS.mint,
    },
    {
      name: 'Riya',
      initial: 'R',
      percentage: 65,
      background: COLORS.coralLight,
      textColor: COLORS.coralDark,
      progressColor: COLORS.coral,
    },
    {
      name: 'Vihaan',
      initial: 'V',
      percentage: 74,
      background: COLORS.yellowLight,
      textColor: COLORS.yellowDark,
      progressColor: COLORS.yellow,
    },
  ],

  attention: {
    count: 3,
    message:
      "Students haven't practised today",
    description:
      'Consider giving them a gentle reminder during the next learning session.',
  },

  recentActivity: [
    {
      title: 'Anaya completed a lesson',
      time: '5 minutes ago',
      badge: '+20 XP',
      icon: 'trophy' as const,
      color: COLORS.yellowDark,
    },
    {
      title: '8 students finished a game',
      time: '18 minutes ago',
      badge: 'Great!',
      icon: 'game-controller' as const,
      color: COLORS.lavenderDark,
    },
    {
      title: 'Speech practice session completed',
      time: '32 minutes ago',
      badge: '12 min',
      icon: 'volume-high' as const,
      color: COLORS.mintDark,
    },
  ],

  teachingTip:
    'Encourage students to practise pronunciation for a few minutes every day.',
};

const TeacherDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;

  const {
    classroom,
    classProgress,
    activities,
    students,
    attention,
    recentActivity,
    teachingTip,
  } = teacherDashboardData;

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
            Teacher Dashboard
          </Text>

          <Text style={styles.headerSubtitle}>
            Your classroom at a glance
          </Text>
        </View>

        <View style={styles.teacherIcon}>
          <Ionicons
            name="school"
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
              👩‍🏫
            </Text>
          </View>

          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeSmall}>
              GOOD MORNING! ☀️
            </Text>

            <Text style={styles.welcomeTitle}>
              Your classroom is growing!
            </Text>

            <Text style={styles.welcomeDescription}>
              Here's how your students are doing today.
            </Text>
          </View>
        </View>

        {/* CLASS PROFILE */}

        <View style={styles.classCard}>

          <View style={styles.classIcon}>
            <Ionicons
              name="people"
              size={27}
              color={COLORS.lavenderDark}
            />
          </View>

          <View style={styles.classInfo}>
            <Text style={styles.className}>
              {classroom.name}
            </Text>

            <Text style={styles.classDetails}>
              {classroom.level} • {classroom.language}
            </Text>

            <View style={styles.classStatusRow}>
              <View style={styles.activeDot} />

              <Text style={styles.classStatusText}>
                {classroom.status}
              </Text>
            </View>
          </View>

          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>
              {classroom.students}
            </Text>

            <Text style={styles.classBadgeLabel}>
              students
            </Text>
          </View>

        </View>

        {/* CLASSROOM OVERVIEW */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Classroom overview
          </Text>

          <Text style={styles.sectionSubtitle}>
            Today's learning snapshot
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
                name="people"
                size={21}
                color={COLORS.lavenderDark}
              />
            </View>

            <Text style={styles.statValue}>
              {classroom.students}
            </Text>

            <Text style={styles.statLabel}>
              Students
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
                name="pulse"
                size={21}
                color={COLORS.mintDark}
              />
            </View>

            <Text style={styles.statValue}>
              {classroom.activeToday}
            </Text>

            <Text style={styles.statLabel}>
              Active today
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
                name="trophy"
                size={21}
                color={COLORS.yellowDark}
              />
            </View>

            <Text style={styles.statValue}>
              {classroom.completedToday}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>

        </View>

        {/* CLASS PROGRESS */}

        <View style={styles.progressCard}>

          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>
                Class progress
              </Text>

              <Text style={styles.cardSubtitle}>
                Average learning completion
              </Text>
            </View>

            <Text style={styles.progressPercentage}>
              {classProgress.percentage}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${classProgress.percentage}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressBottomRow}>
            <Text style={styles.progressBottomText}>
              {classProgress.studentsOnTrack} of{' '}
              {classProgress.totalStudents} students are on track
            </Text>

            <Ionicons
              name="trending-up"
              size={17}
              color={COLORS.green}
            />
          </View>

        </View>

        {/* TODAY'S ACTIVITY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Today's activity
          </Text>

          <Text style={styles.sectionSubtitle}>
            What students are practising
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
                    {activity.students}
                  </Text>

                  <Text style={styles.activityValueLabel}>
                    students
                  </Text>
                </View>

              </View>

              {index < activities.length - 1 && (
                <View style={styles.divider} />
              )}

            </React.Fragment>
          ))}

        </View>

        {/* STUDENT PROGRESS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Student progress
          </Text>

          <Text style={styles.sectionSubtitle}>
            Quick view of your learners
          </Text>
        </View>

        <View style={styles.studentsCard}>

          {students.map((student, index) => (
            <React.Fragment key={student.name}>

              <View style={styles.studentRow}>

                <View
                  style={[
                    styles.studentAvatar,
                    {
                      backgroundColor: student.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.studentAvatarText,
                      {
                        color: student.textColor,
                      },
                    ]}
                  >
                    {student.initial}
                  </Text>
                </View>

                <View style={styles.studentInfo}>

                  <Text style={styles.studentName}>
                    {student.name}
                  </Text>

                  <View style={styles.studentProgressTrack}>
                    <View
                      style={[
                        styles.studentProgressFill,
                        {
                          width: `${student.percentage}%`,
                          backgroundColor: student.progressColor,
                        },
                      ]}
                    />
                  </View>

                </View>

                <Text style={styles.studentPercentage}>
                  {student.percentage}%
                </Text>

              </View>

              {index < students.length - 1 && (
                <View style={styles.divider} />
              )}

            </React.Fragment>
          ))}

        </View>

        <Pressable
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="View all students"
        >
          <Text style={styles.viewAllText}>
            View All Students
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color={COLORS.lavenderDark}
          />
        </Pressable>

        {/* NEEDS ATTENTION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Needs attention
          </Text>

          <Text style={styles.sectionSubtitle}>
            Students who may need extra support
          </Text>
        </View>

        <View style={styles.attentionCard}>

          <View style={styles.attentionIcon}>
            <Ionicons
              name="alert-circle"
              size={22}
              color={COLORS.red}
            />
          </View>

          <View style={styles.attentionText}>

            <Text style={styles.attentionTitle}>
              {attention.count} {attention.message}
            </Text>

            <Text style={styles.attentionDescription}>
              {attention.description}
            </Text>

          </View>

        </View>

        {/* RECENT CLASS ACTIVITY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent class activity
          </Text>

          <Text style={styles.sectionSubtitle}>
            Latest classroom achievements
          </Text>
        </View>

        <View style={styles.recentCard}>

          {recentActivity.map((activity, index) => (
            <React.Fragment
              key={`${activity.title}-${index}`}
            >

              <View style={styles.recentRow}>

                <View style={styles.completedIcon}>
                  <Ionicons
                    name={activity.icon}
                    size={16}
                    color={activity.color}
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

                <Text style={styles.recentBadge}>
                  {activity.badge}
                </Text>

              </View>

              {index < recentActivity.length - 1 && (
                <View style={styles.divider} />
              )}

            </React.Fragment>
          ))}

        </View>

        {/* TEACHER TIP */}

        <View style={styles.tipCard}>

          <View style={styles.tipIcon}>
            <Text style={styles.tipEmoji}>
              💡
            </Text>
          </View>

          <View style={styles.tipText}>

            <Text style={styles.tipTitle}>
              Teaching tip
            </Text>

            <Text style={styles.tipDescription}>
              {teachingTip}
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

  teacherIcon: {
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

  classCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  classIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lavenderLight,
  },

  classInfo: {
    flex: 1,
    marginLeft: 13,
  },

  className: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
  },

  classDetails: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.muted,
  },

  classStatusRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },

  classStatusText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
  },

  classBadge: {
    minWidth: 56,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.yellowLight,
  },

  classBadgeText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.yellowDark,
  },

  classBadgeLabel: {
    marginTop: 1,
    fontSize: 9,
    color: COLORS.muted,
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

  studentsCard: {
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  studentRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentAvatarText: {
    fontSize: 17,
    fontWeight: '800',
  },

  studentInfo: {
    flex: 1,
    marginLeft: 11,
  },

  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.navy,
  },

  studentProgressTrack: {
    height: 7,
    marginTop: 8,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#EEF2F4',
  },

  studentProgressFill: {
    height: '100%',
    borderRadius: 5,
  },

  studentPercentage: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
  },

  viewAllButton: {
    minHeight: 48,
    marginTop: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.lavenderLight,
  },

  viewAllText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.lavenderDark,
  },

  attentionCard: {
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.redLight,
    borderWidth: 1.5,
    borderColor: '#F5B5B2',
  },

  attentionIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  attentionText: {
    flex: 1,
    marginLeft: 11,
  },

  attentionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.red,
  },

  attentionDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
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
    backgroundColor: COLORS.lavenderLight,
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

  recentBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.lavenderDark,
  },

  tipCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellowLight,
    borderWidth: 1.5,
    borderColor: COLORS.yellow,
  },

  tipIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  tipEmoji: {
    fontSize: 22,
  },

  tipText: {
    flex: 1,
    marginLeft: 11,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.yellowDark,
  },

  tipDescription: {
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

export default TeacherDashboardScreen;
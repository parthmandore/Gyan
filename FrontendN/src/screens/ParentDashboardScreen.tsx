import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../types';
import parentService, {
  type ParentChild,
  type ParentDashboardResponse,
  type ParentLearningAnalytics,
} from '../services/parentService';

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

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

  green: '#2F9E67',
  greenLight: '#E8F8EF',
};

const emptyAnalytics: ParentLearningAnalytics = {
  student: {
    id: 0,
    name: 'Student',
    age: 0,
    level: 1,
    streak: 0,
  },

  overallAccuracy: 0,
  totalGamesPlayed: 0,
  totalGamesCompleted: 0,
  totalXP: 0,
  currentStreak: 0,
  learningTimeMinutes: 0,

  gamePerformance: [],
  skillPerformance: [],
  strengths: [],
  weaknesses: [],
  recentActivity: [],
};

const fallbackChildren: ParentChild[] = [
  {
    id: 1,
    name: 'Aarav',
    age: 6,
    grade: 'Grade 1',
    language: 'English',
    level: 1,
    streak: 3,
    xpTotal: 120,
  },
];

const fallbackAnalytics: ParentLearningAnalytics = {
  student: {
    id: 1,
    name: 'Aarav',
    age: 6,
    level: 1,
    language: 'English',
    streak: 3,
  },

  overallAccuracy: 86,
  totalGamesPlayed: 8,
  totalGamesCompleted: 6,
  totalXP: 120,
  currentStreak: 3,
  learningTimeMinutes: 28,

  gamePerformance: [
    {
      gameId: 'speech_letters',
      gameName: 'Speech Practice',
      attempts: 3,
      completed: 3,
      accuracy: 86,
      averageScore: 86,
      bestScore: 92,
    },
    {
      gameId: 'alphabet_matching',
      gameName: 'Alphabet Matching',
      attempts: 3,
      completed: 2,
      accuracy: 80,
      averageScore: 80,
      bestScore: 90,
    },
    {
      gameId: 'letter_practice',
      gameName: 'Letter Practice',
      attempts: 2,
      completed: 1,
      accuracy: 72,
      averageScore: 72,
      bestScore: 80,
    },
  ],

  skillPerformance: [
    {
      skillId: 'alphabet',
      skillName: 'Alphabet',
      accuracy: 80,
      attempts: 3,
    },
    {
      skillId: 'vocabulary',
      skillName: 'Vocabulary',
      accuracy: 65,
      attempts: 2,
    },
    {
      skillId: 'pronunciation',
      skillName: 'Pronunciation',
      accuracy: 72,
      attempts: 3,
    },
  ],

  strengths: [
    {
      skillId: 'alphabet',
      skillName: 'Alphabet',
      accuracy: 80,
      attempts: 3,
    },
  ],

  weaknesses: [
    {
      skillId: 'vocabulary',
      skillName: 'Vocabulary',
      accuracy: 65,
      attempts: 2,
    },
  ],

  recentActivity: [
    {
      id: 1,
      gameId: 'alphabet_matching',
      gameName: 'Alphabet Matching',
      score: 90,
      accuracy: 90,
      completedAt: 'Today',
    },
    {
      id: 2,
      gameId: 'speech_letters',
      gameName: 'Speech Practice',
      score: 86,
      accuracy: 86,
      completedAt: 'Yesterday',
    },
    {
      id: 3,
      gameId: 'letter_practice',
      gameName: 'Letter Practice',
      score: 72,
      accuracy: 72,
      completedAt: 'Yesterday',
    },
  ],
};

const fallbackDashboard: ParentDashboardResponse = {
  children: fallbackChildren,
  selectedChild: fallbackAnalytics,
  summary: {
    overallAccuracy: 86,
    totalGamesPlayed: 8,
    totalGamesCompleted: 6,
    totalXP: 120,
    currentStreak: 3,
    learningTimeMinutes: 28,
  },
  recentActivity:
    fallbackAnalytics.recentActivity,
};

const ParentDashboardScreen: React.FC = () => {
  const navigation =
    useNavigation<NavigationProp>();

  const { width } =
    useWindowDimensions();

  const { t } =
    useTranslation();

  const insets =
    useSafeAreaInsets();

  const isSmallScreen =
    width < 380;

  const [
    dashboard,
    setDashboard,
  ] =
    useState<ParentDashboardResponse>(
      fallbackDashboard,
    );

  const [
    analytics,
    setAnalytics,
  ] =
    useState<ParentLearningAnalytics>(
      fallbackAnalytics,
    );

  const [
    children,
    setChildren,
  ] =
    useState<ParentChild[]>(
      fallbackChildren,
    );

  const [
    selectedChildId,
    setSelectedChildId,
  ] =
    useState<number | string | null>(
      fallbackChildren[0].id,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    usingFallback,
    setUsingFallback,
  ] = useState(true);

  const loadDashboard =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const data =
            await parentService.getDashboard();

          setDashboard(data);

          if (
            data.children.length > 0
          ) {
            setChildren(
              data.children,
            );

            const currentChild =
              data.children.find(
                child =>
                  String(
                    child.id,
                  ) ===
                  String(
                    selectedChildId,
                  ),
              ) ??
              data.children[0];

            setSelectedChildId(
              currentChild.id,
            );
          } else {
            setChildren([]);
            setSelectedChildId(null);
          }

          if (
            data.selectedChild
          ) {
            setAnalytics(
              data.selectedChild,
            );
          } else {
            setAnalytics(
              emptyAnalytics,
            );
          }

          setUsingFallback(false);
        } catch (error) {
          console.log(
            'Parent dashboard API unavailable. Using fallback data.',
            error,
          );

          setDashboard(
            fallbackDashboard,
          );

          setAnalytics(
            fallbackAnalytics,
          );

          setChildren(
            fallbackChildren,
          );

          setSelectedChildId(
            fallbackChildren[0].id,
          );

          setUsingFallback(true);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [selectedChildId],
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSelectChild =
    async (
      child: ParentChild,
    ) => {
      setSelectedChildId(
        child.id,
      );

      if (
        String(child.id) ===
        String(
          analytics.student.id,
        )
      ) {
        return;
      }

      try {
        setLoading(true);

        const childAnalytics =
          await parentService.getChildAnalytics(
            child.id,
          );

        setAnalytics(
          childAnalytics,
        );

        setUsingFallback(false);
      } catch (error) {
        console.log(
          'Unable to load selected child.',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

  const {
    student,
    overallAccuracy,
    totalGamesPlayed,
    totalGamesCompleted,
    totalXP,
    currentStreak,
    learningTimeMinutes,
    gamePerformance,
    skillPerformance,
    weaknesses,
    recentActivity,
  } = analytics;

  const learningTime =
    learningTimeMinutes >= 60
      ? `${Math.floor(
          learningTimeMinutes / 60,
        )}h ${
          learningTimeMinutes % 60
        }m`
      : `${learningTimeMinutes}m`;

  const weeklyProgress =
    totalGamesPlayed > 0
      ? Math.min(
          100,
          Math.round(
            (totalGamesCompleted /
              totalGamesPlayed) *
              100,
          ),
        )
      : 0;

  const displayedSkills =
    skillPerformance.length > 0
      ? skillPerformance.slice(
          0,
          3,
        )
      : [];

  const childLanguage =
    children.find(
      child =>
        String(child.id) ===
        String(
          selectedChildId,
        ),
    )?.language ??
    student.language ??
    'English';

  const childLevel =
    children.find(
      child =>
        String(child.id) ===
        String(
          selectedChildId,
        ),
    )?.level ??
    student.level ??
    1;

  const handleBack =
    () => {
      navigation.replace(
        'RoleSelection',
      );
    };

  return (
    <View
      style={styles.container}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal:
              isSmallScreen
                ? 16
                : 20,
            paddingTop:
              insets.top,
            minHeight:
              82 +
              insets.top,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.pressed,
          ]}
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.navy}
          />
        </Pressable>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={
              styles.headerTitle
            }
            numberOfLines={1}
          >
            {t(
              'parent.title',
              'Parent Dashboard',
            )}
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
            numberOfLines={1}
          >
            {t(
              'parent.subtitle',
              'See how your child is learning',
            )}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.profileButton,
            pressed &&
              styles.pressed,
          ]}
          onPress={() =>
            loadDashboard(true)
          }
        >
          <Ionicons
            name="refresh-outline"
            size={22}
            color={
              COLORS.lavenderDark
            }
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadDashboard(
                true,
              )
            }
            tintColor={
              COLORS.lavender
            }
          />
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal:
              isSmallScreen
                ? 16
                : 20,
            paddingBottom:
              40 +
              insets.bottom,
          },
        ]}
      >
        {loading && (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="small"
              color={
                COLORS.lavenderDark
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading learning data...
            </Text>
          </View>
        )}

        {usingFallback && (
          <View
            style={
              styles.demoBanner
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={
                COLORS.yellowDark
              }
            />

            <Text
              style={
                styles.demoBannerText
              }
            >
              Showing demo data until
              the parent dashboard API
              returns live data.
            </Text>
          </View>
        )}

        {/* WELCOME */}
        <View
          style={
            styles.welcomeCard
          }
        >
          <View
            style={
              styles.welcomeIcon
            }
          >
            <Text
              style={
                styles.welcomeEmoji
              }
            >
              🌱
            </Text>
          </View>

          <View
            style={
              styles.welcomeTextContainer
            }
          >
            <Text
              style={
                styles.welcomeSmall
              }
            >
              {t(
                'parent.goodMorning',
                'GOOD MORNING! ☀️',
              )}
            </Text>

            <Text
              style={
                styles.welcomeTitle
              }
            >
              {t(
                'parent.learningJourney',
                "Your child's learning journey",
              )}
            </Text>

            <Text
              style={
                styles.welcomeDescription
              }
            >
              {t(
                'parent.encouragement',
                'Keep encouraging them — every small step counts!',
              )}
            </Text>
          </View>
        </View>

        {/* CHILD SELECTOR */}
        {children.length > 1 && (
          <>
            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Children
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Select a child
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.childrenSelector
              }
            >
              {children.map(
                child => {
                  const selected =
                    String(
                      child.id,
                    ) ===
                    String(
                      selectedChildId,
                    );

                  return (
                    <Pressable
                      key={String(
                        child.id,
                      )}
                      style={[
                        styles.childSelectorCard,
                        selected &&
                          styles.childSelectorCardSelected,
                      ]}
                      onPress={() =>
                        handleSelectChild(
                          child,
                        )
                      }
                    >
                      <View
                        style={[
                          styles.selectorAvatar,
                          selected &&
                            styles.selectorAvatarSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.selectorAvatarText,
                            selected &&
                              styles.selectorAvatarTextSelected,
                          ]}
                        >
                          {child.name
                            .charAt(
                              0,
                            )
                            .toUpperCase()}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.selectorName,
                          selected &&
                            styles.selectorNameSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {child.name}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={
                            COLORS.white
                          }
                        />
                      )}
                    </Pressable>
                  );
                },
              )}
            </ScrollView>
          </>
        )}

        {/* CHILD CARD */}
        <View
          style={styles.childCard}
        >
          <View
            style={styles.childAvatar}
          >
            <Text
              style={
                styles.childAvatarText
              }
            >
              {student.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View
            style={styles.childInfo}
          >
            <Text
              style={
                styles.childName
              }
            >
              {student.name}
            </Text>

            <Text
              style={
                styles.childDetails
              }
            >
              {t(
                'parent.level',
                'Level',
              )}{' '}
              {childLevel} •{' '}
              {childLanguage}
            </Text>

            <View
              style={
                styles.streakRow
              }
            >
              <Ionicons
                name="flame"
                size={16}
                color={
                  COLORS.coralDark
                }
              />

              <Text
                style={
                  styles.streakText
                }
              >
                {currentStreak}{' '}
                {t(
                  'parent.dayLearningStreak',
                  'day learning streak',
                )}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.viewButton
            }
          >
            <Text
              style={
                styles.viewButtonText
              }
            >
              {overallAccuracy}%
            </Text>
          </View>
        </View>

        {/* OVERVIEW */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'parent.learningOverview',
              'Learning overview',
            )}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {t(
              'parent.thisWeekProgress',
              "This week's progress",
            )}
          </Text>
        </View>

        <View
          style={styles.statsRow}
        >
          <View
            style={[
              styles.statCard,
              {
                backgroundColor:
                  COLORS.lavenderLight,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    '#E2DCFF',
                },
              ]}
            >
              <Ionicons
                name="star"
                size={21}
                color={
                  COLORS.lavenderDark
                }
              />
            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {totalXP}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              {t(
                'parent.xpEarned',
                'XP earned',
              )}
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor:
                  COLORS.mintLight,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    '#D3F2E5',
                },
              ]}
            >
              <Ionicons
                name="book"
                size={21}
                color={
                  COLORS.mintDark
                }
              />
            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {
                totalGamesCompleted
              }
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              {t(
                'parent.lessons',
                'Lessons',
              )}
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor:
                  COLORS.yellowLight,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    '#FFEBA4',
                },
              ]}
            >
              <Ionicons
                name="time"
                size={21}
                color={
                  COLORS.yellowDark
                }
              />
            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {learningTime}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              {t(
                'parent.learning',
                'Learning',
              )}
            </Text>
          </View>
        </View>

        {/* WEEKLY PROGRESS */}
        <View
          style={
            styles.progressCard
          }
        >
          <View
            style={
              styles.cardHeaderRow
            }
          >
            <View
              style={
                styles.cardHeaderText
              }
            >
              <Text
                style={
                  styles.cardTitle
                }
              >
                {t(
                  'parent.weeklyProgress',
                  'Weekly progress',
                )}
              </Text>

              <Text
                style={
                  styles.cardSubtitle
                }
              >
                {t(
                  'parent.greatWork',
                  'Great work this week! 🌟',
                )}
              </Text>
            </View>

            <Text
              style={
                styles.progressPercentage
              }
            >
              {weeklyProgress}%
            </Text>
          </View>

          <View
            style={
              styles.progressTrack
            }
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${weeklyProgress}%`,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.progressBottomRow
            }
          >
            <Text
              style={
                styles.progressBottomText
              }
            >
              {
                totalGamesCompleted
              }{' '}
              {t(
                'parent.of',
                'of',
              )}{' '}
              {totalGamesPlayed}{' '}
              activities completed
            </Text>

            <Ionicons
              name="trending-up"
              size={17}
              color={
                COLORS.green
              }
            />
          </View>
        </View>

        {/* ACTIVITY */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'parent.learningActivity',
              'Learning activity',
            )}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {t(
              'parent.practising',
              'What your child has been practising',
            )}
          </Text>
        </View>

        <View
          style={
            styles.activityCard
          }
        >
          {gamePerformance.length ===
          0 ? (
            <Text
              style={
                styles.emptyText
              }
            >
              No learning activity
              recorded yet.
            </Text>
          ) : (
            gamePerformance
              .slice(0, 3)
              .map(
                (
                  game,
                  index,
                ) => (
                  <React.Fragment
                    key={
                      game.gameId
                    }
                  >
                    <View
                      style={
                        styles.activityRow
                      }
                    >
                      <View
                        style={[
                          styles.activityIcon,
                          {
                            backgroundColor:
                              index ===
                              0
                                ? COLORS.lavenderLight
                                : index ===
                                1
                                ? COLORS.coralLight
                                : COLORS.mintLight,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            index ===
                            0
                              ? 'volume-high'
                              : index ===
                                1
                              ? 'game-controller'
                              : 'text'
                          }
                          size={
                            21
                          }
                          color={
                            index ===
                            0
                              ? COLORS.lavenderDark
                              : index ===
                                1
                              ? COLORS.coralDark
                              : COLORS.mintDark
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.activityText
                        }
                      >
                        <Text
                          style={
                            styles.activityTitle
                          }
                        >
                          {
                            game.gameName
                          }
                        </Text>

                        <Text
                          style={
                            styles.activityDescription
                          }
                        >
                          {
                            game.attempts
                          }{' '}
                          attempts ·{' '}
                          {
                            game.completed
                          }{' '}
                          completed
                        </Text>
                      </View>

                      <View
                        style={
                          styles.activityValue
                        }
                      >
                        <Text
                          style={
                            styles.activityValueNumber
                          }
                        >
                          {
                            game.accuracy
                          }%
                        </Text>

                        <Text
                          style={
                            styles.activityValueLabel
                          }
                        >
                          accuracy
                        </Text>
                      </View>
                    </View>

                    {index <
                      Math.min(
                        gamePerformance.length,
                        3,
                      ) -
                        1 && (
                      <View
                        style={
                          styles.divider
                        }
                      />
                    )}
                  </React.Fragment>
                ),
              )
          )}
        </View>

        {/* SKILLS */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'parent.skillsDevelopment',
              'Skills development',
            )}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {t(
              'parent.currentStrengths',
              'Current learning strengths',
            )}
          </Text>
        </View>

        <View
          style={styles.skillsCard}
        >
          {displayedSkills.length ===
          0 ? (
            <Text
              style={
                styles.emptyText
              }
            >
              No skill data available
              yet.
            </Text>
          ) : (
            displayedSkills.map(
              (
                skill,
                index,
              ) => {
                const skillColors =
                  [
                    COLORS.lavender,
                    COLORS.coral,
                    COLORS.mint,
                  ];

                const skillColor =
                  skillColors[
                    index %
                      skillColors.length
                  ];

                return (
                  <View
                    key={
                      skill.skillId
                    }
                    style={[
                      styles.skillRow,
                      {
                        marginBottom:
                          index ===
                          displayedSkills.length -
                            1
                            ? 0
                            : 17,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.skillLabelRow
                      }
                    >
                      <View
                        style={[
                          styles.skillDot,
                          {
                            backgroundColor:
                              skillColor,
                          },
                        ]}
                      />

                      <Text
                        style={
                          styles.skillName
                        }
                      >
                        {
                          skill.skillName
                        }
                      </Text>

                      <Text
                        style={
                          styles.skillPercentage
                        }
                      >
                        {
                          skill.accuracy
                        }%
                      </Text>
                    </View>

                    <View
                      style={
                        styles.skillTrack
                      }
                    >
                      <View
                        style={[
                          styles.skillFill,
                          {
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                skill.accuracy,
                              ),
                            )}%`,
                            backgroundColor:
                              skillColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              },
            )
          )}
        </View>

        {/* WEAKNESSES */}
        {weaknesses.length >
          0 && (
          <View
            style={
              styles.practiceCard
            }
          >
            <View
              style={
                styles.practiceIcon
              }
            >
              <Ionicons
                name="book-outline"
                size={21}
                color={
                  COLORS.coralDark
                }
              />
            </View>

            <View
              style={
                styles.practiceText
              }
            >
              <Text
                style={
                  styles.practiceTitle
                }
              >
                Areas for practice
              </Text>

              <Text
                style={
                  styles.practiceDescription
                }
              >
                {weaknesses
                  .slice(0, 2)
                  .map(
                    skill =>
                      `${skill.skillName} (${skill.accuracy}%)`,
                  )
                  .join(' · ')}
              </Text>
            </View>
          </View>
        )}

        {/* RECENT ACTIVITY */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t(
              'parent.recentActivity',
              'Recent activity',
            )}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {t(
              'parent.latestSessions',
              'Latest learning sessions',
            )}
          </Text>
        </View>

        <View
          style={
            styles.recentCard
          }
        >
          {recentActivity.length ===
          0 ? (
            <Text
              style={
                styles.emptyText
              }
            >
              No recent activity yet.
            </Text>
          ) : (
            recentActivity
              .slice(0, 5)
              .map(
                (
                  activity,
                  index,
                ) => (
                  <React.Fragment
                    key={`${activity.id}-${index}`}
                  >
                    <View
                      style={
                        styles.recentRow
                      }
                    >
                      <View
                        style={
                          styles.completedIcon
                        }
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={
                            COLORS.green
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.recentText
                        }
                      >
                        <Text
                          style={
                            styles.recentTitle
                          }
                        >
                          {
                            activity.gameName
                          }
                        </Text>

                        <Text
                          style={
                            styles.recentTime
                          }
                        >
                          {
                            activity.completedAt
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.recentXP
                        }
                      >
                        +
                        {Math.round(
                          activity.score ??
                            activity.accuracy ??
                            0,
                        )}
                        %
                      </Text>
                    </View>

                    {index <
                      Math.min(
                        recentActivity.length,
                        5,
                      ) -
                        1 && (
                      <View
                        style={
                          styles.divider
                        }
                      />
                    )}
                  </React.Fragment>
                ),
              )
          )}
        </View>

        {/* ENCOURAGEMENT */}
        <View
          style={
            styles.encouragementCard
          }
        >
          <View
            style={
              styles.encouragementIcon
            }
          >
            <Text
              style={
                styles.encouragementEmoji
              }
            >
              💚
            </Text>
          </View>

          <View
            style={
              styles.encouragementText
            }
          >
            <Text
              style={
                styles.encouragementTitle
              }
            >
              {t(
                'parent.keepEncouraging',
                'Keep encouraging!',
              )}
            </Text>

            <Text
              style={
                styles.encouragementDescription
              }
            >
              {t(
                'parent.encouragementDescription',
                'A little encouragement from you can make learning even more enjoyable.',
              )}
            </Text>
          </View>
        </View>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </View>
  );
};

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    header: {
      minHeight: 82,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    backButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        COLORS.background,
    },

    headerTextContainer: {
      flex: 1,
      minWidth: 0,
      marginLeft: 13,
      marginRight: 10,
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
      justifyContent:
        'center',
      backgroundColor:
        COLORS.lavenderLight,
      borderWidth: 1,
      borderColor:
        '#C9C1FF',
    },

    content: {
      paddingTop: 18,
      paddingBottom: 40,
    },

    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingVertical: 8,
    },

    loadingText: {
      marginLeft: 8,
      fontSize: 11,
      color: COLORS.muted,
    },

    demoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor:
        COLORS.yellowLight,
      marginBottom: 14,
    },

    demoBannerText: {
      flex: 1,
      marginLeft: 8,
      fontSize: 11,
      lineHeight: 16,
      color: COLORS.yellowDark,
      fontWeight: '600',
    },

    welcomeCard: {
      padding: 18,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        COLORS.lavender,
      shadowColor:
        '#6655D8',
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
      justifyContent:
        'center',
      backgroundColor:
        COLORS.white,
    },

    welcomeEmoji: {
      fontSize: 30,
    },

    welcomeTextContainer: {
      flex: 1,
      minWidth: 0,
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

    childrenSelector: {
      paddingBottom: 4,
      gap: 10,
    },

    childSelectorCard: {
      minWidth: 130,
      padding: 11,
      borderRadius: 17,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    childSelectorCardSelected: {
      backgroundColor:
        COLORS.lavender,
      borderColor:
        COLORS.lavender,
    },

    selectorAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        COLORS.lavenderLight,
    },

    selectorAvatarSelected: {
      backgroundColor:
        COLORS.white,
    },

    selectorAvatarText: {
      fontSize: 13,
      fontWeight: '800',
      color:
        COLORS.lavenderDark,
    },

    selectorAvatarTextSelected: {
      color:
        COLORS.lavenderDark,
    },

    selectorName: {
      flex: 1,
      marginLeft: 7,
      marginRight: 5,
      fontSize: 12,
      fontWeight: '800',
      color: COLORS.navy,
    },

    selectorNameSelected: {
      color: COLORS.white,
    },

    childCard: {
      marginTop: 16,
      padding: 15,
      borderRadius: 22,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        COLORS.white,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
    },

    childAvatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        COLORS.yellowLight,
      borderWidth: 2,
      borderColor:
        COLORS.yellow,
    },

    childAvatarText: {
      fontSize: 24,
      fontWeight: '800',
      color:
        COLORS.yellowDark,
    },

    childInfo: {
      flex: 1,
      minWidth: 0,
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
      color:
        COLORS.coralDark,
    },

    viewButton: {
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor:
        COLORS.lavenderLight,
    },

    viewButtonText: {
      fontSize: 12,
      fontWeight: '800',
      color:
        COLORS.lavenderDark,
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
      justifyContent:
        'center',
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
      backgroundColor:
        COLORS.white,
      borderWidth: 1.5,
      borderColor:
        COLORS.lavender,
    },

    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    cardHeaderText: {
      flex: 1,
      marginRight: 12,
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
      color:
        COLORS.lavenderDark,
    },

    progressTrack: {
      height: 11,
      marginTop: 17,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor:
        '#E5E0FF',
    },

    progressFill: {
      height: '100%',
      borderRadius: 8,
      backgroundColor:
        COLORS.lavender,
    },

    progressBottomRow: {
      marginTop: 9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    progressBottomText: {
      flex: 1,
      fontSize: 12,
      color: COLORS.muted,
      marginRight: 10,
    },

    activityCard: {
      paddingHorizontal: 16,
      borderRadius: 22,
      backgroundColor:
        COLORS.white,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
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
      justifyContent:
        'center',
    },

    activityText: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
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
      color:
        COLORS.lightMuted,
    },

    divider: {
      height: 1,
      backgroundColor:
        COLORS.border,
    },

    skillsCard: {
      padding: 18,
      borderRadius: 22,
      backgroundColor:
        COLORS.white,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
    },

    skillRow: {
      marginBottom: 17,
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
      backgroundColor:
        '#EEF2F4',
    },

    skillFill: {
      height: '100%',
      borderRadius: 5,
    },

    practiceCard: {
      marginTop: 16,
      padding: 15,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        COLORS.coralLight,
      borderWidth: 1.5,
      borderColor:
        COLORS.coral,
    },

    practiceIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        COLORS.white,
    },

    practiceText: {
      flex: 1,
      marginLeft: 11,
    },

    practiceTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.navy,
    },

    practiceDescription: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 16,
      color: COLORS.muted,
    },

    recentCard: {
      paddingHorizontal: 16,
      borderRadius: 22,
      backgroundColor:
        COLORS.white,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
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
      justifyContent:
        'center',
      backgroundColor:
        COLORS.greenLight,
    },

    recentText: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
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
      backgroundColor:
        COLORS.mintLight,
      borderWidth: 1.5,
      borderColor:
        COLORS.mint,
    },

    encouragementIcon: {
      width: 43,
      height: 43,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        COLORS.white,
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
      color:
        COLORS.mintDark,
    },

    encouragementDescription: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 16,
      color: COLORS.muted,
    },

    emptyText: {
      paddingVertical: 20,
      textAlign: 'center',
      fontSize: 12,
      color: COLORS.muted,
    },

    bottomSpace: {
      height: 20,
    },

    pressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },
  });

export default ParentDashboardScreen;
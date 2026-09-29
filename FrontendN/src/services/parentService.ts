import { apiClient } from './apiClient';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ParentChild {
  id: number | string;
  name: string;
  age?: number;
  grade?: string;
  language?: string;
  xpTotal?: number;
  level?: number;
  streak?: number;
  lastActiveAt?: string | null;
}

export interface ParentRecentActivity {
  id: number | string;
  gameName: string;
  gameId: string;
  score?: number;
  accuracy?: number;
  completedAt: string;
}

export interface ParentSkill {
  skillId: string;
  skillName: string;
  accuracy: number;
  attempts: number;
}

export interface ParentGamePerformance {
  gameId: string;
  gameName: string;
  attempts: number;
  completed: number;
  accuracy: number;
  averageScore?: number;
  bestScore?: number;
}

export interface ParentLearningAnalytics {
  student: {
    id: number | string;
    name: string;
    age?: number;
    level?: number;
    language?: string;
    streak?: number;
  };

  overallAccuracy: number;
  totalGamesPlayed: number;
  totalGamesCompleted: number;
  totalXP: number;
  currentStreak: number;
  learningTimeMinutes: number;

  gamePerformance: ParentGamePerformance[];
  skillPerformance: ParentSkill[];
  strengths: ParentSkill[];
  weaknesses: ParentSkill[];
  recentActivity: ParentRecentActivity[];
}

export interface ParentDashboardData {
  child: {
    id: number | string;
    name: string;
    age?: number;
    level?: number;
    language?: string;
    streak?: number;
  } | null;

  overview: {
    xp: number;
    lessons: number;
    learningTimeSeconds: number;
  };

  weeklyProgress: {
    percentage: number;
    completed: number;
    total: number;
  };

  activities: Array<{
    title: string;
    description: string;
    value: number;
    label: string;
  }>;

  skills: Array<{
    name: string;
    percentage: number;
  }>;

  recentActivity: Array<{
    title: string;
    time: string;
    xp: number | string;
  }>;
}

export interface ParentDashboardResponse {
  children: ParentChild[];
  selectedChild: ParentLearningAnalytics | null;

  summary: {
    overallAccuracy: number;
    totalGamesPlayed: number;
    totalGamesCompleted: number;
    totalXP: number;
    currentStreak: number;
    learningTimeMinutes: number;
  };

  recentActivity: ParentRecentActivity[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const safeNumber = (
  value: unknown,
  fallback = 0,
): number => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : fallback;
};

const normalizeChild = (
  child: any,
): ParentChild => ({
  id: child?.id ?? child?._id ?? '',
  name: child?.name ?? 'Student',
  age:
    child?.age !== undefined
      ? safeNumber(child.age)
      : undefined,
  grade:
    child?.grade ??
    child?.class ??
    undefined,
  language:
    child?.language ??
    undefined,
  xpTotal:
    child?.xpTotal !== undefined
      ? safeNumber(child.xpTotal)
      : undefined,
  level:
    child?.level !== undefined
      ? safeNumber(child.level, 1)
      : undefined,
  streak:
    child?.streak !== undefined
      ? safeNumber(child.streak)
      : undefined,
  lastActiveAt:
    child?.lastActiveAt ??
    null,
});

const gameNameFromId = (
  gameId: string,
): string => {
  const names: Record<string, string> = {
    alphabet_matching: 'Alphabet Matching',
    capital_small_match: 'Capital & Small Match',
    vowel_matra_match: 'Vowel & Matra Match',
    speech_letters: 'Speech Practice',
    speech_animals: 'Speech Animals',
    speech_fruits_vegetables:
      'Fruits & Vegetables',
    speech_everyday_nature:
      'Everyday Nature',
    language_pair_match:
      'Language Pair Match',
    colour_challenge: 'Colour Challenge',
    shape_challenge: 'Shape Challenge',
    letter_tracing: 'Letter Tracing',
    math_addition: 'Addition',
    math_subtraction: 'Subtraction',
    math_multiplication:
      'Multiplication',
    math_division: 'Division',
    aptitude_challenge:
      'Aptitude Challenge',
    missing_letters: 'Missing Letters',
    missing_numbers: 'Missing Numbers',
    number_counting: 'Number Counting',
    put_in_order: 'Put In Order',
    guess_the_shape: 'Guess the Shape',
    missing_letter_words:
      'Missing Letter Words',
    find_the_correct_word:
      'Find The Correct Word',
    odd_word_out: 'Odd Word Out',
    grammar_challenge:
      'Grammar Challenge',
  };

  return (
    names[gameId] ??
    gameId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter =>
        letter.toUpperCase(),
      )
  );
};

const normalizeRecentActivity = (
  activity: any,
  index: number,
): ParentRecentActivity => {
  const gameId =
    activity?.gameId ??
    activity?.game_type ??
    activity?.gameType ??
    'learning';

  return {
    id:
      activity?.id ??
      activity?._id ??
      index,
    gameId,
    gameName:
      activity?.gameName ??
      activity?.title ??
      gameNameFromId(gameId),
    score:
      activity?.score !== undefined
        ? safeNumber(activity.score)
        : activity?.xp !== undefined
        ? safeNumber(activity.xp)
        : undefined,
    accuracy:
      activity?.accuracy !== undefined
        ? safeNumber(activity.accuracy)
        : undefined,
    completedAt:
      activity?.completedAt ??
      activity?.time ??
      activity?.createdAt ??
      'Recently',
  };
};

const normalizeSkill = (
  skill: any,
  index: number,
): ParentSkill => ({
  skillId:
    skill?.skillId ??
    skill?.id ??
    `skill-${index}`,
  skillName:
    skill?.skillName ??
    skill?.name ??
    'Learning Skill',
  accuracy: Math.round(
    safeNumber(
      skill?.accuracy ??
        skill?.percentage,
    ),
  ),
  attempts: Math.max(
    0,
    safeNumber(skill?.attempts, 0),
  ),
});

const normalizeGamePerformance = (
  game: any,
  index: number,
): ParentGamePerformance => {
  const gameId =
    game?.gameId ??
    game?.id ??
    game?.game_type ??
    `game-${index}`;

  return {
    gameId,
    gameName:
      game?.gameName ??
      game?.name ??
      gameNameFromId(gameId),
    attempts: safeNumber(
      game?.attempts ??
        game?.totalAttempts,
    ),
    completed: safeNumber(
      game?.completed ??
        game?.gamesCompleted,
    ),
    accuracy: Math.round(
      safeNumber(game?.accuracy),
    ),
    averageScore:
      game?.averageScore !== undefined
        ? safeNumber(game.averageScore)
        : undefined,
    bestScore:
      game?.bestScore !== undefined
        ? safeNumber(game.bestScore)
        : undefined,
  };
};

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

const parentService = {
  /**
   * GET /api/parents/dashboard
   *
   * Current backend returns the dashboard for the
   * first linked child.
   */
  async getDashboard(): Promise<ParentDashboardResponse> {
    const response =
      await apiClient.get(
        '/api/parents/dashboard',
      );

    const data =
      response.data?.data ?? {};

    const child =
      data.child ?? null;

    const overview =
      data.overview ?? {};

    const weeklyProgress =
      data.weeklyProgress ?? {};

    const rawActivities =
      Array.isArray(data.activities)
        ? data.activities
        : [];

    const rawSkills =
      Array.isArray(data.skills)
        ? data.skills
        : [];

    const rawRecent =
      Array.isArray(data.recentActivity)
        ? data.recentActivity
        : [];

    const normalizedChild =
      child
        ? normalizeChild(child)
        : null;

    const children =
      normalizedChild
        ? [normalizedChild]
        : [];

    const overallAccuracy =
      rawSkills.length > 0
        ? Math.round(
            rawSkills.reduce(
              (sum: number, skill: any) =>
                sum +
                safeNumber(
                  skill?.percentage,
                ),
              0,
            ) /
              rawSkills.length,
          )
        : 0;

    const totalXP = safeNumber(
      overview.xp,
    );

    const totalGamesCompleted =
      safeNumber(
        overview.lessons,
      );

    const learningTimeMinutes =
      Math.round(
        safeNumber(
          overview.learningTimeSeconds,
        ) / 60,
      );

    /*
     * The backend dashboard currently provides
     * category-level activity rather than a full
     * game-performance array.
     *
     * We normalize those activities so the UI can
     * display them without inventing API fields.
     */
    const gamePerformance: ParentGamePerformance[] =
      rawActivities.map(
        (activity: any, index: number) => ({
          gameId:
            activity?.title ??
            `activity-${index}`,
          gameName:
            activity?.title ??
            'Learning Activity',
          attempts: 1,
          completed: 1,
          accuracy: Math.round(
            safeNumber(
              activity?.value,
            ),
          ),
          averageScore:
            safeNumber(
              activity?.value,
            ),
          bestScore:
            safeNumber(
              activity?.value,
            ),
        }),
      );

    const skillPerformance =
      rawSkills.map(
        (skill: any, index: number) =>
          normalizeSkill(
            skill,
            index,
          ),
      );

    const sortedSkills = [
      ...skillPerformance,
    ].sort(
      (a, b) =>
        b.accuracy -
        a.accuracy,
    );

    const strengths =
      sortedSkills.slice(0, 2);

    const weaknesses =
      [...skillPerformance]
        .sort(
          (a, b) =>
            a.accuracy -
            b.accuracy,
        )
        .slice(0, 2);

    const recentActivity =
      rawRecent.map(
        (
          activity: any,
          index: number,
        ) =>
          normalizeRecentActivity(
            activity,
            index,
          ),
      );

    const analytics: ParentLearningAnalytics | null =
      normalizedChild
        ? {
            student: {
              id: normalizedChild.id,
              name: normalizedChild.name,
              age:
                normalizedChild.age,
              level:
                normalizedChild.level ??
                1,
              language:
                normalizedChild.language,
              streak:
                normalizedChild.streak ??
                0,
            },

            overallAccuracy,

            totalGamesPlayed:
              Math.max(
                totalGamesCompleted,
                gamePerformance.length,
              ),

            totalGamesCompleted,

            totalXP,

            currentStreak:
              normalizedChild.streak ??
              0,

            learningTimeMinutes,

            gamePerformance,

            skillPerformance,

            strengths,

            weaknesses,

            recentActivity,
          }
        : null;

    return {
      children,

      selectedChild:
        analytics,

      summary: {
        overallAccuracy,
        totalGamesPlayed:
          analytics
            ?.totalGamesPlayed ?? 0,
        totalGamesCompleted,
        totalXP,
        currentStreak:
          normalizedChild?.streak ??
          0,
        learningTimeMinutes,
      },

      recentActivity,
    };
  },

  /**
   * GET /api/parents/children
   */
  async getChildren(): Promise<
    ParentChild[]
  > {
    const response =
      await apiClient.get(
        '/api/parents/children',
      );

    const children =
      response.data?.data?.children;

    if (
      !Array.isArray(children)
    ) {
      return [];
    }

    return children.map(
      normalizeChild,
    );
  },

  /**
   * The current backend does NOT expose
   * /api/parents/children/:id/analytics.
   *
   * Keep this method for screen compatibility,
   * but obtain the available dashboard data from
   * /api/parents/dashboard.
   */
  async getChildAnalytics(
    childId: number | string,
  ): Promise<ParentLearningAnalytics> {
    const dashboard =
      await this.getDashboard();

    const selected =
      dashboard.selectedChild;

    if (
      selected &&
      String(selected.student.id) ===
        String(childId)
    ) {
      return selected;
    }

    if (selected) {
      return selected;
    }

    throw new Error(
      'No child analytics available.',
    );
  },

  /**
   * POST /api/parents/children/link
   */
  async linkChild(
    email: string,
  ): Promise<ParentChild> {
    const response =
      await apiClient.post(
        '/api/parents/children/link',
        { email },
      );

    const child =
      response.data?.data?.child;

    if (!child) {
      throw new Error(
        'Child linking failed.',
      );
    }

    return normalizeChild(child);
  },
};

export default parentService;
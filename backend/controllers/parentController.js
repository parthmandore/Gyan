const User = require("../models/User");
const Progress = require("../models/Progress");

// --------------------------------------------------
// GET PARENT'S CHILDREN
// --------------------------------------------------

const getChildren = async (req, res) => {
  try {
    const children = await User.find({
      parentId: req.user._id,
      role: "student",
    })
      .select(
        "name age language xpTotal level streak lastActiveAt"
      )
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: {
        children,
      },
    });
  } catch (error) {
    console.error(
      "Get children error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while fetching children",
    });
  }
};

// --------------------------------------------------
// GET PARENT DASHBOARD
// --------------------------------------------------

const getParentDashboard = async (req, res) => {
  try {
    const children = await User.find({
      parentId: req.user._id,
      role: "student",
    }).select(
      "name age language xpTotal level streak lastActiveAt"
    );

    if (children.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          child: null,

          overview: {
            xp: 0,
            lessons: 0,
            learningTimeSeconds: 0,
          },

          weeklyProgress: {
            percentage: 0,
            completed: 0,
            total: 0,
          },

          activities: [],

          skills: [],

          recentActivity: [],
        },
      });
    }

    // For the MVP, dashboard displays first linked child.
    const child = children[0];

    // ----------------------------------------------
    // Fetch child's progress
    // ----------------------------------------------

    const progress = await Progress.find({
      user: child._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    // ----------------------------------------------
    // Basic statistics
    // ----------------------------------------------

    const totalLessons = progress.length;

    const totalLearningTimeSeconds =
      progress.reduce(
        (sum, item) =>
          sum + Number(item.time_taken_seconds || 0),
        0
      );

    const totalAttempts = progress.reduce(
      (sum, item) =>
        sum + Number(item.items_attempted || 0),
      0
    );

    const totalCorrect = progress.reduce(
      (sum, item) =>
        sum + Number(item.items_correct || 0),
      0
    );

    const overallAccuracy =
      totalAttempts > 0
        ? (totalCorrect / totalAttempts) * 100
        : 0;

    // ----------------------------------------------
    // This week's progress
    // ----------------------------------------------

    const now = new Date();

    const startOfWeek = new Date(now);

    const day = startOfWeek.getDay();

    const diff =
      day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - diff
    );

    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyProgressRecords =
      progress.filter(
        (item) =>
          new Date(item.createdAt) >=
          startOfWeek
      );

    const weeklyCompleted =
      weeklyProgressRecords.length;

    const weeklyTarget = 8;

    const weeklyPercentage =
      Math.min(
        100,
        Math.round(
          (weeklyCompleted / weeklyTarget) *
            100
        )
      );

    // ----------------------------------------------
    // Activity categories
    // ----------------------------------------------

    const gameProgress =
      progress.filter((item) =>
        [
          "alphabet_matching",
          "capital_small_match",
          "vowel_matra_match",
        ].includes(item.game_type)
      );

    const gameTime = gameProgress.reduce(
      (sum, item) =>
        sum + Number(item.time_taken_seconds || 0),
      0
    );

    const gameAccuracy =
      gameProgress.length > 0
        ? gameProgress.reduce(
            (sum, item) =>
              sum + Number(item.accuracy || 0),
            0
          ) / gameProgress.length
        : 0;

    // ----------------------------------------------
    // Skills
    // ----------------------------------------------

    const alphabetProgress =
      progress.filter(
        (item) =>
          item.game_type ===
          "alphabet_matching"
      );

    const alphabetAccuracy =
      alphabetProgress.length > 0
        ? alphabetProgress.reduce(
            (sum, item) =>
              sum + Number(item.accuracy || 0),
            0
          ) / alphabetProgress.length
        : 0;

    const vocabularyPercentage =
      Math.min(
        100,
        Math.round(overallAccuracy * 0.8)
      );

    const pronunciationPercentage =
      Math.min(
        100,
        Math.round(overallAccuracy * 0.9)
      );

    // ----------------------------------------------
    // Recent activity
    // ----------------------------------------------

    const recentActivity =
      progress.slice(0, 5).map((item) => ({
        title: formatGameTitle(
          item.game_type
        ),

        time: item.createdAt,

        xp: `+${item.xp_earned || 0} XP`,
      }));

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        child: {
          id: child._id,
          name: child.name,
          age: child.age,
          level: child.level,
          language: child.language,
          streak: child.streak,
        },

        overview: {
          xp: child.xpTotal,
          lessons: totalLessons,
          learningTimeSeconds:
            totalLearningTimeSeconds,
        },

        weeklyProgress: {
          percentage: weeklyPercentage,
          completed: weeklyCompleted,
          total: weeklyTarget,
        },

        activities: [
          {
            title: "Learning Games",
            description:
              "Letters & matching",
            value: gameProgress.length,
            label: "completed",
          },

          {
            title: "Game Accuracy",
            description:
              "Learning game performance",
            value: `${Math.round(
              gameAccuracy
            )}%`,
            label: "accuracy",
          },

          {
            title: "Learning Time",
            description:
              "Time spent learning",
            value: formatMinutes(
              gameTime
            ),
            label: "total",
          },
        ],

        skills: [
          {
            name: "Alphabet",
            percentage: Math.round(
              alphabetAccuracy
            ),
          },

          {
            name: "Vocabulary",
            percentage:
              vocabularyPercentage,
          },

          {
            name: "Pronunciation",
            percentage:
              pronunciationPercentage,
          },
        ],

        recentActivity,
      },
    });
  } catch (error) {
    console.error(
      "Parent dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while loading parent dashboard",
    });
  }
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const formatMinutes = (seconds) => {
  const minutes = Math.round(
    Number(seconds || 0) / 60
  );

  return `${minutes} min`;
};

const formatGameTitle = (gameType) => {
  const titles = {
    alphabet_matching:
      "Alphabet Matching",

    capital_small_match:
      "Capital & Small Match",

    vowel_matra_match:
      "Vowel & Matra Match",

    speech_practice:
      "Speech Practice",
  };

  return (
    titles[gameType] ||
    gameType
  );
};
// --------------------------------------------------
// LINK CHILD TO PARENT
// --------------------------------------------------

const linkChild = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Student email is required",
      });
    }

    const child = await User.findOne({
      email: email.toLowerCase(),
      role: "student",
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    child.parentId = req.user._id;

    await child.save();

    return res.status(200).json({
      success: true,
      message: "Child linked successfully",
      data: {
        child: {
          id: child._id,
          name: child.name,
          email: child.email,
        },
      },
    });
  } catch (error) {
    console.error(
      "Link child error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while linking child",
    });
  }
};

module.exports = {
  getChildren,
  getParentDashboard,
  linkChild,
};
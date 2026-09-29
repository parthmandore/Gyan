
const mongoose = require("mongoose");
const User = require("../models/User");
const Progress = require("../models/Progress");

// --------------------------------------------------
// GET PARENT'S LINKED CHILDREN
// --------------------------------------------------

const getChildren = async (req, res) => {
  try {
    const children = await User.find({
      parentId: req.user._id,
      role: "student",
    })
      .select("name email age language xpTotal level streak lastActiveAt")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        children: children.map((child) => ({
          ...child,
          id: child._id,
        })),
      },
    });
  } catch (error) {
    console.error("Get children error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching children",
    });
  }
};

// --------------------------------------------------
// GET PARENT DASHBOARD
// Supports ?childId=<student MongoDB ID>
// --------------------------------------------------

const getParentDashboard = async (req, res) => {
  try {
    const children = await User.find({
      parentId: req.user._id,
      role: "student",
    })
      .select("name email age language xpTotal level streak lastActiveAt")
      .sort({ name: 1 });

    if (children.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          child: null,
          children: [],
          overview: {
            xp: 0,
            lessons: 0,
            learningTimeSeconds: 0,
          },
          weeklyProgress: {
            percentage: 0,
            completed: 0,
            total: 8,
          },
          activities: [],
          skills: [],
          recentActivity: [],
        },
      });
    }

    let child;

    if (req.query.childId) {
      if (!mongoose.isValidObjectId(req.query.childId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid child ID",
        });
      }

      child = children.find(
        (item) => String(item._id) === String(req.query.childId)
      );

      if (!child) {
        return res.status(404).json({
          success: false,
          message: "Child not found under this parent account",
        });
      }
    } else {
      // Preserve the existing default dashboard behaviour.
      child = children[0];
    }

    const dashboard = await buildChildDashboard(child);

    return res.status(200).json({
      success: true,
      data: {
        ...dashboard,
        children: children.map((item) => ({
          id: item._id,
          _id: item._id,
          name: item.name,
          email: item.email,
          age: item.age,
          language: item.language,
          xpTotal: item.xpTotal,
          level: item.level,
          streak: item.streak,
          lastActiveAt: item.lastActiveAt,
        })),
      },
    });
  } catch (error) {
    console.error("Parent dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while loading parent dashboard",
    });
  }
};

// --------------------------------------------------
// GET ANALYTICS FOR A SPECIFIC LINKED CHILD
// GET /api/parents/children/:childId/analytics
// --------------------------------------------------

const getChildAnalytics = async (req, res) => {
  try {
    const { childId } = req.params;

    if (!mongoose.isValidObjectId(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child ID",
      });
    }

    // Verify that this child belongs to the logged-in parent.
    const child = await User.findOne({
      _id: childId,
      parentId: req.user._id,
      role: "student",
    }).select("name email age language xpTotal level streak lastActiveAt");

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found under this parent account",
      });
    }

    const dashboard = await buildChildDashboard(child);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get child analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching child analytics",
    });
  }
};

// --------------------------------------------------
// BUILD DASHBOARD DATA FOR ONE CHILD
// --------------------------------------------------

const buildChildDashboard = async (child) => {
  const progress = await Progress.find({
    user: child._id,
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const totalLessons = progress.length;

  const totalLearningTimeSeconds = progress.reduce(
    (sum, item) => sum + Number(item.time_taken_seconds || 0),
    0
  );

  const totalAttempts = progress.reduce(
    (sum, item) => sum + Number(item.items_attempted || 0),
    0
  );

  const totalCorrect = progress.reduce(
    (sum, item) => sum + Number(item.items_correct || 0),
    0
  );

  const overallAccuracy =
    totalAttempts > 0
      ? Math.round((totalCorrect / totalAttempts) * 100)
      : 0;

  // Calculate progress from the start of the current week (Monday).
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyProgressRecords = progress.filter(
    (item) => new Date(item.createdAt) >= startOfWeek
  );

  const weeklyTarget = 8;
  const weeklyCompleted = weeklyProgressRecords.length;

  const weeklyPercentage = Math.min(
    100,
    Math.round((weeklyCompleted / weeklyTarget) * 100)
  );

  const learningGameTypes = [
    "alphabet_matching",
    "capital_small_match",
    "vowel_matra_match",
  ];

  const gameProgress = progress.filter((item) =>
    learningGameTypes.includes(item.game_type)
  );

  const gameTime = gameProgress.reduce(
    (sum, item) => sum + Number(item.time_taken_seconds || 0),
    0
  );

  const gameAccuracy =
    gameProgress.length > 0
      ? Math.round(
          gameProgress.reduce(
            (sum, item) => sum + Number(item.accuracy || 0),
            0
          ) / gameProgress.length
        )
      : 0;

  const alphabetProgress = progress.filter(
    (item) => item.game_type === "alphabet_matching"
  );

  const alphabetAccuracy =
    alphabetProgress.length > 0
      ? Math.round(
          alphabetProgress.reduce(
            (sum, item) => sum + Number(item.accuracy || 0),
            0
          ) / alphabetProgress.length
        )
      : 0;

  // Keep the existing dashboard's skill categories.
  const vocabularyPercentage = Math.min(
    100,
    Math.round(overallAccuracy * 0.8)
  );

  const pronunciationPercentage = Math.min(
    100,
    Math.round(overallAccuracy * 0.9)
  );

  const recentActivity = progress.slice(0, 5).map((item) => ({
    id: item._id,
    title: formatGameTitle(item.game_type),
    gameId: item.game_type,
    score: Number(item.xp_earned || 0),
    accuracy: Number(item.accuracy || 0),
    completedAt: item.createdAt,
    time: item.createdAt,
    xp: `+${item.xp_earned || 0} XP`,
  }));

  return {
    child: {
      id: child._id,
      _id: child._id,
      name: child.name,
      email: child.email,
      age: child.age,
      level: child.level,
      language: child.language,
      streak: child.streak,
      xpTotal: child.xpTotal,
      lastActiveAt: child.lastActiveAt,
    },

    overview: {
      xp: Number(child.xpTotal || 0),
      lessons: totalLessons,
      learningTimeSeconds: totalLearningTimeSeconds,
    },

    weeklyProgress: {
      percentage: weeklyPercentage,
      completed: weeklyCompleted,
      total: weeklyTarget,
    },

    activities: [
      {
        title: "Learning Games",
        description: "Letters & matching",
        value: gameProgress.length,
        label: "completed",
      },
      {
        title: "Game Accuracy",
        description: "Learning game performance",
        value: gameAccuracy,
        label: "accuracy",
      },
      {
        title: "Learning Time",
        description: "Time spent learning",
        value: Math.round(gameTime / 60),
        label: "minutes",
      },
    ],

    skills: [
      {
        name: "Alphabet",
        percentage: alphabetAccuracy,
      },
      {
        name: "Vocabulary",
        percentage: vocabularyPercentage,
      },
      {
        name: "Pronunciation",
        percentage: pronunciationPercentage,
      },
    ],

    recentActivity,
  };
};

// --------------------------------------------------
// LINK CHILD TO PARENT
// --------------------------------------------------

const linkChild = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Student email is required",
      });
    }

    const child = await User.findOne({
      email,
      role: "student",
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (
      child.parentId &&
      String(child.parentId) !== String(req.user._id)
    ) {
      return res.status(409).json({
        success: false,
        message: "Student is already linked to another parent",
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
    console.error("Link child error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while linking child",
    });
  }
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const formatGameTitle = (gameType) => {
  const titles = {
    alphabet_matching: "Alphabet Matching",
    capital_small_match: "Capital & Small Match",
    vowel_matra_match: "Vowel & Matra Match",
    speech_practice: "Speech Practice",
  };

  return (
    titles[gameType] ||
    String(gameType || "Learning Activity")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

module.exports = {
  getChildren,
  getParentDashboard,
  getChildAnalytics,
  linkChild,
};
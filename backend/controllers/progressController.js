const Progress = require("../models/Progress");
const Reward = require("../models/Reward");
const User = require("../models/User");

const {
  calculateXP,
  calculateLevel,
  getXPProgress,
} = require("../services/xpService");

// --------------------------------------------------
// SUBMIT GAME PROGRESS
// --------------------------------------------------

const submitProgress = async (req, res) => {
  try {
    const {
      game_type,
      language,
      difficulty,
      mode,
      items_attempted,
      items_correct,
      time_taken_seconds,
    } = req.body;

    // ----------------------------------------------
    // Validate required fields
    // ----------------------------------------------

    if (
      !game_type ||
      difficulty === undefined ||
      items_attempted === undefined ||
      items_correct === undefined ||
      time_taken_seconds === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "game_type, difficulty, items_attempted, items_correct and time_taken_seconds are required",
      });
    }

    // ----------------------------------------------
    // Validate numbers
    // ----------------------------------------------

    if (
      !Number.isInteger(Number(difficulty)) ||
      Number(difficulty) < 1 ||
      Number(difficulty) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Difficulty must be between 1 and 5",
      });
    }

    if (
      !Number.isInteger(Number(items_attempted)) ||
      Number(items_attempted) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "items_attempted must be greater than 0",
      });
    }

    if (
      !Number.isInteger(Number(items_correct)) ||
      Number(items_correct) < 0 ||
      Number(items_correct) > Number(items_attempted)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "items_correct must be between 0 and items_attempted",
      });
    }

    if (
      Number(time_taken_seconds) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "time_taken_seconds cannot be negative",
      });
    }

    // ----------------------------------------------
    // Calculate accuracy
    // ----------------------------------------------

    const accuracy =
      (Number(items_correct) /
        Number(items_attempted)) *
      100;

    // ----------------------------------------------
    // Calculate XP
    // ----------------------------------------------

    const xpEarned = calculateXP({
      accuracy,
      difficulty: Number(difficulty),
      timeTakenSeconds: Number(
        time_taken_seconds
      ),
    });

    // ----------------------------------------------
    // Create progress record
    // ----------------------------------------------

    const progress = await Progress.create({
      user: req.user._id,
      game_type,
      language: language || req.user.language,
      difficulty: Number(difficulty),
      mode: mode || null,
      items_attempted: Number(items_attempted),
      items_correct: Number(items_correct),
      accuracy: Number(accuracy.toFixed(2)),
      time_taken_seconds: Number(
        time_taken_seconds
      ),
      xp_earned: xpEarned,
    });

    // ----------------------------------------------
    // Update user XP
    // ----------------------------------------------

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldXP = user.xpTotal;

    const newXP = oldXP + xpEarned;

    const newLevel = calculateLevel(newXP);

    user.xpTotal = newXP;
    user.level = newLevel;
    user.lastActiveAt = new Date();

    await user.save();

    // ----------------------------------------------
    // Create reward record
    // ----------------------------------------------

    const reward = await Reward.create({
      user: user._id,
      xp: xpEarned,
      reason: `Completed ${game_type}`,
      game_type,
    });

    // ----------------------------------------------
    // Get XP dashboard information
    // ----------------------------------------------

    const xpProgress = getXPProgress(
      user.xpTotal
    );

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Progress submitted successfully",

      data: {
        progress: {
          id: progress._id,
          game_type: progress.game_type,
          difficulty: progress.difficulty,
          accuracy: progress.accuracy,
          items_attempted:
            progress.items_attempted,
          items_correct:
            progress.items_correct,
          time_taken_seconds:
            progress.time_taken_seconds,
        },

        reward: {
          id: reward._id,
          xpEarned,
        },

        xp: {
          total: xpProgress.xpTotal,
          level: xpProgress.level,
          xpEarnedInLevel:
            xpProgress.xpEarnedInLevel,
          xpToNextLevel:
            xpProgress.xpToNextLevel,
        },
      },
    });
  } catch (error) {
    console.error(
      "Submit progress error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while submitting progress",
    });
  }
};

// --------------------------------------------------
// GET CURRENT USER PROGRESS
// --------------------------------------------------

const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error(
      "Get progress error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching progress",
    });
  }
};

// --------------------------------------------------
// GET PROGRESS SUMMARY
// --------------------------------------------------

const getProgressSummary = async (
  req,
  res
) => {
  try {
    const progress = await Progress.find({
      user: req.user._id,
    });

    if (progress.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalGames: 0,
          totalAttempts: 0,
          totalCorrect: 0,
          averageAccuracy: 0,
          totalTimeSeconds: 0,
        },
      });
    }

    const totalGames = progress.length;

    const totalAttempts = progress.reduce(
      (sum, item) =>
        sum + item.items_attempted,
      0
    );

    const totalCorrect = progress.reduce(
      (sum, item) =>
        sum + item.items_correct,
      0
    );

    const totalTimeSeconds =
      progress.reduce(
        (sum, item) =>
          sum + item.time_taken_seconds,
        0
      );

    const averageAccuracy =
      totalAttempts > 0
        ? (totalCorrect / totalAttempts) *
          100
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalGames,
        totalAttempts,
        totalCorrect,
        averageAccuracy:
          Number(averageAccuracy.toFixed(2)),
        totalTimeSeconds,
      },
    });
  } catch (error) {
    console.error(
      "Progress summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching progress summary",
    });
  }
};

module.exports = {
  submitProgress,
  getMyProgress,
  getProgressSummary,
};
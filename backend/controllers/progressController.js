
const Progress = require("../models/Progress");
const Reward = require("../models/Reward");
const User = require("../models/User");

const {
  calculateXP,
  calculateLevel,
  getXPProgress,
} = require("../services/xpService");

const {
  checkAchievements,
} = require("../services/achievementService");

const {
  SUPPORTED_LANGUAGES,
} = require("../services/speechService");

// --------------------------------------------------
// DAILY LEARNING STREAK
// --------------------------------------------------

const getUTCDateKey = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

const updateLearningStreak = (user, activityDate = new Date()) => {
  const todayKey = getUTCDateKey(activityDate);

  // Normalize to UTC midnight so comparisons use calendar days.
  const today = new Date(`${todayKey}T00:00:00.000Z`);

  if (!user.lastLearningDate) {
    user.streak = 1;
    user.lastLearningDate = today;
    return;
  }

  const lastDateKey = getUTCDateKey(user.lastLearningDate);
  const lastDate = new Date(`${lastDateKey}T00:00:00.000Z`);

  const daysSinceLastLearning = Math.floor(
    (today.getTime() - lastDate.getTime()) / 86400000
  );

  if (daysSinceLastLearning === 0) {
    // Already learned today: keep the current streak.
    return;
  }

  if (daysSinceLastLearning === 1) {
    // Learned on consecutive calendar days.
    user.streak = Number(user.streak || 0) + 1;
  } else {
    // A day or more was missed.
    user.streak = 1;
  }

  user.lastLearningDate = today;
};

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

    const selectedLanguage =
      language || req.user.language || "en";

    if (!SUPPORTED_LANGUAGES[selectedLanguage]) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language. Use en, hi or mr",
      });
    }

    if (
      !Number.isInteger(Number(difficulty)) ||
      Number(difficulty) < 1 ||
      Number(difficulty) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Difficulty must be an integer between 1 and 5",
      });
    }

    if (
      !Number.isInteger(Number(items_attempted)) ||
      Number(items_attempted) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "items_attempted must be a positive integer",
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
      !Number.isFinite(Number(time_taken_seconds)) ||
      Number(time_taken_seconds) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "time_taken_seconds must be a valid non-negative number",
      });
    }

    const numericDifficulty = Number(difficulty);
    const numericAttempted = Number(items_attempted);
    const numericCorrect = Number(items_correct);
    const numericTime = Number(time_taken_seconds);

    const accuracy = (numericCorrect / numericAttempted) * 100;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const xpEarned = calculateXP({
      accuracy,
      difficulty: numericDifficulty,
      timeTakenSeconds: numericTime,
    });

    const progress = await Progress.create({
      user: user._id,
      game_type,
      language: selectedLanguage,
      difficulty: numericDifficulty,
      mode: mode || null,
      items_attempted: numericAttempted,
      items_correct: numericCorrect,
      accuracy: Number(accuracy.toFixed(2)),
      time_taken_seconds: numericTime,
      xp_earned: xpEarned,
    });

    const oldXP = Number(user.xpTotal || 0);
    const newXP = oldXP + xpEarned;

    user.xpTotal = newXP;
    user.level = calculateLevel(newXP);
    user.lastActiveAt = new Date();

    // Count this as a learning day.
    updateLearningStreak(user);

    await user.save();

    const reward = await Reward.create({
      user: user._id,
      xp: xpEarned,
      reason: `Completed ${game_type}`,
      game_type,
    });

    let earnedBadges = [];

    try {
      // Evaluate achievements after the streak has been saved.
      earnedBadges = await checkAchievements(user._id);
    } catch (achievementError) {
      console.error(
        "Achievement evaluation error:",
        achievementError.message
      );
    }

    const xpProgress = getXPProgress(user.xpTotal);

    return res.status(201).json({
      success: true,
      message: "Progress submitted successfully",
      data: {
        progress: {
          id: progress._id,
          game_type: progress.game_type,
          language: progress.language,
          difficulty: progress.difficulty,
          mode: progress.mode,
          accuracy: progress.accuracy,
          items_attempted: progress.items_attempted,
          items_correct: progress.items_correct,
          time_taken_seconds: progress.time_taken_seconds,
        },
        reward: {
          id: reward._id,
          xpEarned,
        },
        xp: {
          total: xpProgress.xpTotal,
          level: xpProgress.level,
          xpEarnedInLevel: xpProgress.xpEarnedInLevel,
          xpToNextLevel: xpProgress.xpToNextLevel,
        },
        streak: {
          current: user.streak,
          lastLearningDate: user.lastLearningDate,
        },
        achievements: earnedBadges,
      },
    });
  } catch (error) {
    console.error("Submit progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting progress",
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
    console.error("Get progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching progress",
    });
  }
};

// --------------------------------------------------
// GET PROGRESS SUMMARY
// --------------------------------------------------

const getProgressSummary = async (req, res) => {
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
      (sum, item) => sum + item.items_attempted,
      0
    );

    const totalCorrect = progress.reduce(
      (sum, item) => sum + item.items_correct,
      0
    );

    const totalTimeSeconds = progress.reduce(
      (sum, item) => sum + item.time_taken_seconds,
      0
    );

    const averageAccuracy =
      totalAttempts > 0
        ? (totalCorrect / totalAttempts) * 100
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalGames,
        totalAttempts,
        totalCorrect,
        averageAccuracy: Number(averageAccuracy.toFixed(2)),
        totalTimeSeconds,
      },
    });
  } catch (error) {
    console.error("Progress summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching progress summary",
    });
  }
};

module.exports = {
  submitProgress,
  getMyProgress,
  getProgressSummary,
};

const mongoose = require("mongoose");
const SpeechAttempt = require("../models/SpeechAttempt");
const Progress = require("../models/Progress");
const Reward = require("../models/Reward");
const User = require("../models/User");

const {
  calculateXP,
  calculateLevel,
  getXPProgress,
} = require("../services/xpService");

const { checkAchievements } = require("../services/achievementService");

const {
  getTrustedSpeechChallengeAnswer,
} = require("./gameController");

const SUPPORTED_LANGUAGES = ["en", "hi", "mr"];
const SUPPORTED_MODES = ["letters", "words"];
const GAME_TYPE = "speech_word_challenge";

const normalizeAnswer = (value) =>
  String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");

const getUTCDateKey = (date = new Date()) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const updateLearningStreak = (user) => {
  const today = getUTCDateKey();

  const yesterdayDate = new Date();
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);

  const yesterday = getUTCDateKey(yesterdayDate);

  const lastDate = user.lastLearningDate
    ? getUTCDateKey(new Date(user.lastLearningDate))
    : null;

  if (lastDate === today) {
    return;
  }

  user.streak =
    lastDate === yesterday ? (user.streak || 0) + 1 : 1;

  user.lastLearningDate = new Date(`${today}T00:00:00.000Z`);
};

// SUBMIT SPEECH ATTEMPT
const submitSpeechAttempt = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const {
      mode,
      language,
      age,
      item_id,
      recognized_answer,
      attempt_count = 1,
      duration_seconds = 0,
      latency_ms = 0,
      session_id = null,
      difficulty = 1,
      language_returned = null,
      stt_error_type = "NONE",
    } = req.body;

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Language must be en, hi or mr",
      });
    }

    if (!SUPPORTED_MODES.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be letters or words",
      });
    }

    if (
      typeof item_id !== "string" ||
      !item_id.trim() ||
      typeof recognized_answer !== "string" ||
      !recognized_answer.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "item_id and recognized_answer are required",
      });
    }

    const parsedAttemptCount = Number(attempt_count);
    const parsedDifficulty = Number(difficulty);
    const parsedDuration = Number(duration_seconds);
    const parsedLatency = Number(latency_ms);

    if (
      !Number.isInteger(parsedAttemptCount) ||
      parsedAttemptCount < 1 ||
      parsedAttemptCount > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "attempt_count must be an integer between 1 and 100",
      });
    }

    if (
      !Number.isInteger(parsedDifficulty) ||
      parsedDifficulty < 1 ||
      parsedDifficulty > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "difficulty must be an integer between 1 and 3",
      });
    }

    const parsedAge =
      age === undefined || age === null || age === ""
        ? undefined
        : Number(age);

    if (
      parsedAge !== undefined &&
      (!Number.isInteger(parsedAge) || parsedAge < 3 || parsedAge > 18)
    ) {
      return res.status(400).json({
        success: false,
        message: "age must be an integer between 3 and 18",
      });
    }

    if (
      !Number.isFinite(parsedDuration) ||
      parsedDuration < 0 ||
      !Number.isFinite(parsedLatency) ||
      parsedLatency < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration and latency must be non-negative numbers",
      });
    }

    if (
      language_returned !== null &&
      language_returned !== "" &&
      !SUPPORTED_LANGUAGES.includes(language_returned)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid language_returned value",
      });
    }

    const trustedAnswer = getTrustedSpeechChallengeAnswer({
      language,
      mode,
      itemId: item_id.trim(),
    });

    if (
      !trustedAnswer ||
      typeof trustedAnswer.expectedAnswer !== "string"
    ) {
      return res.status(404).json({
        success: false,
        message: "Speech challenge item not found",
      });
    }

    const normalizedRecognized = normalizeAnswer(recognized_answer);

    const acceptedAnswers = [
      trustedAnswer.expectedAnswer,
      ...(trustedAnswer.acceptedVariants || []),
    ].map(normalizeAnswer);

    const isCorrect = acceptedAnswers.includes(normalizedRecognized);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const xpEarned = calculateXP({
      accuracy: isCorrect ? 100 : 0,
      difficulty: parsedDifficulty,
      timeTakenSeconds: parsedDuration,
    });

    const speechAttempt = await SpeechAttempt.create({
      user: userId,
      game_type: GAME_TYPE,
      mode,
      language,
      age: parsedAge,
      item_id: item_id.trim(),
      expected_answer: trustedAnswer.expectedAnswer,
      recognized_answer: recognized_answer.trim(),
      is_correct: isCorrect,
      attempt_count: parsedAttemptCount,
      duration_seconds: parsedDuration,
      latency_ms: parsedLatency,
      language_returned: language_returned || null,
      stt_error_type,
      session_id,
    });

    const progress = await Progress.create({
      user: userId,
      game_type: GAME_TYPE,
      language,
      difficulty: parsedDifficulty,
      mode,
      items_attempted: 1,
      items_correct: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
      time_taken_seconds: Math.round(parsedDuration),
      xp_earned: xpEarned,
    });

    user.xpTotal = Number(user.xpTotal || 0) + xpEarned;
    user.level = calculateLevel(user.xpTotal);
    user.lastActiveAt = new Date();

    updateLearningStreak(user);

    // Always save XP, even if the user has already played today.
    await user.save();

    await Reward.create({
      user: userId,
      xp: xpEarned,
      reason: isCorrect
        ? "Correct speech challenge answer"
        : "Speech challenge attempt",
      game_type: GAME_TYPE,
    });

    let achievements = [];

    try {
      achievements = await checkAchievements(userId);
    } catch (error) {
      console.error("Speech challenge achievement error:", error);
    }

    const xpProgress = getXPProgress(user.xpTotal);

    return res.status(201).json({
      success: true,
      message: "Speech attempt submitted successfully",
      data: {
        attempt: {
          id: speechAttempt._id,
          item_id: speechAttempt.item_id,
          recognized_answer: speechAttempt.recognized_answer,
          expected_answer: speechAttempt.expected_answer,
          is_correct: speechAttempt.is_correct,
          language,
          mode,
          xp_earned: xpEarned,
        },
        progress: {
          id: progress._id,
          accuracy: progress.accuracy,
          items_attempted: progress.items_attempted,
          items_correct: progress.items_correct,
        },
        xp: {
          total: user.xpTotal,
          level: user.level,
          ...xpProgress,
        },
        streak: {
          current: user.streak || 0,
          lastLearningDate: user.lastLearningDate,
        },
        achievements,
      },
    });
  } catch (error) {
    console.error("Submit speech attempt error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting speech attempt",
    });
  }
};

// GET MY SPEECH ATTEMPTS
const getMySpeechAttempts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { language, mode, limit = 50 } = req.query;

    const filter = { user: userId };

    if (language) {
      if (!SUPPORTED_LANGUAGES.includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Invalid language",
        });
      }

      filter.language = language;
    }

    if (mode) {
      if (!SUPPORTED_MODES.includes(mode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mode",
        });
      }

      filter.mode = mode;
    }

    const parsedLimit = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 50)
    );

    const attempts = await SpeechAttempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();

    return res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Get speech attempts error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching speech attempts",
    });
  }
};

// GET SPEECH SUMMARY
const getSpeechSummary = async (req, res) => {
  try {
    const rawUserId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(rawUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const userId = new mongoose.Types.ObjectId(rawUserId);

    const summary = await SpeechAttempt.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          correctAttempts: {
            $sum: {
              $cond: [{ $eq: ["$is_correct", true] }, 1, 0],
            },
          },
          averageLatencyMs: { $avg: "$latency_ms" },
          totalDurationSeconds: { $sum: "$duration_seconds" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAttempts: 1,
          correctAttempts: 1,
          accuracy: {
            $multiply: [
              {
                $divide: [
                  "$correctAttempts",
                  { $max: ["$totalAttempts", 1] },
                ],
              },
              100,
            ],
          },
          averageLatencyMs: {
            $round: [{ $ifNull: ["$averageLatencyMs", 0] }, 2],
          },
          totalDurationSeconds: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: summary[0] || {
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        averageLatencyMs: 0,
        totalDurationSeconds: 0,
      },
    });
  } catch (error) {
    console.error("Get speech summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching speech summary",
    });
  }
};

module.exports = {
  submitSpeechAttempt,
  getMySpeechAttempts,
  getSpeechSummary,
};
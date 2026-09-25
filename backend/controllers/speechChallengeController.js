const SpeechAttempt = require("../models/SpeechAttempt");
const Progress = require("../models/Progress");
const Reward = require("../models/Reward");
const User = require("../models/User");

const {
  calculateXP,
  calculateLevel,
  getXPProgress,
} = require("../services/xpService");

// --------------------------------------------------
// VALIDATION HELPERS
// --------------------------------------------------

const SUPPORTED_LANGUAGES = [
  "en",
  "hi",
  "mr",
];

const SUPPORTED_MODES = [
  "letters",
  "words",
];

// --------------------------------------------------
// SUBMIT SPEECH ATTEMPT
// --------------------------------------------------

const submitSpeechAttempt = async (
  req,
  res
) => {
  try {
    const {
      game_type = "speech_word_challenge",
      mode,
      language,
      age,
      item_id,
      expected_answer,
      recognized_answer = "",
      is_correct,
      attempt_count = 1,
      duration_seconds = 0,
      latency_ms = 0,
      language_returned,
      stt_error_type = "NONE",
      session_id,
    } = req.body;

    // ----------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------

    if (
      !mode ||
      !language ||
      age === undefined ||
      !item_id ||
      !expected_answer ||
      is_correct === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "mode, language, age, item_id, expected_answer and is_correct are required",
      });
    }

    // ----------------------------------------------
    // VALIDATE GAME TYPE
    // ----------------------------------------------

    if (
      game_type !==
      "speech_word_challenge"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid game_type",
      });
    }

    // ----------------------------------------------
    // VALIDATE MODE
    // ----------------------------------------------

    if (
      !SUPPORTED_MODES.includes(mode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mode. Use letters or words",
      });
    }

    // ----------------------------------------------
    // VALIDATE LANGUAGE
    // ----------------------------------------------

    if (
      !SUPPORTED_LANGUAGES.includes(
        language
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid language. Use en, hi or mr",
      });
    }

    // ----------------------------------------------
    // VALIDATE AGE
    // ----------------------------------------------

    const ageNumber = Number(age);

    if (
      !Number.isInteger(ageNumber) ||
      ageNumber < 3 ||
      ageNumber > 18
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Age must be between 3 and 18",
      });
    }

    // ----------------------------------------------
    // VALIDATE CORRECTNESS
    // ----------------------------------------------

    if (
      typeof is_correct !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "is_correct must be a boolean",
      });
    }

    // ----------------------------------------------
    // VALIDATE ATTEMPT COUNT
    // ----------------------------------------------

    const attemptNumber =
      Number(attempt_count);

    if (
      !Number.isInteger(
        attemptNumber
      ) ||
      attemptNumber < 1 ||
      attemptNumber > 10
    ) {
      return res.status(400).json({
        success: false,
        message:
          "attempt_count must be between 1 and 10",
      });
    }

    // ----------------------------------------------
    // VALIDATE DURATION
    // ----------------------------------------------

    const durationNumber =
      Number(duration_seconds);

    if (
      Number.isNaN(
        durationNumber
      ) ||
      durationNumber < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "duration_seconds cannot be negative",
      });
    }

    // ----------------------------------------------
    // VALIDATE LATENCY
    // ----------------------------------------------

    const latencyNumber =
      Number(latency_ms);

    if (
      Number.isNaN(
        latencyNumber
      ) ||
      latencyNumber < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "latency_ms cannot be negative",
      });
    }

    // ----------------------------------------------
    // SAVE DETAILED SPEECH ATTEMPT
    // ----------------------------------------------

    const attempt =
      await SpeechAttempt.create({
        user: req.user._id,

        game_type,

        mode,

        language,

        age: ageNumber,

        item_id,

        expected_answer,

        recognized_answer,

        is_correct,

        attempt_count:
          attemptNumber,

        duration_seconds:
          durationNumber,

        latency_ms:
          latencyNumber,

        language_returned:
          language_returned ||
          language,

        stt_error_type,

        session_id:
          session_id || null,
      });

    // ----------------------------------------------
    // PROGRESS / XP
    //
    // Each submitted speech attempt is treated
    // as one completed item.
    // ----------------------------------------------

    const itemsAttempted = 1;

    const itemsCorrect =
      is_correct ? 1 : 0;

    const accuracy =
      itemsCorrect /
      itemsAttempted *
      100;

    // Speech challenge currently has
    // difficulty 1-3.
    //
    // We use attempt count as a small
    // performance factor through the
    // existing XP service.
    const difficulty =
      Math.min(
        Math.max(
          attemptNumber,
          1
        ),
        3
      );

    const xpEarned =
      calculateXP({
        accuracy,

        difficulty,

        timeTakenSeconds:
          durationNumber,
      });

    // ----------------------------------------------
    // CREATE NORMAL PROGRESS RECORD
    // ----------------------------------------------

    const progress =
      await Progress.create({
        user: req.user._id,

        game_type:
          "speech_word_challenge",

        language:
          language ||
          req.user.language,

        difficulty,

        mode,

        items_attempted:
          itemsAttempted,

        items_correct:
          itemsCorrect,

        accuracy:
          Number(
            accuracy.toFixed(2)
          ),

        time_taken_seconds:
          durationNumber,

        xp_earned:
          xpEarned,
      });

    // ----------------------------------------------
    // UPDATE USER XP
    // ----------------------------------------------

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    const oldXP =
      user.xpTotal || 0;

    const newXP =
      oldXP + xpEarned;

    const newLevel =
      calculateLevel(newXP);

    user.xpTotal =
      newXP;

    user.level =
      newLevel;

    user.lastActiveAt =
      new Date();

    await user.save();

    // ----------------------------------------------
    // CREATE REWARD
    // ----------------------------------------------

    const reward =
      await Reward.create({
        user: user._id,

        xp: xpEarned,

        reason:
          "Completed Speech Word Challenge",

        game_type:
          "speech_word_challenge",
      });

    // ----------------------------------------------
    // XP DASHBOARD
    // ----------------------------------------------

    const xpProgress =
      getXPProgress(
        user.xpTotal
      );

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Speech attempt and progress recorded successfully",

      data: {
        attempt: {
          id:
            attempt._id,

          game_type:
            attempt.game_type,

          mode:
            attempt.mode,

          language:
            attempt.language,

          item_id:
            attempt.item_id,

          expected_answer:
            attempt.expected_answer,

          recognized_answer:
            attempt.recognized_answer,

          is_correct:
            attempt.is_correct,

          attempt_count:
            attempt.attempt_count,

          duration_seconds:
            attempt.duration_seconds,

          latency_ms:
            attempt.latency_ms,

          createdAt:
            attempt.createdAt,
        },

        progress: {
          id:
            progress._id,

          game_type:
            progress.game_type,

          language:
            progress.language,

          difficulty:
            progress.difficulty,

          mode:
            progress.mode,

          accuracy:
            progress.accuracy,

          items_attempted:
            progress.items_attempted,

          items_correct:
            progress.items_correct,

          time_taken_seconds:
            progress.time_taken_seconds,

          xp_earned:
            progress.xp_earned,
        },

        reward: {
          id:
            reward._id,

          xpEarned,
        },

        xp: {
          total:
            xpProgress.xpTotal,

          level:
            xpProgress.level,

          xpEarnedInLevel:
            xpProgress.xpEarnedInLevel,

          xpToNextLevel:
            xpProgress.xpToNextLevel,
        },
      },
    });
  } catch (error) {
    console.error(
      "Submit speech attempt error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while recording speech attempt",
    });
  }
};

// --------------------------------------------------
// GET MY SPEECH ATTEMPTS
// --------------------------------------------------

const getMySpeechAttempts =
  async (req, res) => {
    try {
      const {
        language,
        mode,
        limit = 50,
      } = req.query;

      const query = {
        user: req.user._id,
      };

      if (
        language &&
        SUPPORTED_LANGUAGES.includes(
          language
        )
      ) {
        query.language =
          language;
      }

      if (
        mode &&
        SUPPORTED_MODES.includes(
          mode
        )
      ) {
        query.mode =
          mode;
      }

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 50,
            1
          ),
          100
        );

      const attempts =
        await SpeechAttempt.find(
          query
        )
          .sort({
            createdAt: -1,
          })
          .limit(
            limitNumber
          );

      return res.status(200).json({
        success: true,

        count:
          attempts.length,

        data: attempts,
      });
    } catch (error) {
      console.error(
        "Get speech attempts error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching speech attempts",
      });
    }
  };

// --------------------------------------------------
// GET SPEECH SUMMARY
// --------------------------------------------------

const getSpeechSummary =
  async (req, res) => {
    try {
      const {
        language,
        mode,
      } = req.query;

      const match = {
        user: req.user._id,
      };

      if (
        language &&
        SUPPORTED_LANGUAGES.includes(
          language
        )
      ) {
        match.language =
          language;
      }

      if (
        mode &&
        SUPPORTED_MODES.includes(
          mode
        )
      ) {
        match.mode =
          mode;
      }

      const result =
        await SpeechAttempt.aggregate([
          {
            $match: match,
          },

          {
            $group: {
              _id: null,

              totalAttempts: {
                $sum: 1,
              },

              correctAttempts: {
                $sum: {
                  $cond: [
                    "$is_correct",
                    1,
                    0,
                  ],
                },
              },

              averageLatencyMs: {
                $avg:
                  "$latency_ms",
              },

              averageDurationSeconds:
                {
                  $avg:
                    "$duration_seconds",
                },
            },
          },
        ]);

      const summary =
        result[0] || {
          totalAttempts: 0,
          correctAttempts: 0,
          averageLatencyMs: 0,
          averageDurationSeconds: 0,
        };

      const accuracy =
        summary.totalAttempts > 0
          ? (
              (summary.correctAttempts /
                summary.totalAttempts) *
              100
            ).toFixed(2)
          : "0.00";

      return res.status(200).json({
        success: true,

        data: {
          totalAttempts:
            summary.totalAttempts,

          correctAttempts:
            summary.correctAttempts,

          incorrectAttempts:
            summary.totalAttempts -
            summary.correctAttempts,

          accuracy:
            Number(accuracy),

          averageLatencyMs:
            Number(
              (
                summary.averageLatencyMs ||
                0
              ).toFixed(2)
            ),

          averageDurationSeconds:
            Number(
              (
                summary.averageDurationSeconds ||
                0
              ).toFixed(2)
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get speech summary error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while calculating speech summary",
      });
    }
  };

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  submitSpeechAttempt,
  getMySpeechAttempts,
  getSpeechSummary,
};
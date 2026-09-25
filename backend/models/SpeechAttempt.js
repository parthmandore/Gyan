const mongoose = require("mongoose");

const speechAttemptSchema = new mongoose.Schema(
  {
    // ----------------------------------------------
    // USER
    // ----------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ----------------------------------------------
    // GAME INFORMATION
    // ----------------------------------------------

    game_type: {
      type: String,
      default: "speech_word_challenge",
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["letters", "words"],
      required: true,
    },

    language: {
      type: String,
      enum: ["en", "hi", "mr"],
      required: true,
    },

    age: {
      type: Number,
      min: 3,
      max: 18,
      required: true,
    },

    // ----------------------------------------------
    // QUESTION / ANSWER
    // ----------------------------------------------

    item_id: {
      type: String,
      required: true,
    },

    expected_answer: {
      type: String,
      required: true,
      trim: true,
    },

    recognized_answer: {
      type: String,
      default: "",
      trim: true,
    },

    // ----------------------------------------------
    // RESULT
    // ----------------------------------------------

    is_correct: {
      type: Boolean,
      required: true,
    },

    attempt_count: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ----------------------------------------------
    // SPEECH PERFORMANCE
    // ----------------------------------------------

    duration_seconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    latency_ms: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ----------------------------------------------
    // STT INFORMATION
    // ----------------------------------------------

    language_returned: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: null,
    },

    stt_error_type: {
      type: String,
      default: "NONE",
    },

    // ----------------------------------------------
    // OPTIONAL SESSION ID
    // ----------------------------------------------

    session_id: {
      type: String,
      default: null,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

// ----------------------------------------------
// INDEXES
// ----------------------------------------------

speechAttemptSchema.index({
  user: 1,
  createdAt: -1,
});

speechAttemptSchema.index({
  user: 1,
  game_type: 1,
});

speechAttemptSchema.index({
  user: 1,
  language: 1,
});

module.exports = mongoose.model(
  "SpeechAttempt",
  speechAttemptSchema
);
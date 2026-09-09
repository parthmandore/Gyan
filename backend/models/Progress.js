const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    game_type: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },

    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    mode: {
      type: String,
      default: null,
    },

    items_attempted: {
      type: Number,
      required: true,
      min: 0,
    },

    items_correct: {
      type: Number,
      required: true,
      min: 0,
    },

    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    time_taken_seconds: {
      type: Number,
      required: true,
      min: 0,
    },

    xp_earned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index({
  user: 1,
  createdAt: -1,
});

progressSchema.index({
  user: 1,
  game_type: 1,
});

module.exports = mongoose.model("Progress", progressSchema);
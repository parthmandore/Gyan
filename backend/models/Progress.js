
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    game_type: {
      type: String,
      required: true,
      trim: true,
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
      validate: {
        validator: Number.isInteger,
        message: "Difficulty must be a whole number",
      },
    },

    mode: {
      type: String,
      default: null,
    },

    items_attempted: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Items attempted must be a whole number",
      },
    },

    items_correct: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return (
            Number.isInteger(value) &&
            value <= this.items_attempted
          );
        },
        message: "Items correct cannot exceed items attempted",
      },
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

progressSchema.index({ user: 1, createdAt: -1 });
progressSchema.index({ user: 1, game_type: 1 });

module.exports = mongoose.model("Progress", progressSchema);
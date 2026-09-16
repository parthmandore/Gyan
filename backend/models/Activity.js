const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    game_type: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      enum: ["en", "hi", "mr"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
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

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({
  game_type: 1,
  language: 1,
  difficulty: 1,
});

module.exports = mongoose.model("Activity", activitySchema);
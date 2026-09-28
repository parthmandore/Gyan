const mongoose = require("mongoose");

const userAchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    badge_id: {
      type: String,
      required: true,
      trim: true,
    },

    earned_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userAchievementSchema.index(
  { user: 1, badge_id: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "UserAchievement",
  userAchievementSchema
);
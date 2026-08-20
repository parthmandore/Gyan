const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    badge_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description_key: {
      type: String,
      required: true,
    },

    criteria: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

module.exports = mongoose.model(
  "Achievement",
  achievementSchema
);
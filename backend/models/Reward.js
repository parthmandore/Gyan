const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    xp: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      required: true,
    },

    game_type: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rewardSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Reward", rewardSchema);
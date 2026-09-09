const User = require("../models/User");
const Reward = require("../models/Reward");

const {
  getXPProgress,
} = require("../services/xpService");

// --------------------------------------------------
// GET REWARDS / XP SUMMARY
// --------------------------------------------------

const getRewardsSummary = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const xpProgress = getXPProgress(
      user.xpTotal
    );

    return res.status(200).json({
      success: true,

      data: {
        xp_total: xpProgress.xpTotal,

        level: xpProgress.level,

        xp_earned_in_level:
          xpProgress.xpEarnedInLevel,

        xp_to_next_level:
          xpProgress.xpToNextLevel,
      },
    });
  } catch (error) {
    console.error(
      "Get rewards summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching rewards summary",
    });
  }
};

// --------------------------------------------------
// GET REWARD HISTORY
// --------------------------------------------------

const getRewardHistory = async (req, res) => {
  try {
    const rewards = await Reward.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    console.error(
      "Get reward history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching reward history",
    });
  }
};

module.exports = {
  getRewardsSummary,
  getRewardHistory,
};
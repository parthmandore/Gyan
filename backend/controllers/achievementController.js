const {
  getUserAchievements,
} = require("../services/achievementService");

// --------------------------------------------------
// GET USER ACHIEVEMENTS
// --------------------------------------------------

const getAchievements = async (req, res) => {
  try {
    const achievements =
      await getUserAchievements(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error(
      "Get achievements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching achievements",
    });
  }
};

module.exports = {
  getAchievements,
};
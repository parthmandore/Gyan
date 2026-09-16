const express = require("express");

const {
  getRewardsSummary,
  getRewardHistory,
} = require("../controllers/rewardController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// XP summary
router.get(
  "/summary",
  authMiddleware,
  getRewardsSummary
);

// Reward history
router.get(
  "/history",
  authMiddleware,
  getRewardHistory
);

module.exports = router;
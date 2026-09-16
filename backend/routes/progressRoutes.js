const express = require("express");

const {
  submitProgress,
  getMyProgress,
  getProgressSummary,
} = require("../controllers/progressController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Submit completed game
router.post(
  "/submit",
  authMiddleware,
  submitProgress
);

// Get current user's progress
router.get(
  "/me",
  authMiddleware,
  getMyProgress
);

// Get current user's progress summary
router.get(
  "/me/summary",
  authMiddleware,
  getProgressSummary
);

module.exports = router;
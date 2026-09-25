const express = require("express");

const {
  submitSpeechAttempt,
  getMySpeechAttempts,
  getSpeechSummary,
} = require("../controllers/speechChallengeController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// SPEECH ATTEMPTS
// --------------------------------------------------

// Record one speech attempt
router.post(
  "/attempt",
  authMiddleware,
  submitSpeechAttempt
);

// Get current user's speech attempts
router.get(
  "/attempts",
  authMiddleware,
  getMySpeechAttempts
);

// Get current user's speech performance summary
router.get(
  "/summary",
  authMiddleware,
  getSpeechSummary
);

module.exports = router;
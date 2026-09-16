const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  updateLanguage,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

// Update logged-in user's profile
router.put(
  "/me",
  authMiddleware,
  updateMyProfile
);

// Update logged-in user's language
router.put(
  "/me/language",
  authMiddleware,
  updateLanguage
);

module.exports = router;
const express = require("express");

const {
  getAchievements,
} = require("../controllers/achievementController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getAchievements
);

module.exports = router;
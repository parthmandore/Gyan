const express = require("express");

const {
    submitProgress,
    getUserProgress,
    getUserProgressSummary,
    getProgressByGame
} = require("../controllers/progressController");

const router = express.Router();

router.post("/submit", submitProgress);

router.get("/user/:userId", getUserProgress);

router.get("/user/:userId/summary", getUserProgressSummary);

router.get("/user/:userId/by-game", getProgressByGame);

module.exports = router;
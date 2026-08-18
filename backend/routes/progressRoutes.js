const express = require("express");

const {
    createProgress,
    getProgress,
    getUserProgress
} = require("../controllers/progressController");

const router = express.Router();

// Save progress
router.post("/", createProgress);

// Get all progress
router.get("/", getProgress);

// Get progress for a specific user
router.get("/user/:userId", getUserProgress);

module.exports = router;
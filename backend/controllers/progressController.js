const Progress = require("../models/Progress");

// Create progress record
const createProgress = async (req, res) => {
    try {
        const {
            user,
            activity,
            score,
            attempts,
            completed
        } = req.body;

        const progress = await Progress.create({
            user,
            activity,
            score,
            attempts,
            completed
        });

        res.status(201).json({
            message: "Progress saved successfully",
            progress
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid progress data",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                )
            });
        }

        res.status(500).json({
            message: "Failed to save progress",
            error: error.message
        });
    }
};

// Get all progress records
const getProgress = async (req, res) => {
    try {
        const progress = await Progress.find()
            .populate("user", "name age language")
            .populate("activity", "title type language");

        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch progress",
            error: error.message
        });
    }
};

// Get progress for one user
const getUserProgress = async (req, res) => {
    try {
        const progress = await Progress.find({
            user: req.params.userId
        })
            .populate("activity", "title type language");

        res.status(200).json(progress);
    } catch (error) {
        res.status(400).json({
            message: "Invalid user ID"
        });
    }
};

module.exports = {
    createProgress,
    getProgress,
    getUserProgress
};
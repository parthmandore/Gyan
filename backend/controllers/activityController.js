const Activity = require("../models/Activity");

// Create an activity
const createActivity = async (req, res) => {
    try {
        const {
            game_type,
            language,
            title,
            description,
            difficulty,
            content
        } = req.body;

        const activity = await Activity.create({
            game_type,
            language,
            title,
            description,
            difficulty,
            content
        });

        res.status(201).json({
            success: true,
            message: "Activity created successfully",
            data: activity
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid activity data",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                )
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create activity",
            error: error.message
        });
    }
};


// Get activities
const getActivities = async (req, res) => {
    try {
        const { language, game_type, difficulty } = req.query;

        const filter = {};

        if (language) {
            filter.language = language;
        }

        if (game_type) {
            filter.game_type = game_type;
        }

        if (difficulty) {
            filter.difficulty = Number(difficulty);
        }

        const activities = await Activity.find(filter);

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: error.message
        });
    }
};


// Get one activity
const getActivityById = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: "Activity not found"
            });
        }

        res.status(200).json({
            success: true,
            data: activity
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid activity ID"
        });
    }
};


module.exports = {
    createActivity,
    getActivities,
    getActivityById
};
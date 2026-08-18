const Activity = require("../models/Activity");

// Create an activity
const createActivity = async (req, res) => {
    try {
        const {
            title,
            type,
            language,
            description,
            difficulty,
            content
        } = req.body;

        const activity = await Activity.create({
            title,
            type,
            language,
            description,
            difficulty,
            content
        });

        res.status(201).json({
            message: "Activity created successfully",
            activity
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid activity data",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                )
            });
        }

        res.status(500).json({
            message: "Failed to create activity",
            error: error.message
        });
    }
};

// Get all activities
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find();

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({
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
                message: "Activity not found"
            });
        }

        res.status(200).json(activity);
    } catch (error) {
        res.status(400).json({
            message: "Invalid activity ID"
        });
    }
};

module.exports = {
    createActivity,
    getActivities,
    getActivityById
};
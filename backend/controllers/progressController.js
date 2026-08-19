const Progress = require("../models/Progress");
const User = require("../models/User");

// Submit progress for a completed game session
const submitProgress = async (req, res) => {
    try {
        const {
            userId,
            game_type,
            difficulty,
            items_attempted,
            items_correct,
            time_taken_seconds
        } = req.body;

        // Check required fields
        if (
            !userId ||
            !game_type ||
            difficulty === undefined ||
            items_attempted === undefined ||
            items_correct === undefined ||
            time_taken_seconds === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All progress fields are required"
            });
        }

        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Validate score
        if (items_correct > items_attempted) {
            return res.status(400).json({
                success: false,
                message: "Items correct cannot be greater than items attempted"
            });
        }

        // Create progress record
        const progress = await Progress.create({
            user: userId,
            game_type,
            difficulty,
            items_attempted,
            items_correct,
            time_taken_seconds
        });

        res.status(201).json({
            success: true,
            message: "Progress submitted successfully",
            data: progress
        });

    } catch (error) {
        console.error("Submit progress error:", error);

        // Invalid MongoDB ID
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Mongoose validation error
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid progress data",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                )
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to submit progress",
            error: error.message
        });
    }
};


// Get all progress for a specific user
const getUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get user's progress
        const progress = await Progress.find({
            user: userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress
        });

    } catch (error) {
        console.error("Get user progress error:", error);

        // Invalid MongoDB ID
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch user progress",
            error: error.message
        });
    }
};

// Get progress summary for a specific user
const getUserProgressSummary = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get all progress records
        const progress = await Progress.find({
            user: userId
        });

        // No progress yet
        if (progress.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No progress available yet",
                data: {
                    total_games: 0,
                    total_questions: 0,
                    correct_answers: 0,
                    accuracy: 0,
                    average_time_seconds: 0
                }
            });
        }

        // Calculate totals
        const totalGames = progress.length;

        const totalQuestions = progress.reduce(
            (total, item) => total + item.items_attempted,
            0
        );

        const correctAnswers = progress.reduce(
            (total, item) => total + item.items_correct,
            0
        );

        const totalTime = progress.reduce(
            (total, item) => total + item.time_taken_seconds,
            0
        );

        // Calculate accuracy
        const accuracy =
            totalQuestions > 0
                ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2))
                : 0;

        // Calculate average time per game
        const averageTimeSeconds =
            Number((totalTime / totalGames).toFixed(2));

        res.status(200).json({
            success: true,
            data: {
                total_games: totalGames,
                total_questions: totalQuestions,
                correct_answers: correctAnswers,
                accuracy: accuracy,
                average_time_seconds: averageTimeSeconds
            }
        });

    } catch (error) {
        console.error("Get progress summary error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to calculate progress summary",
            error: error.message
        });
    }
};
// Get progress grouped by game type for a specific user
const getProgressByGame = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Group progress by game type
        const progressByGame = await Progress.aggregate([
            {
                $match: {
                    user: user._id
                }
            },
            {
                $group: {
                    _id: "$game_type",

                    games_played: {
                        $sum: 1
                    },

                    total_questions: {
                        $sum: "$items_attempted"
                    },

                    correct_answers: {
                        $sum: "$items_correct"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    game_type: "$_id",
                    games_played: 1,
                    total_questions: 1,
                    correct_answers: 1,

                    accuracy: {
                        $cond: [
                            {
                                $gt: ["$total_questions", 0]
                            },
                            {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    "$correct_answers",
                                                    "$total_questions"
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $sort: {
                    games_played: -1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: progressByGame.length,
            data: progressByGame
        });

    } catch (error) {
        console.error("Get progress by game error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch progress by game",
            error: error.message
        });
    }
};
module.exports = {
    submitProgress,
    getUserProgress,
    getUserProgressSummary,
    getProgressByGame
};
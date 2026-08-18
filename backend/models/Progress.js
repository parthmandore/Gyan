const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"]
        },

        activity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            required: [true, "Activity ID is required"]
        },

        score: {
            type: Number,
            required: [true, "Score is required"],
            min: [0, "Score cannot be negative"],
            max: [100, "Score cannot exceed 100"]
        },

        attempts: {
            type: Number,
            default: 1,
            min: [1, "Attempts must be at least 1"]
        },

        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
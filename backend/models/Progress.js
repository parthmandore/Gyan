const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"]
        },

        game_type: {
            type: String,
            required: [true, "Game type is required"],
            trim: true
        },

        difficulty: {
            type: Number,
            required: [true, "Difficulty is required"],
            min: [1, "Difficulty must be at least 1"]
        },

        items_attempted: {
            type: Number,
            required: [true, "Items attempted is required"],
            min: [0, "Items attempted cannot be negative"]
        },

        items_correct: {
            type: Number,
            required: [true, "Items correct is required"],
            min: [0, "Items correct cannot be negative"]
        },

        time_taken_seconds: {
            type: Number,
            required: [true, "Time taken is required"],
            min: [0, "Time cannot be negative"]
        }
    },
    {
        timestamps: true
    }
);

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
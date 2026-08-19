const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        game_type: {
            type: String,
            required: [true, "Game type is required"],
            trim: true
        },

        language: {
            type: String,
            required: [true, "Language is required"],
            enum: {
                values: ["en", "hi", "mr"],
                message: "Language must be en, hi, or mr"
            }
        },

        title: {
            type: String,
            required: [true, "Activity title is required"],
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        difficulty: {
            type: Number,
            required: [true, "Difficulty is required"],
            min: [1, "Difficulty must be at least 1"]
        },

        content: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "Activity content is required"]
        }
    },
    {
        timestamps: true
    }
);

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
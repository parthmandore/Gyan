const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Activity title is required"],
            trim: true
        },

        type: {
            type: String,
            required: [true, "Activity type is required"],
            enum: {
                values: ["alphabet", "word", "reading", "game"],
                message: "Invalid activity type"
            }
        },

        language: {
            type: String,
            required: [true, "Language is required"],
            enum: {
                values: ["English", "Hindi", "Marathi"],
                message: "Language must be English, Hindi, or Marathi"
            }
        },

        description: {
            type: String,
            trim: true
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "easy"
        },

        content: {
            type: String,
            required: [true, "Activity content is required"],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
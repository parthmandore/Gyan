const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"]
        },

        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [6, "Age must be at least 6"],
            max: [10, "Age must not exceed 10"]
        },

        language: {
            type: String,
            required: [true, "Language is required"],
            enum: {
                values: ["en", "hi", "mr"],
                message: "Language must be en, hi, or mr"
            }
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
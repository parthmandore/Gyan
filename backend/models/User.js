const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ------------------------------------------
    // BASIC INFORMATION
    // ------------------------------------------

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },

    // ------------------------------------------
    // ROLE
    // ------------------------------------------

    role: {
      type: String,
      enum: ["student", "parent", "teacher"],
      required: true,
      default: "student",
    },

    // ------------------------------------------
    // STUDENT INFORMATION
    // ------------------------------------------

    age: {
      type: Number,
      min: 6,
      max: 10,
      default: null,
    },

    language: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },

    // ------------------------------------------
    // LEARNING DATA
    // ------------------------------------------

    xpTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    streak: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastActiveAt: {
      type: Date,
      default: null,
    },

    // ------------------------------------------
    // PARENT / TEACHER RELATIONSHIPS
    // ------------------------------------------

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
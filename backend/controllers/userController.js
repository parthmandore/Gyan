
const User = require("../models/User");

const VALID_LANGUAGES = ["en", "hi", "mr"];

// Get current user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// Update current user's profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, age, language } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name must be a non-empty string",
        });
      }

      user.name = name.trim();
    }

    if (age !== undefined) {
      const parsedAge = Number(age);

      if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        return res.status(400).json({
          success: false,
          message: "Age must be a valid whole number",
        });
      }

      if (user.role === "student" && (parsedAge < 5 || parsedAge > 10)) {
        return res.status(400).json({
          success: false,
          message: "Student age must be between 5 and 10",
        });
      }

      user.age = parsedAge;
    }

    if (language !== undefined) {
      if (!VALID_LANGUAGES.includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Invalid language. Use en, hi or mr",
        });
      }

      user.language = language;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          language: user.language,
          xpTotal: user.xpTotal,
          level: user.level,
          streak: user.streak,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// Update only the preferred language
const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language is required",
      });
    }

    if (!VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Use en, hi or mr",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.language = language;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Language updated successfully",
      data: {
        language: user.language,
      },
    });
  } catch (error) {
    console.error("Update language error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating language",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateLanguage,
};
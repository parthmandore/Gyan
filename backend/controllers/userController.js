const User = require("../models/User");

// Get current user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
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
    const {
      name,
      age,
      language,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    // Update age if provided
    if (age !== undefined) {
      if (user.role === "student") {
        if (age < 6 || age > 10) {
          return res.status(400).json({
            success: false,
            message: "Student age must be between 6 and 10",
          });
        }
      }

      user.age = age;
    }

    // Update language if provided
    if (language !== undefined) {
      const validLanguages = ["en", "hi", "mr"];

      if (!validLanguages.includes(language)) {
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

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// Update only language
const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    const validLanguages = ["en", "hi", "mr"];

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language is required",
      });
    }

    if (!validLanguages.includes(language)) {
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
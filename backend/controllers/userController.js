const User = require("../models/User");

// Create a new user
const createUser = async (req, res) => {
    try {
        const { name, age, language } = req.body;

        const user = await User.create({
            name,
            age,
            language
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid user data",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                )
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
};


// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};


// Get a single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }
};


module.exports = {
    createUser,
    getUsers,
    getUserById
};
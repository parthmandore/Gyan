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
            message: "User created successfully",
            user
        });
    } catch (error) {
        // Mongoose validation error
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid user data",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                )
            });
        }

        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
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
                message: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById
};
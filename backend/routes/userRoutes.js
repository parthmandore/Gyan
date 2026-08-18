const express = require("express");

const {
    createUser,
    getUsers,
    getUserById
} = require("../controllers/userController");

const router = express.Router();

// Create a user
router.post("/", createUser);

// Get all users
router.get("/", getUsers);

// Get a user by ID
router.get("/:id", getUserById);

module.exports = router;
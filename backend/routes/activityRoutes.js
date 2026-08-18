const express = require("express");

const {
    createActivity,
    getActivities,
    getActivityById
} = require("../controllers/activityController");

const router = express.Router();

router.post("/", createActivity);

router.get("/", getActivities);

router.get("/:id", getActivityById);

module.exports = router;
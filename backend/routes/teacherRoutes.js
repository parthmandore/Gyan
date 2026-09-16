const express = require("express");

const {
  getStudents,
  getTeacherDashboard,
  linkStudent,
} = require("../controllers/teacherController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("teacher"),
  getTeacherDashboard
);

router.get(
  "/students",
  authMiddleware,
  roleMiddleware("teacher"),
  getStudents
);

router.post(
  "/students/link",
  authMiddleware,
  roleMiddleware("teacher"),
  linkStudent
);

module.exports = router;
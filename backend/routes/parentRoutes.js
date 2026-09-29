
const express = require("express");

const {
  getChildren,
  getParentDashboard,
  getChildAnalytics,
  linkChild,
} = require("../controllers/parentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Parent dashboard
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("parent"),
  getParentDashboard
);

// All children linked to the logged-in parent
router.get(
  "/children",
  authMiddleware,
  roleMiddleware("parent"),
  getChildren
);

// Analytics for a specific linked child
router.get(
  "/children/:childId/analytics",
  authMiddleware,
  roleMiddleware("parent"),
  getChildAnalytics
);

// Link a child using their email
router.post(
  "/children/link",
  authMiddleware,
  roleMiddleware("parent"),
  linkChild
);

module.exports = router;
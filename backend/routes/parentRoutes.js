const express = require("express");

const {
  getChildren,
  getParentDashboard,
  linkChild,
} = require("../controllers/parentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("parent"),
  getParentDashboard
);

router.get(
  "/children",
  authMiddleware,
  roleMiddleware("parent"),
  getChildren
);

router.post(
  "/children/link",
  authMiddleware,
  roleMiddleware("parent"),
  linkChild
);

module.exports = router;
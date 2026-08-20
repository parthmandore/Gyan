const express = require("express");

const {
  getSpeechConfigController,
  synthesizeSpeechController,
} = require("../controllers/speechController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// SPEECH CONFIG
// --------------------------------------------------

router.get(
  "/config",
  authMiddleware,
  getSpeechConfigController
);

// --------------------------------------------------
// TEXT TO SPEECH
// --------------------------------------------------

router.post(
  "/synthesize",
  authMiddleware,
  synthesizeSpeechController
);

module.exports = router;
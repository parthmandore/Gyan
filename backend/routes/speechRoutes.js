const express = require("express");
const multer = require("multer");

const {
  getSpeechConfigController,
  synthesizeSpeechController,
  transcribeSpeechController,
} = require("../controllers/speechController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// MULTER CONFIGURATION
// --------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

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

// --------------------------------------------------
// SPEECH TO TEXT - WHISPER
// --------------------------------------------------

router.post(
  "/transcribe",
  authMiddleware,
  upload.single("file"),
  transcribeSpeechController
);

module.exports = router;
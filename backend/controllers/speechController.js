
const {
  SUPPORTED_LANGUAGES,
  getSpeechConfig,
  synthesizeSpeech,
  transcribeSpeech,
} = require("../services/speechService");

// --------------------------------------------------
// ERROR HANDLING
// --------------------------------------------------

const isServiceUnavailable = (error) => {
  return (
    error?.code === "AI_SERVICE_UNAVAILABLE" ||
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    /ECONNREFUSED|ECONNRESET|ENOTFOUND|fetch failed|network error|timeout|timed out|service unavailable/i.test(
      error?.message || ""
    )
  );
};

const handleSpeechError = (res, error, operation) => {
  console.error(`${operation} error:`, error.message);

  const unavailable = isServiceUnavailable(error);

  return res.status(unavailable ? 503 : 400).json({
    success: false,
    message: unavailable
      ? `${operation} service is currently unavailable. Please try again later.`
      : error.message || `${operation} failed`,
  });
};

// --------------------------------------------------
// GET SPEECH CONFIGURATION
// GET /api/speech/config
// --------------------------------------------------

const getSpeechConfigController = async (req, res) => {
  try {
    const language = req.query.lang || "en";

    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language. Use en, hi or mr",
      });
    }

    const config = await getSpeechConfig(language);

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Speech configuration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch speech configuration",
    });
  }
};

// --------------------------------------------------
// TEXT-TO-SPEECH
// POST /api/speech/synthesize
// Body: { "text": "...", "language": "en" }
// --------------------------------------------------

const synthesizeSpeechController = async (req, res) => {
  try {
    const { text, language = "en" } = req.body || {};

    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language. Use en, hi or mr",
      });
    }

    const result = await synthesizeSpeech({
      text,
      language,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleSpeechError(res, error, "Speech synthesis");
  }
};

// --------------------------------------------------
// SPEECH-TO-TEXT
// POST /api/speech/transcribe
// Multipart fields: file, language
// --------------------------------------------------

const transcribeSpeechController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required in the 'file' field",
      });
    }

    const language = req.body?.language || "en";

    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language. Use en, hi or mr",
      });
    }

    const result = await transcribeSpeech({
      audioBuffer: req.file.buffer,
      filename: req.file.originalname || "speech.wav",
      mimeType: req.file.mimetype || "audio/wav",
      language,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleSpeechError(res, error, "Speech recognition");
  }
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  getSpeechConfigController,
  synthesizeSpeechController,
  transcribeSpeechController,
};
const {
  SUPPORTED_LANGUAGES,
  getSpeechConfig,
  synthesizeSpeech,
  transcribeSpeech,
} = require("../services/speechService");

// --------------------------------------------------
// GET SPEECH CONFIGURATION
// --------------------------------------------------

const getSpeechConfigController = async (
  req,
  res
) => {
  try {
    const language =
      req.query.lang || "en";

    // Validate language
    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,

        message:
          "Unsupported language. Use en, hi or mr",
      });
    }

    const config =
      await getSpeechConfig(language);

    return res.status(200).json({
      success: true,

      data: config,
    });
  } catch (error) {
    console.error(
      "Speech config error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching speech configuration",
    });
  }
};

// --------------------------------------------------
// SYNTHESIZE SPEECH
// --------------------------------------------------

const synthesizeSpeechController =
  async (req, res) => {
    try {
      const {
        text,
        language,
      } = req.body;

      const selectedLanguage =
        language ||
        "en";

      // Validate language
      if (
        !SUPPORTED_LANGUAGES[
          selectedLanguage
        ]
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Unsupported language. Use en, hi or mr",
        });
      }

      const result =
        await synthesizeSpeech({
          text,

          language:
            selectedLanguage,
        });

      return res.status(200).json({
        success: true,

        data: result,
      });
    } catch (error) {
      console.error(
        "Speech synthesis error:",
        error
      );

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// --------------------------------------------------
// TRANSCRIBE SPEECH USING WHISPER
// --------------------------------------------------

const transcribeSpeechController =
  async (req, res) => {
    try {
      // Multer will place the uploaded
      // audio file in req.file.
      if (!req.file) {
        return res.status(400).json({
          success: false,

          message:
            "Audio file is required",
        });
      }

      const language =
        req.body.language ||
        "en";

      // Validate language
      if (
        !SUPPORTED_LANGUAGES[
          language
        ]
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Unsupported language. Use en, hi or mr",
        });
      }

      const result =
        await transcribeSpeech({
          audioBuffer:
            req.file.buffer,

          filename:
            req.file.originalname ||
            "speech.wav",

          mimeType:
            req.file.mimetype ||
            "audio/wav",

          language,
        });

      return res.status(200).json({
        success: true,

        data: result,
      });
    } catch (error) {
      console.error(
        "Speech transcription error:",
        error
      );

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
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
const {
  SUPPORTED_LANGUAGES,
  getSpeechConfig,
  synthesizeSpeech,
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

    if (
      !SUPPORTED_LANGUAGES[language]
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported language. Use en, hi or mr",
      });
    }

    const config =
      getSpeechConfig(language);

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
        req.user?.language ||
        "en";

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
        message: error.message,
      });
    }
  };

module.exports = {
  getSpeechConfigController,
  synthesizeSpeechController,
};
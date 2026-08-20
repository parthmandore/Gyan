// --------------------------------------------------
// SPEECH SERVICE
// --------------------------------------------------

// Supported languages
const SUPPORTED_LANGUAGES = {
  en: {
    code: "en",
    name: "English",
    ttsLanguage: "en-IN",
    recognitionLanguage: "en-IN",
  },

  hi: {
    code: "hi",
    name: "Hindi",
    ttsLanguage: "hi-IN",
    recognitionLanguage: "hi-IN",
  },

  mr: {
    code: "mr",
    name: "Marathi",
    ttsLanguage: "mr-IN",
    recognitionLanguage: "mr-IN",
  },
};

// --------------------------------------------------
// GET SPEECH CONFIGURATION
// --------------------------------------------------

const getSpeechConfig = (language = "en") => {
  const config =
    SUPPORTED_LANGUAGES[language];

  if (!config) {
    throw new Error(
      "Unsupported speech language"
    );
  }

  return {
    language: config.code,
    languageName: config.name,

    tts: {
      language: config.ttsLanguage,
      enabled: true,
    },

    recognition: {
      language:
        config.recognitionLanguage,
      enabled: true,
    },

    ai: {
      enabled: false,
      provider: "tts-gan",
      status: "not_connected",
    },
  };
};

// --------------------------------------------------
// VALIDATE SPEECH TEXT
// --------------------------------------------------

const validateSpeechText = (text) => {
  if (!text) {
    return {
      valid: false,
      message: "Speech text is required",
    };
  }

  if (typeof text !== "string") {
    return {
      valid: false,
      message: "Speech text must be a string",
    };
  }

  const cleanedText = text.trim();

  if (!cleanedText) {
    return {
      valid: false,
      message: "Speech text cannot be empty",
    };
  }

  // Prevent excessively large requests
  if (cleanedText.length > 500) {
    return {
      valid: false,
      message:
        "Speech text cannot exceed 500 characters",
    };
  }

  return {
    valid: true,
    text: cleanedText,
  };
};

// --------------------------------------------------
// SPEECH SYNTHESIS
// --------------------------------------------------

// This is intentionally a placeholder.
//
// Later this function will call the actual
// TTS-GAN / TTS engine and return an audio URL.

const synthesizeSpeech = async ({
  text,
  language,
}) => {
  const validation =
    validateSpeechText(text);

  if (!validation.valid) {
    throw new Error(
      validation.message
    );
  }

  const config =
    getSpeechConfig(language);

  return {
    text: validation.text,

    language: config.language,

    languageName:
      config.languageName,

    audioUrl: null,

    provider: "tts-gan",

    status: "not_connected",

    message:
      "TTS-GAN service is not connected yet",
  };
};

module.exports = {
  SUPPORTED_LANGUAGES,
  getSpeechConfig,
  validateSpeechText,
  synthesizeSpeech,
};
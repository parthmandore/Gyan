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
// TTS-GAN CONFIGURATION
// --------------------------------------------------

const TTS_GAN_BASE_URL =
  process.env.TTS_GAN_BASE_URL ||
  "http://localhost:8000";

// --------------------------------------------------
// GET SPEECH CONFIGURATION
// --------------------------------------------------

const getSpeechConfig = async (language = "en") => {
  const config = SUPPORTED_LANGUAGES[language];

  if (!config) {
    throw new Error(
      "Unsupported speech language"
    );
  }

  // Check actual GAN service status
  const health = await checkTTSGanHealth();

  return {
    language: config.code,

    languageName: config.name,

    tts: {
      language: config.ttsLanguage,

      enabled: health.connected,

      provider: "tts-gan",

      endpoint: "/tts",
    },

    recognition: {
      language:
        config.recognitionLanguage,

      enabled: true,
    },

    ai: {
      enabled: health.connected,

      provider: "tts-gan",

      status: health.status,
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
      message:
        "Speech text must be a string",
    };
  }

  const cleanedText = text.trim();

  if (!cleanedText) {
    return {
      valid: false,
      message:
        "Speech text cannot be empty",
    };
  }

  // Maximum text length
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
// VALIDATE LANGUAGE
// --------------------------------------------------

const validateLanguage = (language) => {
  if (!SUPPORTED_LANGUAGES[language]) {
    return {
      valid: false,
      message:
        "Unsupported language. Use en, hi or mr",
    };
  }

  return {
    valid: true,
  };
};

// --------------------------------------------------
// CALL TTS-GAN FASTAPI SERVICE
// --------------------------------------------------

const callTTSGan = async ({
  text,
  language,
}) => {
  const endpoint =
    `${TTS_GAN_BASE_URL}/tts`;

  try {
    const response = await fetch(
      endpoint,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          text,
          language,
        }),
      }
    );

    let data;

    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error(
        "TTS-GAN returned an invalid response"
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          `TTS-GAN request failed with status ${response.status}`
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          "TTS-GAN synthesis failed"
      );
    }

    return data;
  } catch (error) {
    console.error(
      "TTS-GAN connection error:",
      error.message
    );

    throw new Error(
      `Unable to connect to TTS-GAN service: ${error.message}`
    );
  }
};

// --------------------------------------------------
// SPEECH SYNTHESIS
// --------------------------------------------------

const synthesizeSpeech = async ({
  text,
  language,
}) => {
  // Validate text
  const validation =
    validateSpeechText(text);

  if (!validation.valid) {
    throw new Error(
      validation.message
    );
  }

  // Validate language
  const languageValidation =
    validateLanguage(language);

  if (!languageValidation.valid) {
    throw new Error(
      languageValidation.message
    );
  }

  const config =
    SUPPORTED_LANGUAGES[language];

  // Call GAN TTS service
  const ttsResponse =
    await callTTSGan({
      text: validation.text,
      language: config.code,
    });

  // ------------------------------------------------
  // BUILD AUDIO URL
  // ------------------------------------------------

  let audioUrl =
    ttsResponse.audio_url ||
    null;

  /*
   * FastAPI may return:
   *
   * /audio/uuid.wav
   *
   * Convert it to:
   *
   * http://localhost:8000/audio/uuid.wav
   */

  if (
    audioUrl &&
    audioUrl.startsWith("/")
  ) {
    audioUrl =
      `${TTS_GAN_BASE_URL}${audioUrl}`;
  }

  // ------------------------------------------------
  // RETURN RESULT
  // ------------------------------------------------

  return {
    text: validation.text,

    language: config.code,

    languageName: config.name,

    audioFile:
      ttsResponse.audio_file ||
      null,

    audioUrl,

    provider: "tts-gan",

    status: audioUrl
      ? "success"
      : "failed",

    message: audioUrl
      ? "Speech synthesized successfully"
      : "TTS-GAN did not return an audio URL",
  };
};

// --------------------------------------------------
// HEALTH CHECK FOR TTS-GAN
// --------------------------------------------------

const checkTTSGanHealth = async () => {
  try {
    const response = await fetch(
      `${TTS_GAN_BASE_URL}/health`
    );

    if (!response.ok) {
      return {
        connected: false,
        status: "unhealthy",
      };
    }

    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    return {
      connected: true,
      status: "healthy",
      data,
    };
  } catch (error) {
    return {
      connected: false,
      status: "unreachable",
      message: error.message,
    };
  }
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  SUPPORTED_LANGUAGES,

  getSpeechConfig,

  validateSpeechText,

  synthesizeSpeech,

  checkTTSGanHealth,
};
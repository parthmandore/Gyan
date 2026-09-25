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
// FASTAPI WHISPER CONFIGURATION
// --------------------------------------------------

const WHISPER_BASE_URL =
  process.env.WHISPER_BASE_URL ||
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

  const whisperHealth =
    await checkWhisperHealth();

  return {
    language: config.code,

    languageName: config.name,

    // TTS will be connected to the
    // multilingual TTS API later.
    tts: {
      language: config.ttsLanguage,

      enabled: true,

      provider: "multilingual-tts",

      endpoint: "/synthesize",
    },

    // Speech-to-Text
    recognition: {
      language:
        config.recognitionLanguage,

      enabled:
        whisperHealth.connected,

      provider: "openai-whisper",

      endpoint: "/speech/transcribe",
    },

    ai: {
      enabled:
        whisperHealth.connected,

      provider: "openai-whisper",

      status: whisperHealth.status,
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
// WHISPER STT - TRANSCRIBE AUDIO
// --------------------------------------------------

const transcribeSpeech = async ({
  audioBuffer,
  filename = "speech.wav",
  mimeType = "audio/wav",
  language,
}) => {
  // Validate audio
  if (!audioBuffer) {
    throw new Error(
      "Audio file is required"
    );
  }

  if (!Buffer.isBuffer(audioBuffer)) {
    throw new Error(
      "Invalid audio file"
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

  const endpoint =
    `${WHISPER_BASE_URL}/speech/transcribe`;

  try {
    const formData = new FormData();

    const audioBlob = new Blob(
      [audioBuffer],
      {
        type: mimeType,
      }
    );

    formData.append(
      "file",
      audioBlob,
      filename
    );

    formData.append(
      "language",
      language
    );

    const response = await fetch(
      endpoint,
      {
        method: "POST",
        body: formData,
      }
    );

    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error(
        "Whisper FastAPI returned an invalid response"
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          `Whisper request failed with status ${response.status}`
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          "Whisper transcription failed"
      );
    }

    // Keep the same field names used by
    // the existing FastAPI/frontend contract.
    return {
      success: true,

      recognized_text:
        data.recognized_text || "",

      language_used:
        data.language_used ||
        language,

      is_empty:
        data.is_empty ?? false,

      provider: "openai-whisper",
    };
  } catch (error) {
    console.error(
      "Whisper FastAPI connection error:",
      error.message
    );

    throw new Error(
      `Unable to connect to Whisper FastAPI service: ${error.message}`
    );
  }
};

// --------------------------------------------------
// WHISPER HEALTH CHECK
// --------------------------------------------------

const checkWhisperHealth = async () => {
  try {
    const response = await fetch(
      `${WHISPER_BASE_URL}/health`
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
// TEMPORARY TTS
// --------------------------------------------------
// GAN TTS has been removed.
// This will be replaced with the selected
// multilingual TTS API.
// --------------------------------------------------

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

  const languageValidation =
    validateLanguage(language);

  if (!languageValidation.valid) {
    throw new Error(
      languageValidation.message
    );
  }

  throw new Error(
    "Multilingual TTS API is not configured yet"
  );
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  SUPPORTED_LANGUAGES,

  getSpeechConfig,

  validateSpeechText,

  validateLanguage,

  transcribeSpeech,

  checkWhisperHealth,

  synthesizeSpeech,
};
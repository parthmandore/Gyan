
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

const normalizeBaseUrl = (url) => url.replace(/\/+$/, "");

const WHISPER_BASE_URL = normalizeBaseUrl(
  process.env.WHISPER_BASE_URL || "http://localhost:8000"
);

const AI_SERVICE_URL = normalizeBaseUrl(
  process.env.AI_SERVICE_URL || "http://localhost:8000"
);

const AI_TIMEOUT = Number(process.env.AI_TIMEOUT || 60000);

// --------------------------------------------------
// ERROR HANDLING
// --------------------------------------------------

const isServiceUnavailable = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    /ECONNREFUSED|ECONNRESET|ENOTFOUND|fetch failed|network error|timeout|timed out|service unavailable/i.test(
      error?.message || ""
    )
  );
};

const createServiceError = (serviceName, error) => {
  const unavailable = isServiceUnavailable(error);
  const message = unavailable
    ? `${serviceName} service unavailable: ${error.message}`
    : error.message;

  const serviceError = new Error(message);
  serviceError.code = unavailable
    ? "AI_SERVICE_UNAVAILABLE"
    : "AI_SERVICE_ERROR";

  return serviceError;
};

// --------------------------------------------------
// VALIDATE SPEECH TEXT
// --------------------------------------------------

const validateSpeechText = (text) => {
  if (typeof text !== "string" || !text.trim()) {
    return {
      valid: false,
      message: "Speech text is required and must not be empty",
    };
  }

  const cleanedText = text.trim();

  if (cleanedText.length > 500) {
    return {
      valid: false,
      message: "Speech text cannot exceed 500 characters",
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
      message: "Unsupported language. Use en, hi or mr",
    };
  }

  return { valid: true };
};

// --------------------------------------------------
// GET SPEECH CONFIGURATION
// --------------------------------------------------

const getSpeechConfig = async (language = "en") => {
  const config = SUPPORTED_LANGUAGES[language];

  if (!config) {
    throw new Error("Unsupported speech language");
  }

  const whisperHealth = await checkWhisperHealth();

  return {
    language: config.code,
    languageName: config.name,
    tts: {
      language: config.ttsLanguage,
      enabled: true,
      provider: "gan-tts",
      endpoint: "/tts",
    },
    recognition: {
      language: config.recognitionLanguage,
      enabled: whisperHealth.connected,
      provider: "openai-whisper",
      endpoint: "/speech/transcribe",
    },
    ai: {
      enabled: whisperHealth.connected,
      provider: "openai-whisper",
      status: whisperHealth.status,
    },
  };
};

// --------------------------------------------------
// WHISPER STT - TRANSCRIBE AUDIO
// --------------------------------------------------

const transcribeSpeech = async ({
  audioBuffer,
  filename = "speech.wav",
  mimeType = "audio/wav",
  language = "en",
}) => {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new Error("A valid audio file is required");
  }

  const languageValidation = validateLanguage(language);

  if (!languageValidation.valid) {
    throw new Error(languageValidation.message);
  }

  try {
    const formData = new FormData();

    const audioBlob = new Blob([audioBuffer], {
      type: mimeType,
    });

    formData.append("file", audioBlob, filename);
    formData.append("language", language);

    const response = await fetch(
      `${WHISPER_BASE_URL}/speech/transcribe`,
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(AI_TIMEOUT),
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Whisper service returned an invalid response");
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          `Whisper request failed with status ${response.status}`
      );
    }

    if (data?.success !== true) {
      throw new Error(
        data?.message || "Whisper transcription failed"
      );
    }

    return {
      success: true,
      recognized_text: data.recognized_text || "",
      language_used: data.language_used || language,
      is_empty: data.is_empty ?? false,
      provider: "openai-whisper",
    };
  } catch (error) {
    console.error("Whisper error:", error.message);
    throw createServiceError("Whisper", error);
  }
};

// --------------------------------------------------
// WHISPER HEALTH CHECK
// --------------------------------------------------

const checkWhisperHealth = async () => {
  try {
    const response = await fetch(`${WHISPER_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        connected: false,
        status: "unhealthy",
      };
    }

    let data = null;

    try {
      data = await response.json();
    } catch {
      // Health endpoint may return plain text.
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
// GAN TTS - SYNTHESIZE SPEECH
// --------------------------------------------------

const synthesizeSpeech = async ({
  text,
  language = "en",
}) => {
  const textValidation = validateSpeechText(text);

  if (!textValidation.valid) {
    throw new Error(textValidation.message);
  }

  const languageValidation = validateLanguage(language);

  if (!languageValidation.valid) {
    throw new Error(languageValidation.message);
  }

  try {
    const response = await fetch(`${AI_SERVICE_URL}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: textValidation.text,
        language,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("GAN TTS service returned invalid JSON");
    }

    if (!response.ok || data?.success === false) {
      throw new Error(
        data?.detail ||
          data?.message ||
          `GAN TTS failed with status ${response.status}`
      );
    }

    if (typeof data?.audio_url !== "string" || !data.audio_url.trim()) {
      throw new Error(
        "GAN TTS response is missing the audio_url field"
      );
    }

    const returnedAudioUrl = data.audio_url.trim();

    const audioUrl = /^https?:\/\//i.test(returnedAudioUrl)
      ? returnedAudioUrl
      : `${AI_SERVICE_URL}/${returnedAudioUrl.replace(/^\/+/, "")}`;

    return {
      success: true,
      language: data.language || language,
      audio_file: data.audio_file || null,
      audio_url: audioUrl,
      provider: "gan-tts",
    };
  } catch (error) {
    console.error("GAN TTS error:", error.message);
    throw createServiceError("GAN TTS", error);
  }
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
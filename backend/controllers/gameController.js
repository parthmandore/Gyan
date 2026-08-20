const Activity = require("../models/Activity");

// --------------------------------------------------
// GAME REGISTRY
// --------------------------------------------------

const GAMES = [
  {
    id: "alphabet_matching",
    title: "Alphabet Matching",
    description: "Match the correct letters and improve letter recognition.",
    supportedLanguages: ["en", "hi", "mr"],
  },
  {
    id: "capital_small_match",
    title: "Capital & Small Match",
    description: "Match capital letters with their lowercase partners.",
    supportedLanguages: ["en"],
  },
  {
    id: "vowel_matra_match",
    title: "Vowel & Matra Match",
    description: "Match vowels with their correct matra forms.",
    supportedLanguages: ["hi", "mr"],
  },
];

// --------------------------------------------------
// GAME CONFIGURATION
// --------------------------------------------------

const GAME_CONFIGS = {
  alphabet_matching: {
    game_type: "alphabet_matching",
    available_difficulties: [1, 2, 3, 4, 5],
    time_limit_seconds: 10,
    items_per_session: 10,
  },

  capital_small_match: {
    game_type: "capital_small_match",
    available_difficulties: [1],
    time_limit_seconds: null,
    items_per_session: 3,
  },

  vowel_matra_match: {
    game_type: "vowel_matra_match",
    available_difficulties: [1, 2, 3],
    time_limit_seconds: null,
    items_per_session: 10,
  },
};

// --------------------------------------------------
// LANGUAGE DATA
// --------------------------------------------------

const LANGUAGE_DATA = {
  en: {
    letters: [
      "A", "B", "C", "D", "E", "F", "G",
      "H", "I", "J", "K", "L", "M", "N",
      "O", "P", "Q", "R", "S", "T", "U",
      "V", "W", "X", "Y", "Z",
    ],

    confusableMap: {
      B: "D",
      D: "B",
      P: "Q",
      Q: "P",
      M: "W",
      W: "M",
      N: "U",
      U: "N",
    },
  },

  hi: {
    letters: [
      "अ", "आ", "इ", "ई", "उ", "ऊ",
      "ऋ", "ए", "ऐ", "ओ", "औ", "अं",
      "अः", "क", "ख", "ग", "घ", "ङ",
      "च", "छ", "ज", "झ", "ञ", "ट",
      "ठ", "ड", "ढ", "ण", "त", "थ",
      "द", "ध", "न", "प", "फ", "ब",
      "भ", "म", "य", "र", "ल", "व",
      "श", "ष", "स", "ह", "क्ष",
      "त्र", "ज्ञ",
    ],

    confusableMap: {
      ब: "व",
      व: "ब",
      घ: "ध",
      ध: "घ",
      म: "भ",
      भ: "म",
    },
  },

  mr: {
    letters: [
      "अ", "आ", "इ", "ई", "उ", "ऊ",
      "ऋ", "ए", "ऐ", "ओ", "औ", "अं",
      "अः", "क", "ख", "ग", "घ", "ङ",
      "च", "छ", "ज", "झ", "ञ", "ट",
      "ठ", "ड", "ढ", "ण", "त", "थ",
      "द", "ध", "न", "प", "फ", "ब",
      "भ", "म", "य", "र", "ल", "व",
      "श", "ष", "स", "ह", "ळ", "क्ष",
      "ज्ञ",
    ],

    confusableMap: {
      ब: "व",
      व: "ब",
      घ: "ध",
      ध: "घ",
      म: "भ",
      भ: "म",
      ल: "ळ",
      ळ: "ल",
    },
  },
};

// --------------------------------------------------
// HINDI / MARATHI VOWEL-MATRA DATA
// --------------------------------------------------

const VOWEL_MATRA_DATA = {
  hi: [
    {
      vowel: "अ",
      matraForm: "क",
      vowelName: "अ",
      matraName: "अकार",
    },
    {
      vowel: "आ",
      matraForm: "का",
      vowelName: "आ",
      matraName: "आकार",
    },
    {
      vowel: "इ",
      matraForm: "कि",
      vowelName: "इ",
      matraName: "इकार",
    },
    {
      vowel: "ई",
      matraForm: "की",
      vowelName: "ई",
      matraName: "ईकार",
    },
    {
      vowel: "उ",
      matraForm: "कु",
      vowelName: "उ",
      matraName: "उकार",
    },
    {
      vowel: "ऊ",
      matraForm: "कू",
      vowelName: "ऊ",
      matraName: "ऊकार",
    },
    {
      vowel: "ऋ",
      matraForm: "कृ",
      vowelName: "ऋ",
      matraName: "ऋकार",
    },
    {
      vowel: "ए",
      matraForm: "के",
      vowelName: "ए",
      matraName: "एकार",
    },
    {
      vowel: "ऐ",
      matraForm: "कै",
      vowelName: "ऐ",
      matraName: "ऐकार",
    },
    {
      vowel: "ओ",
      matraForm: "को",
      vowelName: "ओ",
      matraName: "ओकार",
    },
    {
      vowel: "औ",
      matraForm: "कौ",
      vowelName: "औ",
      matraName: "औकार",
    },
  ],

  mr: [
    {
      vowel: "अ",
      matraForm: "क",
      vowelName: "अ",
      matraName: "अकार",
    },
    {
      vowel: "आ",
      matraForm: "का",
      vowelName: "आ",
      matraName: "आकार",
    },
    {
      vowel: "इ",
      matraForm: "कि",
      vowelName: "इ",
      matraName: "इकार",
    },
    {
      vowel: "ई",
      matraForm: "की",
      vowelName: "ई",
      matraName: "ईकार",
    },
    {
      vowel: "उ",
      matraForm: "कु",
      vowelName: "उ",
      matraName: "उकार",
    },
    {
      vowel: "ऊ",
      matraForm: "कू",
      vowelName: "ऊ",
      matraName: "ऊकार",
    },
    {
      vowel: "ऋ",
      matraForm: "कृ",
      vowelName: "ऋ",
      matraName: "ऋकार",
    },
    {
      vowel: "ए",
      matraForm: "के",
      vowelName: "ए",
      matraName: "एकार",
    },
    {
      vowel: "ऐ",
      matraForm: "कै",
      vowelName: "ऐ",
      matraName: "ऐकार",
    },
    {
      vowel: "ओ",
      matraForm: "को",
      vowelName: "ओ",
      matraName: "ओकार",
    },
    {
      vowel: "औ",
      matraForm: "कौ",
      vowelName: "औ",
      matraName: "औकार",
    },
  ],
};

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

const shuffleArray = (array) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [result[i], result[randomIndex]] = [
      result[randomIndex],
      result[i],
    ];
  }

  return result;
};

// --------------------------------------------------
// GET ALL GAMES
// --------------------------------------------------

const getGames = async (req, res) => {
  try {
    const { lang = "en" } = req.query;

    if (!["en", "hi", "mr"].includes(lang)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Use en, hi or mr",
      });
    }

    const availableGames = GAMES.filter((game) =>
      game.supportedLanguages.includes(lang)
    );

    return res.status(200).json({
      success: true,
      data: availableGames,
    });
  } catch (error) {
    console.error("Get games error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching games",
    });
  }
};

// --------------------------------------------------
// GET GAME CONFIGURATION
// --------------------------------------------------

const getGameConfig = async (req, res) => {
  try {
    const { gameType } = req.params;

    const config = GAME_CONFIGS[gameType];

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Game configuration not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Get game config error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching game configuration",
    });
  }
};

// --------------------------------------------------
// ALPHABET MATCHING CONTENT
// --------------------------------------------------

const getAlphabetMatchingContent = async (req, res) => {
  try {
    const {
      difficulty = 1,
      mode = "capital",
      lang = "en",
    } = req.query;

    const difficultyNumber = Number(difficulty);

    if (!Number.isInteger(difficultyNumber) ||
        difficultyNumber < 1 ||
        difficultyNumber > 5) {
      return res.status(400).json({
        success: false,
        message: "Difficulty must be between 1 and 5",
      });
    }

    if (!["capital", "small", "number"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid game mode",
      });
    }

    if (!["en", "hi", "mr"].includes(lang)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language",
      });
    }

    const languageData = LANGUAGE_DATA[lang];

    if (!languageData) {
      return res.status(400).json({
        success: false,
        message: "Language data not available",
      });
    }

    const targetCount = Math.min(
      10,
      Math.max(4, difficultyNumber + 3)
    );

    const selectedTargets = shuffleArray(
      languageData.letters
    ).slice(0, targetCount);

    const rounds = selectedTargets.map((target, index) => {
      const options = new Set();

      options.add(target);

      const confusable =
        languageData.confusableMap[target];

      if (
        difficultyNumber >= 3 &&
        confusable
      ) {
        options.add(confusable);
      }

      const candidateLetters = shuffleArray(
        languageData.letters.filter(
          (letter) =>
            letter !== target &&
            letter !== confusable
        )
      );

      for (const letter of candidateLetters) {
        if (options.size >= targetCount) {
          break;
        }

        options.add(letter);
      }

      return {
        round_id: index + 1,

        target_letter: target,

        options: shuffleArray(
          Array.from(options)
        ),

        audio_prompt_key:
          `prompt_match_${index + 1}`,

        audio_url: null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        game_type: "alphabet_matching",
        difficulty: difficultyNumber,
        mode,
        rounds,
      },
    });
  } catch (error) {
    console.error(
      "Alphabet matching content error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating alphabet matching content",
    });
  }
};

// --------------------------------------------------
// CAPITAL & SMALL MATCH CONTENT
// --------------------------------------------------

const getCapitalSmallMatchContent = async (
  req,
  res
) => {
  try {
    const pairs = [
      { capital: "A", lowercase: "a" },
      { capital: "B", lowercase: "b" },
      { capital: "C", lowercase: "c" },
      { capital: "D", lowercase: "d" },
      { capital: "E", lowercase: "e" },
      { capital: "F", lowercase: "f" },
      { capital: "G", lowercase: "g" },
      { capital: "H", lowercase: "h" },
      { capital: "I", lowercase: "i" },
      { capital: "J", lowercase: "j" },
      { capital: "K", lowercase: "k" },
      { capital: "L", lowercase: "l" },
      { capital: "M", lowercase: "m" },
      { capital: "N", lowercase: "n" },
      { capital: "O", lowercase: "o" },
      { capital: "P", lowercase: "p" },
      { capital: "Q", lowercase: "q" },
      { capital: "R", lowercase: "r" },
      { capital: "S", lowercase: "s" },
      { capital: "T", lowercase: "t" },
      { capital: "U", lowercase: "u" },
      { capital: "V", lowercase: "v" },
      { capital: "W", lowercase: "w" },
      { capital: "X", lowercase: "x" },
      { capital: "Y", lowercase: "y" },
      { capital: "Z", lowercase: "z" },
    ];

    const selectedPairs = shuffleArray(pairs).slice(0, 4);

    const capitalRowOrder = shuffleArray(
      selectedPairs.map((_, index) => index)
    );

    const lowercaseRowOrder = shuffleArray(
      selectedPairs.map((_, index) => index)
    );

    return res.status(200).json({
      success: true,
      data: {
        game_type: "capital_small_match",
        difficulty: 1,
        pairs: selectedPairs,
        capitalRowOrder,
        lowercaseRowOrder,
      },
    });
  } catch (error) {
    console.error(
      "Capital small match content error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating capital-small content",
    });
  }
};

// --------------------------------------------------
// VOWEL MATRA MATCH CONTENT
// --------------------------------------------------

const getVowelMatraMatchContent = async (
  req,
  res
) => {
  try {
    const {
      lang = "hi",
      difficulty = 1,
    } = req.query;

    const difficultyNumber = Number(difficulty);

    if (!["hi", "mr"].includes(lang)) {
      return res.status(400).json({
        success: false,
        message:
          "Vowel-Matra Match supports Hindi and Marathi only",
      });
    }

    if (
      !Number.isInteger(difficultyNumber) ||
      difficultyNumber < 1 ||
      difficultyNumber > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "Difficulty must be between 1 and 3",
      });
    }

    const allPairs = VOWEL_MATRA_DATA[lang];

    const pairCount =
      difficultyNumber === 1
        ? 4
        : difficultyNumber === 2
        ? 6
        : 10;

    const selectedPairs = shuffleArray(
      allPairs
    ).slice(0, pairCount);

    const vowelColumnOrder = shuffleArray(
      selectedPairs.map((_, index) => index)
    );

    const matraColumnOrder = shuffleArray(
      selectedPairs.map((_, index) => index)
    );

    return res.status(200).json({
      success: true,
      data: {
        game_type: "vowel_matra_match",
        difficulty: difficultyNumber,
        language: lang,
        pairs: selectedPairs,
        vowelColumnOrder,
        matraColumnOrder,
      },
    });
  } catch (error) {
    console.error(
      "Vowel matra match content error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating vowel-matra content",
    });
  }
};

module.exports = {
  getGames,
  getGameConfig,
  getAlphabetMatchingContent,
  getCapitalSmallMatchContent,
  getVowelMatraMatchContent,
};
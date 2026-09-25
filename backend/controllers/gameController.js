const Activity = require("../models/Activity");

// --------------------------------------------------
// GAME REGISTRY
// --------------------------------------------------

const GAMES = [
  {
    id: "alphabet_matching",
    title: "Alphabet Matching",
    description:
      "Match the correct letters, numbers and Barakhadi forms to improve recognition.",
    supportedLanguages: ["en", "hi", "mr"],
  },

  {
    id: "capital_small_match",
    title: "Capital & Small Match",
    description:
      "Match capital letters with their lowercase partners.",
    supportedLanguages: ["en"],
  },

  {
    id: "vowel_matra_match",
    title: "Vowel & Matra Match",
    description:
      "Match vowels with their correct matra forms.",
    supportedLanguages: ["hi", "mr"],
  },

  {
    id: "speech_word_challenge",
    title: "Speech Word Challenge",
    description:
      "Practice pronunciation and word recognition using speech.",
    supportedLanguages: ["en", "hi", "mr"],
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

    supportedLanguages: ["en", "hi", "mr"],

    modes: [
      "capital",
      "small",
      "numbers",
      "barakhadi",
    ],

    modeLanguages: {
      capital: ["en", "hi", "mr"],
      small: ["en", "hi", "mr"],
      numbers: ["en", "hi", "mr"],
      barakhadi: ["hi", "mr"],
    },
  },

  capital_small_match: {
    game_type: "capital_small_match",

    available_difficulties: [1],

    time_limit_seconds: null,

    items_per_session: 3,

    supportedLanguages: ["en"],

    modes: ["capital_small"],
  },

  vowel_matra_match: {
    game_type: "vowel_matra_match",

    available_difficulties: [1, 2, 3],

    time_limit_seconds: null,

    items_per_session: 10,

    supportedLanguages: ["hi", "mr"],

    modes: ["vowel_matra"],
  },

  speech_word_challenge: {
    game_type: "speech_word_challenge",

    available_difficulties: [1, 2, 3],

    time_limit_seconds: null,

    items_per_session: 10,

    modes: ["letters", "words"],

    supportedLanguages: ["en", "hi", "mr"],
  },
};

// --------------------------------------------------
// ALPHABET MATCHING DATA
//
// English:
//   capital   -> A-Z
//   small     -> a-z
//   numbers   -> 0-9
//
// Hindi:
//   capital   -> Swar
//   small     -> Vyanjan
//   numbers   -> ०-९
//   barakhadi -> क, का, कि...
//
// Marathi:
//   capital   -> Swar
//   small     -> Vyanjan
//   numbers   -> ०-९
//   barakhadi -> क, का, कि...
// --------------------------------------------------

const ALPHABET_MATCHING_DATA = {
  // ==================================================
  // ENGLISH
  // ==================================================

  en: {
    capital: {
      symbols:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),

      confusableMap: {
        B: "D",
        D: "B",
        P: "Q",
        Q: "P",
        M: "W",
        W: "M",
        N: "U",
        U: "N",
        O: "Q",
      },
    },

    small: {
      symbols:
        "abcdefghijklmnopqrstuvwxyz".split(""),

      confusableMap: {
        b: "d",
        d: "b",
        p: "q",
        q: "p",
        m: "w",
        w: "m",
        n: "u",
        u: "n",
        o: "q",
      },
    },

    numbers: {
      symbols:
        "0123456789".split(""),

      confusableMap: {
        "6": "9",
        "9": "6",
        "1": "7",
        "7": "1",
        "3": "8",
        "8": "3",
      },
    },
  },

  // ==================================================
  // HINDI
  // ==================================================

  hi: {
    capital: {
      symbols: [
        "अ",
        "आ",
        "इ",
        "ई",
        "उ",
        "ऊ",
        "ऋ",
        "ए",
        "ऐ",
        "ओ",
        "औ",
        "अं",
        "अः",
      ],

      confusableMap: {
        इ: "ई",
        ई: "इ",
        उ: "ऊ",
        ऊ: "उ",
        ए: "ऐ",
        ऐ: "ए",
        ओ: "औ",
        औ: "ओ",
      },
    },

    small: {
      symbols: [
        "क",
        "ख",
        "ग",
        "घ",
        "ङ",
        "च",
        "छ",
        "ज",
        "झ",
        "ञ",
        "ट",
        "ठ",
        "ड",
        "ढ",
        "ण",
        "त",
        "थ",
        "द",
        "ध",
        "न",
        "प",
        "फ",
        "ब",
        "भ",
        "म",
        "य",
        "र",
        "ल",
        "व",
        "श",
        "ष",
        "स",
        "ह",
      ],

      confusableMap: {
        ख: "ग",
        ग: "घ",
        ट: "ठ",
        ड: "ढ",
        त: "थ",
        द: "ध",
        प: "फ",
        ब: "भ",
        श: "ष",
      },
    },

    numbers: {
      symbols: [
        "०",
        "१",
        "२",
        "३",
        "४",
        "५",
        "६",
        "७",
        "८",
        "९",
      ],

      confusableMap: {
        "१": "७",
        "७": "१",
        "२": "३",
        "३": "२",
        "६": "९",
        "९": "६",
      },
    },

    barakhadi: {
      symbols: [
        "क",
        "का",
        "कि",
        "की",
        "कु",
        "कू",
        "कृ",
        "के",
        "कै",
        "को",
        "कौ",
        "कं",
        "कः",
      ],

      confusableMap: {
        कि: "की",
        की: "कि",
        कु: "कू",
        कू: "कु",
        के: "कै",
        कै: "के",
        को: "कौ",
        कौ: "को",
      },
    },
  },

  // ==================================================
  // MARATHI
  // ==================================================

  mr: {
    capital: {
      symbols: [
        "अ",
        "आ",
        "इ",
        "ई",
        "उ",
        "ऊ",
        "ऋ",
        "ए",
        "ऐ",
        "ओ",
        "औ",
        "अं",
        "अः",
      ],

      confusableMap: {
        इ: "ई",
        ई: "इ",
        उ: "ऊ",
        ऊ: "उ",
        ए: "ऐ",
        ऐ: "ए",
        ओ: "औ",
        औ: "ओ",
      },
    },

    small: {
      symbols: [
        "क",
        "ख",
        "ग",
        "घ",
        "ङ",
        "च",
        "छ",
        "ज",
        "झ",
        "ञ",
        "ट",
        "ठ",
        "ड",
        "ढ",
        "ण",
        "त",
        "थ",
        "द",
        "ध",
        "न",
        "प",
        "फ",
        "ब",
        "भ",
        "म",
        "य",
        "र",
        "ल",
        "व",
        "श",
        "ष",
        "स",
        "ह",
        "ळ",
        "क्ष",
        "ज्ञ",
      ],

      confusableMap: {
        ख: "ग",
        ग: "घ",
        ट: "ठ",
        ड: "ढ",
        त: "थ",
        द: "ध",
        प: "फ",
        ब: "भ",
        श: "ष",
        ळ: "ल",
      },
    },

    numbers: {
      symbols: [
        "०",
        "१",
        "२",
        "३",
        "४",
        "५",
        "६",
        "७",
        "८",
        "९",
      ],

      confusableMap: {
        "१": "७",
        "७": "१",
        "२": "३",
        "३": "२",
        "६": "९",
        "९": "६",
      },
    },

    barakhadi: {
      symbols: [
        "क",
        "का",
        "कि",
        "की",
        "कु",
        "कू",
        "कृ",
        "के",
        "कै",
        "को",
        "कौ",
        "कं",
        "कः",
      ],

      confusableMap: {
        कि: "की",
        की: "कि",
        कु: "कू",
        कू: "कु",
        के: "कै",
        कै: "के",
        को: "कौ",
        कौ: "को",
      },
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
// SPEECH WORD CHALLENGE DATA
// --------------------------------------------------

const SPEECH_WORD_CHALLENGE_DATA = {
  en: {
    letters: [
      {
        id: "en_letter_a",
        prompt: "Say the letter A",
        expectedAnswer: "A",
        acceptedVariants: ["a"],
      },
      {
        id: "en_letter_b",
        prompt: "Say the letter B",
        expectedAnswer: "B",
        acceptedVariants: ["b"],
      },
      {
        id: "en_letter_c",
        prompt: "Say the letter C",
        expectedAnswer: "C",
        acceptedVariants: ["c"],
      },
      {
        id: "en_letter_d",
        prompt: "Say the letter D",
        expectedAnswer: "D",
        acceptedVariants: ["d"],
      },
      {
        id: "en_letter_e",
        prompt: "Say the letter E",
        expectedAnswer: "E",
        acceptedVariants: ["e"],
      },
      {
        id: "en_letter_f",
        prompt: "Say the letter F",
        expectedAnswer: "F",
        acceptedVariants: ["f"],
      },
      {
        id: "en_letter_g",
        prompt: "Say the letter G",
        expectedAnswer: "G",
        acceptedVariants: ["g"],
      },
      {
        id: "en_letter_h",
        prompt: "Say the letter H",
        expectedAnswer: "H",
        acceptedVariants: ["h"],
      },
    ],

    words: [
      {
        id: "en_word_cat",
        prompt: "Say the word cat",
        expectedAnswer: "cat",
        acceptedVariants: ["cat"],
      },
      {
        id: "en_word_dog",
        prompt: "Say the word dog",
        expectedAnswer: "dog",
        acceptedVariants: ["dog"],
      },
      {
        id: "en_word_ball",
        prompt: "Say the word ball",
        expectedAnswer: "ball",
        acceptedVariants: ["ball"],
      },
      {
        id: "en_word_book",
        prompt: "Say the word book",
        expectedAnswer: "book",
        acceptedVariants: ["book"],
      },
      {
        id: "en_word_sun",
        prompt: "Say the word sun",
        expectedAnswer: "sun",
        acceptedVariants: ["sun"],
      },
      {
        id: "en_word_tree",
        prompt: "Say the word tree",
        expectedAnswer: "tree",
        acceptedVariants: ["tree"],
      },
    ],
  },

  hi: {
    letters: [
      {
        id: "hi_letter_ka",
        prompt: "क बोलिए",
        expectedAnswer: "क",
        acceptedVariants: ["क"],
      },
      {
        id: "hi_letter_kha",
        prompt: "ख बोलिए",
        expectedAnswer: "ख",
        acceptedVariants: ["ख"],
      },
      {
        id: "hi_letter_ga",
        prompt: "ग बोलिए",
        expectedAnswer: "ग",
        acceptedVariants: ["ग"],
      },
      {
        id: "hi_letter_gha",
        prompt: "घ बोलिए",
        expectedAnswer: "घ",
        acceptedVariants: ["घ"],
      },
      {
        id: "hi_letter_ma",
        prompt: "म बोलिए",
        expectedAnswer: "म",
        acceptedVariants: ["म"],
      },
    ],

    words: [
      {
        id: "hi_word_aam",
        prompt: "आम बोलिए",
        expectedAnswer: "आम",
        acceptedVariants: ["आम"],
      },
      {
        id: "hi_word_ghar",
        prompt: "घर बोलिए",
        expectedAnswer: "घर",
        acceptedVariants: ["घर"],
      },
      {
        id: "hi_word_kitab",
        prompt: "किताब बोलिए",
        expectedAnswer: "किताब",
        acceptedVariants: ["किताब"],
      },
      {
        id: "hi_word_paani",
        prompt: "पानी बोलिए",
        expectedAnswer: "पानी",
        acceptedVariants: ["पानी"],
      },
      {
        id: "hi_word_phool",
        prompt: "फूल बोलिए",
        expectedAnswer: "फूल",
        acceptedVariants: ["फूल"],
      },
    ],
  },

  mr: {
    letters: [
      {
        id: "mr_letter_ka",
        prompt: "क बोला",
        expectedAnswer: "क",
        acceptedVariants: ["क"],
      },
      {
        id: "mr_letter_ma",
        prompt: "म बोला",
        expectedAnswer: "म",
        acceptedVariants: ["म"],
      },
      {
        id: "mr_letter_pa",
        prompt: "प बोला",
        expectedAnswer: "प",
        acceptedVariants: ["प"],
      },
      {
        id: "mr_letter_ra",
        prompt: "र बोला",
        expectedAnswer: "र",
        acceptedVariants: ["र"],
      },
    ],

    words: [
      {
        id: "mr_word_ghar",
        prompt: "घर बोला",
        expectedAnswer: "घर",
        acceptedVariants: ["घर"],
      },
      {
        id: "mr_word_paani",
        prompt: "पाणी बोला",
        expectedAnswer: "पाणी",
        acceptedVariants: ["पाणी"],
      },
      {
        id: "mr_word_aai",
        prompt: "आई बोला",
        expectedAnswer: "आई",
        acceptedVariants: ["आई"],
      },
      {
        id: "mr_word_phool",
        prompt: "फूल बोला",
        expectedAnswer: "फूल",
        acceptedVariants: ["फूल"],
      },
    ],
  },
};

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

const shuffleArray = (array) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [result[i], result[randomIndex]] = [
      result[randomIndex],
      result[i],
    ];
  }

  return result;
};

// --------------------------------------------------
// ALPHABET MATCHING DIFFICULTY
// --------------------------------------------------

const getAlphabetGridSize = (difficulty) => {
  switch (difficulty) {
    case 1:
    case 2:
      return 4;

    case 3:
    case 4:
      return 6;

    case 5:
      return 8;

    default:
      return 4;
  }
};

const shouldIncludeConfusablePairs = (
  difficulty
) => {
  return difficulty >= 3;
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
        message:
          "Invalid language. Use en, hi or mr",
      });
    }

    const availableGames = GAMES.filter(
      (game) =>
        game.supportedLanguages.includes(lang)
    );

    return res.status(200).json({
      success: true,
      data: availableGames,
    });
  } catch (error) {
    console.error(
      "Get games error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching games",
    });
  }
};

// --------------------------------------------------
// GET GAME CONFIGURATION
// --------------------------------------------------

const getGameConfig = async (req, res) => {
  try {
    const { gameType } = req.params;

    const config =
      GAME_CONFIGS[gameType];

    if (!config) {
      return res.status(404).json({
        success: false,
        message:
          "Game configuration not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error(
      "Get game config error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching game configuration",
    });
  }
};

// --------------------------------------------------
// ALPHABET MATCHING CONTENT
// --------------------------------------------------

const getAlphabetMatchingContent =
  async (req, res) => {
    try {
      const {
        difficulty = 1,
        mode = "capital",
        lang = "en",
      } = req.query;

      const difficultyNumber =
        Number(difficulty);

      if (
        !Number.isInteger(
          difficultyNumber
        ) ||
        difficultyNumber < 1 ||
        difficultyNumber > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Difficulty must be between 1 and 5",
        });
      }

      if (
        !["en", "hi", "mr"].includes(lang)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid language. Use en, hi or mr",
        });
      }

      const validModes = [
        "capital",
        "small",
        "numbers",
        "barakhadi",
      ];

      if (!validModes.includes(mode)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid game mode. Use capital, small, numbers or barakhadi",
        });
      }

      const languageModes =
        ALPHABET_MATCHING_DATA[lang];

      if (!languageModes) {
        return res.status(400).json({
          success: false,
          message:
            "Language data not available",
        });
      }

      const selectedDataset =
        languageModes[mode];

      if (!selectedDataset) {
        return res.status(400).json({
          success: false,
          message:
            `Mode '${mode}' is not available for language '${lang}'`,
        });
      }

      const symbolsPool =
        selectedDataset.symbols;

      const confusableMap =
        selectedDataset.confusableMap ||
        {};

      if (
        !symbolsPool ||
        symbolsPool.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No alphabet data available for this mode",
        });
      }

      const optionsCount =
        getAlphabetGridSize(
          difficultyNumber
        );

      const sessionRoundCount =
        Math.min(
          10,
          symbolsPool.length
        );

      const selectedTargets =
        shuffleArray(
          symbolsPool
        ).slice(
          0,
          sessionRoundCount
        );

      const rounds =
        selectedTargets.map(
          (target, index) => {
            const options = new Set();

            options.add(target);

            const confusable =
              confusableMap[target];

            if (
              shouldIncludeConfusablePairs(
                difficultyNumber
              ) &&
              confusable &&
              symbolsPool.includes(
                confusable
              ) &&
              options.size <
                optionsCount
            ) {
              options.add(confusable);
            }

            let candidatePool =
              symbolsPool.filter(
                (symbol) =>
                  symbol !== target &&
                  symbol !== confusable
              );

            candidatePool =
              shuffleArray(
                candidatePool
              );

            for (
              const candidate of candidatePool
            ) {
              if (
                options.size >=
                optionsCount
              ) {
                break;
              }

              options.add(candidate);
            }

            const finalOptions =
              shuffleArray(
                Array.from(options)
              );

            return {
              round_id: index + 1,

              target_letter: target,

              options: finalOptions,

              audio_prompt_key:
                `prompt_match_${String(
                  target
                ).toLowerCase()}`,

              audio_url: null,
            };
          }
        );

      return res.status(200).json({
        success: true,

        data: {
          game_type:
            "alphabet_matching",

          difficulty:
            difficultyNumber,

          mode,

          language: lang,

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

const getCapitalSmallMatchContent =
  async (req, res) => {
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

      const selectedPairs =
        shuffleArray(pairs).slice(
          0,
          3
        );

      const capitalRowOrder =
        shuffleArray(
          selectedPairs.map(
            (_, index) => index
          )
        );

      const lowercaseRowOrder =
        shuffleArray(
          selectedPairs.map(
            (_, index) => index
          )
        );

      return res.status(200).json({
        success: true,

        data: {
          game_type:
            "capital_small_match",

          difficulty: 1,

          language: "en",

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

const getVowelMatraMatchContent =
  async (req, res) => {
    try {
      const {
        lang = "hi",
        difficulty = 1,
      } = req.query;

      const difficultyNumber =
        Number(difficulty);

      if (
        !["hi", "mr"].includes(lang)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Vowel-Matra Match supports Hindi and Marathi only",
        });
      }

      if (
        !Number.isInteger(
          difficultyNumber
        ) ||
        difficultyNumber < 1 ||
        difficultyNumber > 3
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Difficulty must be between 1 and 3",
        });
      }

      const allPairs =
        VOWEL_MATRA_DATA[lang];

      const pairCount =
        difficultyNumber === 1
          ? 4
          : difficultyNumber === 2
          ? 6
          : 10;

      const selectedPairs =
        shuffleArray(
          allPairs
        ).slice(
          0,
          pairCount
        );

      const vowelColumnOrder =
        shuffleArray(
          selectedPairs.map(
            (_, index) => index
          )
        );

      const matraColumnOrder =
        shuffleArray(
          selectedPairs.map(
            (_, index) => index
          )
        );

      return res.status(200).json({
        success: true,

        data: {
          game_type:
            "vowel_matra_match",

          difficulty:
            difficultyNumber,

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

// --------------------------------------------------
// SPEECH WORD CHALLENGE CONTENT
// --------------------------------------------------

const getSpeechWordChallengeContent =
  async (req, res) => {
    try {
      const {
        lang = "en",
        mode = "words",
        difficulty = 1,
      } = req.query;

      const difficultyNumber =
        Number(difficulty);

      if (
        !["en", "hi", "mr"].includes(lang)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Speech Word Challenge supports en, hi and mr",
        });
      }

      if (
        !["letters", "words"].includes(
          mode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Mode must be letters or words",
        });
      }

      if (
        !Number.isInteger(
          difficultyNumber
        ) ||
        difficultyNumber < 1 ||
        difficultyNumber > 3
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Difficulty must be between 1 and 3",
        });
      }

      const languageData =
        SPEECH_WORD_CHALLENGE_DATA[
          lang
        ];

      const allItems =
        languageData?.[mode];

      if (
        !allItems ||
        allItems.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "No speech challenge content available",
        });
      }

      const itemCount =
        difficultyNumber === 1
          ? 5
          : difficultyNumber === 2
          ? 8
          : 10;

      const selectedItems =
        shuffleArray(allItems).slice(
          0,
          Math.min(
            itemCount,
            allItems.length
          )
        );

      return res.status(200).json({
        success: true,

        data: {
          game_type:
            "speech_word_challenge",

          language: lang,

          mode,

          difficulty:
            difficultyNumber,

          items: selectedItems,
        },
      });
    } catch (error) {
      console.error(
        "Speech word challenge content error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while generating speech challenge content",
      });
    }
  };

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  getGames,
  getGameConfig,
  getAlphabetMatchingContent,
  getCapitalSmallMatchContent,
  getVowelMatraMatchContent,
  getSpeechWordChallengeContent,
};
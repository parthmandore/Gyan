const express = require("express");

const {
  getGames,
  getAlphabetMatchingContent,
  getCapitalSmallMatchContent,
  getVowelMatraMatchContent,
  getGameConfig,
} = require("../controllers/gameController");

const gameRouter = express.Router();
const gameConfigRouter = express.Router();

// --------------------------------------------------
// GAME CATALOG
// --------------------------------------------------

gameRouter.get("/", getGames);

// --------------------------------------------------
// GAME CONTENT
// --------------------------------------------------

gameRouter.get(
  "/alphabet_matching/content",
  getAlphabetMatchingContent
);

gameRouter.get(
  "/capital_small_match/content",
  getCapitalSmallMatchContent
);

gameRouter.get(
  "/vowel_matra_match/content",
  getVowelMatraMatchContent
);

// --------------------------------------------------
// GAME CONFIG
// --------------------------------------------------

gameConfigRouter.get(
  "/:gameType",
  getGameConfig
);

module.exports = {
  gameRouter,
  gameConfigRouter,
};
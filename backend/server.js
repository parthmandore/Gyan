require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const {
  gameRouter,
  gameConfigRouter,
} = require("./routes/gameRoutes");

const progressRoutes =
  require("./routes/progressRoutes");

const rewardRoutes =
  require("./routes/rewardRoutes");

const achievementRoutes =
  require("./routes/achievementRoutes");

const parentRoutes =
  require("./routes/parentRoutes");

const teacherRoutes =
  require("./routes/teacherRoutes");

const speechRoutes =
  require("./routes/speechRoutes");

const app = express();

// --------------------------------------------------
// DATABASE
// --------------------------------------------------

connectDB();

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());

app.use(express.json());

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gyan Backend Running",
  });
});

// --------------------------------------------------
// AUTH
// --------------------------------------------------

app.use(
  "/api/auth",
  authRoutes
);

// --------------------------------------------------
// USERS
// --------------------------------------------------

app.use(
  "/api/users",
  userRoutes
);

// --------------------------------------------------
// GAMES
// --------------------------------------------------

app.use(
  "/api/games",
  gameRouter
);

// --------------------------------------------------
// GAME CONFIG
// --------------------------------------------------

app.use(
  "/api/game-config",
  gameConfigRouter
);

// --------------------------------------------------
// PROGRESS
// --------------------------------------------------

app.use(
  "/api/progress",
  progressRoutes
);

// --------------------------------------------------
// REWARDS
// --------------------------------------------------

app.use(
  "/api/rewards",
  rewardRoutes
);

// --------------------------------------------------
// ACHIEVEMENTS
// --------------------------------------------------

app.use(
  "/api/achievements",
  achievementRoutes
);

// --------------------------------------------------
// PARENT
// --------------------------------------------------

app.use(
  "/api/parents",
  parentRoutes
);

// --------------------------------------------------
// TEACHER
// --------------------------------------------------

app.use(
  "/api/teachers",
  teacherRoutes
);

// --------------------------------------------------
// SPEECH
// --------------------------------------------------

app.use(
  "/api/speech",
  speechRoutes
);

// --------------------------------------------------
// SERVER
// --------------------------------------------------

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
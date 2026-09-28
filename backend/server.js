
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

const progressRoutes = require("./routes/progressRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const parentRoutes = require("./routes/parentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const speechRoutes = require("./routes/speechRoutes");
const speechChallengeRoutes = require("./routes/speechChallengeRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --------------------------------------------------
// HEALTH CHECKS
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gyan Backend Running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gyan backend is running",
  });
});

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

app.use("/api/auth", authRoutes);

// --------------------------------------------------
// USERS
// --------------------------------------------------

app.use("/api/users", userRoutes);

// --------------------------------------------------
// GAMES
// --------------------------------------------------

app.use("/api/games", gameRouter);

// --------------------------------------------------
// GAME CONFIGURATION
// --------------------------------------------------

app.use("/api/game-config", gameConfigRouter);

// --------------------------------------------------
// PROGRESS
// --------------------------------------------------

app.use("/api/progress", progressRoutes);

// --------------------------------------------------
// REWARDS
// --------------------------------------------------

app.use("/api/rewards", rewardRoutes);

// --------------------------------------------------
// ACHIEVEMENTS
// --------------------------------------------------

app.use("/api/achievements", achievementRoutes);

// --------------------------------------------------
// PARENT DASHBOARD
// --------------------------------------------------

app.use("/api/parents", parentRoutes);

// --------------------------------------------------
// TEACHER DASHBOARD
// --------------------------------------------------

app.use("/api/teachers", teacherRoutes);

// --------------------------------------------------
// TEXT-TO-SPEECH AND SPEECH-TO-TEXT
// --------------------------------------------------

app.use("/api/speech", speechRoutes);

// --------------------------------------------------
// SPEECH WORD CHALLENGE
// --------------------------------------------------

app.use("/api/speech-challenge", speechChallengeRoutes);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error("Express error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Uploaded file exceeds the allowed size limit",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal server error",
  });
});

// --------------------------------------------------
// START SERVER AFTER DATABASE CONNECTION
// --------------------------------------------------

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Gyan backend running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gyan Backend Running");
});

app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/progress", progressRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
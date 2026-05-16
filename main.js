const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./auth/auth.route");
const postRoutes = require("./posts/post.route");

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("API working");
});

const connectDB = require("./config/db");

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(3001, () => {
      console.log("Server running on http://localhost:3001");
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

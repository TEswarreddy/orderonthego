const express = require("express");
const cors = require("cors");


const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);

app.get("/", (req, res) => {
  res.send("SB Foods API is running 🚀");
});

module.exports = app;

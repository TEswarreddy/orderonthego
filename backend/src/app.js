const express = require("express");
const cors = require("cors");


const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const staffRoutes = require("./routes/staffRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");

const app = express();

// Remove trailing slash from FRONTEND_BASE_URL to prevent CORS mismatches
const allowedOrigin = (process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/$/, "");

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  exposedHeaders: ['x-rtb-fingerprint-id', 'Content-Length', 'X-JSON-Response']
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/restaurants", restaurantRoutes);

app.get("/", (req, res) => {
  res.send("SB Foods API is running 🚀");
});

module.exports = app;

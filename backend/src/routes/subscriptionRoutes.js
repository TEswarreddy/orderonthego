const express = require("express");
const router = express.Router();
const {
  getMySubscription,
  getPlans,
  createSubscription,
  cancelSubscription,
  checkFeatureLimit,
  getUsageStats,
} = require("../controllers/subscriptionController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes
router.get("/plans", getPlans);

// Protected routes (RESTAURANT only)
const restaurantProtect = [protect, authorize("RESTAURANT")];

router.get("/my-subscription", restaurantProtect, getMySubscription);
router.post("/subscribe", restaurantProtect, createSubscription);
router.put("/cancel", restaurantProtect, cancelSubscription);
router.get("/check-limit/:featureName", restaurantProtect, checkFeatureLimit);
router.get("/usage", restaurantProtect, getUsageStats);

module.exports = router;

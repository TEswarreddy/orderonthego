const Subscription = require("../models/Subscription");
const Food = require("../models/Food");
const Order = require("../models/Order");

// Middleware to check if restaurant has active subscription
const checkActiveSubscription = async (req, res, next) => {
  try {
    if (req.user.userType !== "RESTAURANT") {
      return next();
    }

    const subscription = await Subscription.findOne({ restaurantId: req.user._id });

    if (!subscription) {
      // Create FREE plan if none exists
      const planFeatures = Subscription.getPlanFeatures("FREE");
      await Subscription.create({
        restaurantId: req.user._id,
        plan: "FREE",
        status: "ACTIVE",
        features: {
          maxMenuItems: planFeatures.maxMenuItems,
          maxOrdersPerDay: planFeatures.maxOrdersPerDay,
          analyticsAccess: planFeatures.analyticsAccess,
          prioritySupport: planFeatures.prioritySupport,
          customBranding: planFeatures.customBranding,
        },
      });
      return next();
    }

    // Check if subscription is active
    if (!subscription.isActive()) {
      return res.status(403).json({
        message: "Your subscription has expired. Please renew to continue using this feature.",
        expired: true,
      });
    }

    // Attach subscription to request
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking subscription status" });
  }
};

// Middleware to check menu item limit before creating
const checkMenuItemLimit = async (req, res, next) => {
  try {
    if (req.user.userType !== "RESTAURANT") {
      return next();
    }

    const subscription = await Subscription.findOne({ restaurantId: req.user._id });

    if (!subscription) {
      return res.status(403).json({ message: "No active subscription found" });
    }

    const currentCount = await Food.countDocuments({ restaurantId: req.user._id });
    const limit = subscription.features.maxMenuItems;

    if (currentCount >= limit) {
      return res.status(403).json({
        message: `You have reached your plan limit of ${limit} menu items. Please upgrade your subscription.`,
        limitReached: true,
        current: currentCount,
        limit,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking menu item limit" });
  }
};

// Middleware to check daily order limit
const checkOrderLimit = async (req, res, next) => {
  try {
    if (req.user.userType !== "RESTAURANT") {
      return next();
    }

    const subscription = await Subscription.findOne({ restaurantId: req.user._id });

    if (!subscription) {
      return res.status(403).json({ message: "No active subscription found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentCount = await Order.countDocuments({
      restaurantId: req.user._id,
      createdAt: { $gte: today },
    });

    const limit = subscription.features.maxOrdersPerDay;

    if (currentCount >= limit) {
      return res.status(403).json({
        message: `You have reached your daily order limit of ${limit}. Please upgrade your subscription for higher limits.`,
        limitReached: true,
        current: currentCount,
        limit,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking order limit" });
  }
};

// Middleware to check analytics access
const checkAnalyticsAccess = async (req, res, next) => {
  try {
    if (req.user.userType !== "RESTAURANT") {
      return next();
    }

    const subscription = await Subscription.findOne({ restaurantId: req.user._id });

    if (!subscription || !subscription.features.analyticsAccess) {
      return res.status(403).json({
        message: "Analytics access is not available on your current plan. Please upgrade to BASIC or PREMIUM.",
        featureRestricted: true,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking analytics access" });
  }
};

// Middleware to track feature usage
const trackFeatureUsage = (featureName) => {
  return async (req, res, next) => {
    try {
      // Log feature usage for analytics
      console.log(`Feature used: ${featureName} by user ${req.user._id}`);
      next();
    } catch (error) {
      console.error(error);
      next();
    }
  };
};

module.exports = {
  checkActiveSubscription,
  checkMenuItemLimit,
  checkOrderLimit,
  checkAnalyticsAccess,
  trackFeatureUsage,
};

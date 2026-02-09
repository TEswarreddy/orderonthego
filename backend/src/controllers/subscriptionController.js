const Subscription = require("../models/Subscription");
const Food = require("../models/Food");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const crypto = require("crypto");

const ensureRestaurantSubscription = async (restaurantId) => {
  let subscription = await Subscription.findOne({ restaurantId });

  // If no subscription exists, create a FREE plan
  if (!subscription) {
    const planFeatures = Subscription.getPlanFeatures("FREE");
    subscription = await Subscription.create({
      restaurantId,
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
  }

  return subscription;
};

// @desc    Get subscription for logged-in restaurant
// @route   GET /api/subscriptions/my-subscription
// @access  Private (RESTAURANT)
const getMySubscription = async (req, res) => {
  try {
    let subscription = await ensureRestaurantSubscription(req.user._id);

    // Check if subscription is still active
    const isActive = subscription.isActive();
    if (!isActive && subscription.status === "ACTIVE") {
      subscription.status = "EXPIRED";
      await subscription.save();
    }

    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching subscription" });
  }
};

// @desc    Get all available subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getPlans = async (req, res) => {
  try {
    const plans = [
      {
        name: "FREE",
        ...Subscription.getPlanFeatures("FREE"),
        features: [
          "Up to 5 menu items",
          "10 orders per day",
          "Basic dashboard",
          "Email support",
          "Standard visibility",
        ],
      },
      {
        name: "BASIC",
        ...Subscription.getPlanFeatures("BASIC"),
        features: [
          "Up to 25 menu items",
          "50 orders per day",
          "Advanced analytics",
          "Email & chat support",
          "Enhanced visibility",
        ],
        popular: false,
      },
      {
        name: "PREMIUM",
        ...Subscription.getPlanFeatures("PREMIUM"),
        features: [
          "Up to 100 menu items",
          "200 orders per day",
          "Full analytics suite",
          "Priority 24/7 support",
          "Custom branding",
          "Featured placement",
        ],
        popular: true,
      },
    ];

    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching plans" });
  }
};

// @desc    Create or upgrade subscription
// @route   POST /api/subscriptions/subscribe
// @access  Private (RESTAURANT)
const createSubscription = async (req, res) => {
  try {
    const { plan, paymentDetails } = req.body;

    if (!["FREE", "BASIC", "PREMIUM"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    // Verify payment for paid plans (in production, verify with payment gateway)
    if (plan !== "FREE" && !paymentDetails) {
      return res.status(400).json({ message: "Payment details required for paid plans" });
    }

    const planFeatures = Subscription.getPlanFeatures(plan);

    // Calculate end date
    const startDate = new Date();
    let endDate = null;
    if (plan !== "FREE") {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + planFeatures.duration);
    }

    // Update or create subscription
    let subscription = await Subscription.findOne({ restaurantId: req.user._id });

    if (subscription) {
      subscription.plan = plan;
      subscription.status = "ACTIVE";
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.features = {
        maxMenuItems: planFeatures.maxMenuItems,
        maxOrdersPerDay: planFeatures.maxOrdersPerDay,
        analyticsAccess: planFeatures.analyticsAccess,
        prioritySupport: planFeatures.prioritySupport,
        customBranding: planFeatures.customBranding,
      };
      if (paymentDetails) {
        subscription.paymentDetails = {
          ...paymentDetails,
          amount: planFeatures.price,
          paymentDate: new Date(),
        };
      }
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        restaurantId: req.user._id,
        plan,
        status: "ACTIVE",
        startDate,
        endDate,
        features: {
          maxMenuItems: planFeatures.maxMenuItems,
          maxOrdersPerDay: planFeatures.maxOrdersPerDay,
          analyticsAccess: planFeatures.analyticsAccess,
          prioritySupport: planFeatures.prioritySupport,
          customBranding: planFeatures.customBranding,
        },
        paymentDetails: paymentDetails
          ? {
              ...paymentDetails,
              amount: planFeatures.price,
              paymentDate: new Date(),
            }
          : undefined,
      });
    }

    res.status(201).json({
      message: `Successfully subscribed to ${plan} plan`,
      subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating subscription" });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private (RESTAURANT)
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ restaurantId: req.user._id });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.plan === "FREE") {
      return res.status(400).json({ message: "Cannot cancel free plan" });
    }

    subscription.status = "CANCELLED";
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      message: "Subscription cancelled successfully. You can continue using your plan until the end date.",
      subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while cancelling subscription" });
  }
};

// @desc    Check if restaurant can add more items
// @route   GET /api/subscriptions/check-limit/:featureName
// @access  Private (RESTAURANT)
const checkFeatureLimit = async (req, res) => {
  try {
    const { featureName } = req.params;
    const subscription = await Subscription.findOne({ restaurantId: req.user._id });

    if (!subscription || !subscription.isActive()) {
      return res.status(403).json({ message: "No active subscription found" });
    }

    // Find the restaurant to get the correct restaurantId
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let currentUsage = 0;

    if (featureName === "maxMenuItems") {
      currentUsage = await Food.countDocuments({ restaurantId: restaurant._id });
    } else if (featureName === "maxOrdersPerDay") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      currentUsage = await Order.countDocuments({
        restaurantId: restaurant._id,
        createdAt: { $gte: today },
      });
    }

    const limit = subscription.features[featureName] || 0;
    const canProceed = subscription.checkLimit(featureName, currentUsage);

    res.json({
      canProceed,
      currentUsage,
      limit,
      remaining: limit - currentUsage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while checking limit" });
  }
};

// @desc    Get usage statistics
// @route   GET /api/subscriptions/usage
// @access  Private (RESTAURANT)
const getUsageStats = async (req, res) => {
  try {
    const subscription = await ensureRestaurantSubscription(req.user._id);

    // Find the restaurant to get the correct restaurantId
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const totalMenuItems = await Food.countDocuments({ restaurantId: restaurant._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      restaurantId: restaurant._id,
      createdAt: { $gte: today },
    });

    res.json({
      plan: subscription.plan,
      status: subscription.status,
      isActive: subscription.isActive(),
      usage: {
        menuItems: {
          current: totalMenuItems,
          limit: subscription.features.maxMenuItems,
          percentage: Math.round((totalMenuItems / subscription.features.maxMenuItems) * 100),
        },
        ordersToday: {
          current: todayOrders,
          limit: subscription.features.maxOrdersPerDay,
          percentage: Math.round((todayOrders / subscription.features.maxOrdersPerDay) * 100),
        },
      },
      features: subscription.features,
      endDate: subscription.endDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching usage stats" });
  }
};

module.exports = {
  getMySubscription,
  getPlans,
  createSubscription,
  cancelSubscription,
  checkFeatureLimit,
  getUsageStats,
};

const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["FREE", "BASIC", "PREMIUM"],
      default: "FREE",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"],
      default: "ACTIVE",
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: function () {
        return this.plan !== "FREE";
      },
    },
    features: {
      maxMenuItems: {
        type: Number,
        default: 5,
      },
      maxOrdersPerDay: {
        type: Number,
        default: 10,
      },
      analyticsAccess: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
    },
    paymentDetails: {
      amount: Number,
      currency: {
        type: String,
        default: "INR",
      },
      paymentId: String,
      orderId: String,
      signature: String,
      paymentDate: Date,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function (planType) {
  const plans = {
    FREE: {
      maxMenuItems: 5,
      maxOrdersPerDay: 10,
      analyticsAccess: false,
      prioritySupport: false,
      customBranding: false,
      price: 0,
      duration: 0, // Unlimited
    },
    BASIC: {
      maxMenuItems: 25,
      maxOrdersPerDay: 50,
      analyticsAccess: true,
      prioritySupport: false,
      customBranding: false,
      price: 999,
      duration: 30, // 30 days
    },
    PREMIUM: {
      maxMenuItems: 100,
      maxOrdersPerDay: 200,
      analyticsAccess: true,
      prioritySupport: true,
      customBranding: true,
      price: 2499,
      duration: 30, // 30 days
    },
  };

  return plans[planType] || plans.FREE;
};

// Instance method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
  if (this.status !== "ACTIVE") return false;
  if (this.plan === "FREE") return true;
  return this.endDate && new Date() < new Date(this.endDate);
};

// Instance method to check feature limit
subscriptionSchema.methods.checkLimit = function (featureName, currentUsage) {
  const limit = this.features[featureName] || 0;
  return currentUsage < limit;
};

module.exports = mongoose.model("Subscription", subscriptionSchema);

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // 💰 Payment Info
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["RAZORPAY", "STRIPE", "COD"],
      required: true,
    },

    // 🔐 Gateway Details
    gatewayOrderId: {
      type: String, // razorpay_order_id / stripe_intent_id
    },

    gatewayPaymentId: {
      type: String, // razorpay_payment_id / stripe_charge_id
    },

    gatewaySignature: {
      type: String, // razorpay_signature (optional storage)
    },

    // 📦 Status Tracking
    paymentStatus: {
      type: String,
      enum: ["CREATED", "SUCCESS", "FAILED", "REFUNDED"],
      default: "CREATED",
    },

    paidAt: {
      type: Date,
    },

    // 🧾 Extra Metadata (optional, future use)
    meta: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

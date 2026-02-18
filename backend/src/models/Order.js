const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        foodId: mongoose.Schema.Types.ObjectId,
        title: String,
        image: String,
        quantity: Number,
        price: Number,
      },
    ],
    address: String,
    paymentMethod: String,
    totalAmount: Number,
    status: {
      type: String,
      enum: [
        "PLACED",
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

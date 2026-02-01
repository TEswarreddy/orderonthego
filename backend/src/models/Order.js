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
      enum: ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"],
      default: "PLACED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

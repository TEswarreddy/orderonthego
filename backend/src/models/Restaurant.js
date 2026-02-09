const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    cuisineType: { type: String },
    description: { type: String },
    mainImg: String,
    profileImage: { type: String },
    profileImageBuffer: { type: Buffer },
    profileImageMimeType: { type: String },
    menu: Array,
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);

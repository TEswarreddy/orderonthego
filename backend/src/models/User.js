const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String }, // URL or path to the profile image
    profileImageBuffer: { type: Buffer }, // Binary data for the image
    profileImageMimeType: { type: String }, // MIME type (e.g., image/jpeg)
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    phoneVerificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    userType: {
      type: String,
      enum: ["USER", "RESTAURANT", "ADMIN", "STAFF"],
      default: "USER",
    },
    staffRole: {
      type: String,
      enum: ["MANAGER", "CHEF", "DELIVERY", "STAFF"],
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    approval: {
      type: Boolean,
      default: true, // restaurants and staff need approval
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

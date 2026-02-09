const mongoose = require("mongoose");

const staffInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["MANAGER", "CHEF", "DELIVERY", "STAFF"],
      required: true,
    },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED"],
      default: "PENDING",
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StaffInvite", staffInviteSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ["USER", "RESTAURANT", "ADMIN"],
      default: "USER",
    },
    approval: {
      type: Boolean,
      default: false, // restaurants need admin approval
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

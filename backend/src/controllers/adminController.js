const User = require("../models/User");
const Order = require("../models/Order");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// APPROVE RESTAURANT
exports.approveRestaurant = async (req, res) => {
  const restaurant = await User.findById(req.params.id);
  if (!restaurant || restaurant.userType !== "RESTAURANT") {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  restaurant.approval = true;
  await restaurant.save();

  res.json({ message: "Restaurant approved successfully" });
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().sort("-createdAt");
  res.json(orders);
};

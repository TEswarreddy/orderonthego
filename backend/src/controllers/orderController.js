const Order = require("../models/Order");
const Cart = require("../models/Cart");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  const { address, paymentMethod } = req.body;

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const totalAmount = cart.items.reduce(
    (sum, item) =>
      sum + item.quantity * (item.price - item.discount),
    0
  );

  const order = await Order.create({
    userId: req.user._id,
    restaurantId: cart.restaurantId,
    items: cart.items,
    address,
    paymentMethod,
    totalAmount,
  });

  cart.items = [];
  await cart.save();

  res.status(201).json(order);
};

// USER ORDERS
exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort("-createdAt");
  res.json(orders);
};

// RESTAURANT ORDERS
exports.getRestaurantOrders = async (req, res) => {
  const orders = await Order.find({
    restaurantId: req.user._id,
  }).sort("-createdAt");
  res.json(orders);
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.status = req.body.status;
  await order.save();
  res.json(order);
};

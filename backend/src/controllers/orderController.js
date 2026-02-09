const Order = require("../models/Order");
const Cart = require("../models/Cart");
const OrderStatusRequest = require("../models/OrderStatusRequest");

const resolveRestaurantId = (user) =>
  user.userType === "STAFF" ? user.restaurantId : user._id;

const normalizeStatus = (status) => {
  if (!status) return status;
  const normalized = status.toString().toUpperCase();
  const allowed = new Set([
    "PLACED",
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]);
  return allowed.has(normalized) ? normalized : status;
};

const getStaffAllowedStatuses = (role) => {
  switch (role) {
    case "MANAGER":
      return [
        "PLACED",
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ];
    case "CHEF":
      return ["PREPARING", "READY"];
    case "DELIVERY":
      return ["OUT_FOR_DELIVERY", "DELIVERED"];
    default:
      return [];
  }
};

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
  const restaurantId = resolveRestaurantId(req.user);
  if (!restaurantId) {
    return res.status(403).json({ message: "Restaurant context not available" });
  }
  const orders = await Order.find({ restaurantId }).sort("-createdAt");
  res.json(orders);
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const nextStatus = normalizeStatus(req.body.status);

  if (req.user.userType === "STAFF") {
    if (!req.user.restaurantId || order.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: "Not allowed to update this order" });
    }

    const allowedStatuses = getStaffAllowedStatuses(req.user.staffRole);
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(403).json({ message: "Status change requires owner approval" });
    }
  }

  order.status = nextStatus;
  await order.save();
  res.json(order);
};

// STAFF REQUEST ORDER STATUS CHANGE
exports.requestStatusChange = async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (!req.user.restaurantId) {
    return res.status(403).json({ message: "Restaurant context not available" });
  }

  if (order.restaurantId.toString() !== req.user.restaurantId?.toString()) {
    return res.status(403).json({ message: "Not allowed to update this order" });
  }

  const nextStatus = normalizeStatus(status);

  if (order.status === nextStatus) {
    return res.status(400).json({ message: "Order is already in that status" });
  }

  const request = await OrderStatusRequest.create({
    orderId: order._id,
    restaurantId: order.restaurantId,
    requestedBy: req.user._id,
    fromStatus: order.status,
    toStatus: nextStatus,
  });

  res.status(201).json({ message: "Status change requested", request });
};

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// CREATE ORDER
exports.createOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ message: "Payment service not configured. Please contact support." });
  }
  
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const amount = cart.items.reduce(
    (sum, item) => sum + item.quantity * (item.price - item.discount),
    0
  );

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  // Create Payment entry (CREATED)
  const payment = await Payment.create({
    userId: req.user._id,
    restaurantId: cart.restaurantId,
    amount,
    paymentMethod: "RAZORPAY",
    gatewayOrderId: razorpayOrder.id,
    paymentStatus: "CREATED",
  });

  res.json({
    razorpayOrder,
    paymentId: payment._id,
  });
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentId,
    address,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  // Update payment
  const payment = await Payment.findById(paymentId);
  payment.gatewayPaymentId = razorpay_payment_id;
  payment.gatewaySignature = razorpay_signature;
  payment.paymentStatus = "SUCCESS";
  payment.paidAt = new Date();
  await payment.save();

  // Create Order
  const cart = await Cart.findOne({ userId: payment.userId });

  const order = await Order.create({
    userId: payment.userId,
    restaurantId: payment.restaurantId,
    items: cart.items,
    address,
    totalAmount: payment.amount,
    paymentId: payment._id,
    paymentStatus: "PAID",
  });
  payment.orderId = order._id;
  await payment.save();

  // Clear cart
  cart.items = [];
  await cart.save();

  res.json({
    message: "Payment verified & order placed successfully",
    order,
  });
};

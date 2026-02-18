const Order = require("../models/Order");
const Cart = require("../models/Cart");
const OrderStatusRequest = require("../models/OrderStatusRequest");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const sgMail = require("@sendgrid/mail");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const resolveRestaurantId = async (user) => {
  if (user.userType === "STAFF") {
    if (!user.restaurantId) return null;

    // Staff may store either Restaurant._id or owner User._id
    const byRestaurantId = await Restaurant.findById(user.restaurantId).select("_id");
    if (byRestaurantId) return byRestaurantId._id;

    const byOwnerId = await Restaurant.findOne({ ownerId: user.restaurantId }).select("_id");
    return byOwnerId?._id || null;
  }

  if (user.userType !== "RESTAURANT") return null;

  const restaurant = await Restaurant.findOne({ ownerId: user._id }).select("_id");
  return restaurant?._id || null;
};

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
    "CANCELLED",
  ]);
  return allowed.has(normalized) ? normalized : status;
};

const cancellableStatuses = new Set(["PLACED", "PENDING", "CONFIRMED"]);

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

const sendOrderStatusEmail = async (order, status) => {
  if (!SENDGRID_API_KEY || !SENDGRID_SENDER) return;
  if (!order?.userId?.email) return;

  // Fetch restaurant details
  const restaurant = await Restaurant.findById(order.restaurantId);
  const restaurantName = restaurant?.title || "Order On The Go";
  
  const statusLabel = status.replace(/_/g, " ");
  const subject = `Order Update from ${restaurantName}: ${statusLabel}`;
  const orderId = order._id?.toString().slice(-6) || "N/A";
  const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const itemsList = (order.items || [])
    .map((item) => `${item.title || "Item"} x${item.quantity || 0}`)
    .join(", ");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Your order status has been updated</h2>
      <p><strong>Restaurant:</strong> ${restaurantName}</p>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <p><strong>New Status:</strong> ${statusLabel}</p>
      <p><strong>Items:</strong> ${itemCount} total</p>
      <p><strong>Item details:</strong> ${itemsList || "Not available"}</p>
      <p>Thank you for ordering with Order On The Go.</p>
    </div>
  `;

  await sgMail.send({
    to: order.userId.email,
    from: SENDGRID_SENDER,
    subject,
    html,
  });
};

const sendRestaurantNewOrderEmail = async (order, restaurant, restaurantOwner) => {
  console.log("📧 Attempting to send restaurant owner email...");
  
  if (!SENDGRID_API_KEY) {
    console.warn("⚠️ SENDGRID_API_KEY not configured");
    return;
  }
  if (!SENDGRID_SENDER) {
    console.warn("⚠️ SENDGRID_SENDER not configured");
    return;
  }
  if (!restaurantOwner?.email) {
    console.warn("⚠️ Restaurant owner email not available");
    return;
  }

  const restaurantName = restaurant?.title || "Order On The Go";
  const orderId = order._id?.toString().slice(-6) || "N/A";
  const customerName = order.userId?.username || "Customer";
  const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const itemsList = (order.items || [])
    .map((item) => `${item.title || "Item"} x${item.quantity || 0}`)
    .join(", ");
  const totalAmount = order.totalAmount || 0;
  const phone = order.userId?.phone || "N/A";
  const address = order.address || "N/A";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px;">
      <h2 style="color: #E74C3C;">🛎️ New Order Received!</h2>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Delivery Address:</strong> ${address}</p>
      
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
      
      <h3>Order Details:</h3>
      <p><strong>Items:</strong> ${itemCount} total</p>
      <p><strong>Item List:</strong> ${itemsList || "Not available"}</p>
      <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}</p>
      
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
      
      <p style="color: #27AE60; font-weight: bold;">Please confirm and start preparing this order!</p>
      <p style="color: #7F8C8D; font-size: 12px;">This is an automated notification from Order On The Go.</p>
    </div>
  `;

  try {
    console.log(`📧 Sending email to owner: ${restaurantOwner.email}`);
    await sgMail.send({
      to: restaurantOwner.email,
      from: SENDGRID_SENDER,
      subject: `New Order #${orderId} - Action Required`,
      html,
    });
    console.log(`✅ Email sent successfully to owner: ${restaurantOwner.email}`);
  } catch (error) {
    console.error("❌ Failed to send restaurant owner email:", error.message);
  }
};

const sendStaffActionEmail = async (order, restaurant, staffMembers, status) => {
  console.log(`📧 Attempting to send staff emails. Staff count: ${staffMembers?.length || 0}`);
  
  if (!SENDGRID_API_KEY) {
    console.warn("⚠️ SENDGRID_API_KEY not configured for staff emails");
    return;
  }
  if (!SENDGRID_SENDER) {
    console.warn("⚠️ SENDGRID_SENDER not configured for staff emails");
    return;
  }
  if (!staffMembers || staffMembers.length === 0) {
    console.warn("⚠️ No staff members available to send emails");
    return;
  }

  const restaurantName = restaurant?.title || "Order On The Go";
  const orderId = order._id?.toString().slice(-6) || "N/A";
  const statusLabel = status.replace(/_/g, " ");
  const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const itemsList = (order.items || [])
    .map((item) => `${item.title || "Item"} x${item.quantity || 0}`)
    .join(", ");

  // Group staff by role
  const staffByRole = {
    MANAGER: staffMembers.filter(s => s.staffRole === "MANAGER"),
    CHEF: staffMembers.filter(s => s.staffRole === "CHEF"),
    DELIVERY: staffMembers.filter(s => s.staffRole === "DELIVERY"),
  };

  console.log(`📋 Staff breakdown - MANAGER: ${staffByRole.MANAGER.length}, CHEF: ${staffByRole.CHEF.length}, DELIVERY: ${staffByRole.DELIVERY.length}`);

  // Define role-specific actions and messages
  const roleMessages = {
    MANAGER: {
      title: "New Order Status Update - Manager Action",
      actions: "View order details, approve status changes, manage kitchen operations",
      message: "As a Manager, you can view all order details and approve status changes from staff.",
    },
    CHEF: {
      title: "Order Ready for Preparation - Chef Action",
      actions: "Start food preparation, mark items as ready",
      message: "As a Chef, please start preparing this order. Update status when ready.",
    },
    DELIVERY: {
      title: "Order Status Update - Delivery Action",
      actions: "Update delivery status, mark as out for delivery or delivered",
      message: "As a Delivery staff, you can update the delivery status of orders.",
    },
  };

  for (const role of ["MANAGER", "CHEF", "DELIVERY"]) {
    const staffForRole = staffByRole[role];
    if (staffForRole.length === 0) continue;

    const roleMessage = roleMessages[role];
    
    // Determine if this message is relevant for the current status
    let isRelevant = false;
    let actionButtons = "";

    if (role === "MANAGER") {
      isRelevant = true;
      actionButtons = `
        <p style="margin-top: 20px;">
          <strong>Available Actions:</strong> ${roleMessage.actions}
        </p>
      `;
    } else if (role === "CHEF" && ["PENDING", "CONFIRMED", "PREPARING"].includes(status)) {
      isRelevant = true;
      actionButtons = `
        <p style="margin-top: 20px; background-color: #FFF3CD; padding: 10px; border-radius: 5px;">
          <strong>⚠️ Action Needed:</strong> ${roleMessage.message}<br>
          <strong>Your Actions:</strong> ${roleMessage.actions}
        </p>
      `;
    } else if (role === "DELIVERY" && ["READY", "OUT_FOR_DELIVERY"].includes(status)) {
      isRelevant = true;
      actionButtons = `
        <p style="margin-top: 20px; background-color: #FFF3CD; padding: 10px; border-radius: 5px;">
          <strong>⚠️ Action Needed:</strong> ${roleMessage.message}<br>
          <strong>Your Actions:</strong> ${roleMessage.actions}
        </p>
      `;
    }

    if (isRelevant) {
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px;">
          <h2 style="color: #3498DB;">${roleMessage.title}</h2>
          <p><strong>Restaurant:</strong> ${restaurantName}</p>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Current Status:</strong> ${statusLabel}</p>
          
          <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
          
          <h3>Order Summary:</h3>
          <p><strong>Items:</strong> ${itemCount} total</p>
          <p><strong>Item List:</strong> ${itemsList || "Not available"}</p>
          <p><strong>Your Role:</strong> <span style="color: #27AE60; font-weight: bold;">${role}</span></p>
          
          ${actionButtons}
          
          <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #7F8C8D; font-size: 12px;">Please log in to the dashboard to take action on this order.</p>
          <p style="color: #7F8C8D; font-size: 12px;">This is an automated notification from Order On The Go.</p>
        </div>
      `;

      console.log(`📧 Preparing to send emails to ${staffForRole.length} ${role} staff members`);
      
      for (const staff of staffForRole) {
        try {
          console.log(`📧 Sending ${role} email to ${staff.email}...`);
          await sgMail.send({
            to: staff.email,
            from: SENDGRID_SENDER,
            subject: `[${role}] Order #${orderId} - ${statusLabel}`,
            html,
          });
          console.log(`✅ Email sent successfully to ${role}: ${staff.email}`);
        } catch (error) {
          console.error(`❌ Failed to send email to staff ${staff.email}:`, error.message);
        }
      }
    }
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

  // Send emails to restaurant owner and staff
  console.log(`\n📨 === ORDER PLACED (ID: ${order._id}) - STARTING EMAIL NOTIFICATIONS === 📨`);
  try {
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (restaurant) {
      console.log(`🏪 Restaurant Found: ${restaurant.title}`);
      
      // Fetch restaurant owner
      const restaurantOwner = await User.findById(restaurant.ownerId).select("email username");
      console.log(`👤 Owner Found: ${restaurantOwner?.email || "NOT FOUND"}`);
      
      // Fetch all staff members for this restaurant - they might store either Restaurant._id or Restaurant.ownerId
      console.log(`🔍 Looking for staff: restaurantId or ownerId = ${order.restaurantId} or ${restaurant.ownerId}`);
      
      const staffMembers = await User.find({
        userType: "STAFF",
        $or: [
          { restaurantId: order.restaurantId },  // Staff stored Restaurant._id
          { restaurantId: restaurant.ownerId }    // Staff stored Restaurant.ownerId
        ],
        status: "active",
      }).select("email username staffRole");
      console.log(`👥 Staff Members Found: ${staffMembers.length}`);

      // Populate user details for email
      const populatedOrder = await Order.findById(order._id).populate(
        "userId",
        "username email phone"
      );

      // Send email to restaurant owner
      if (restaurantOwner) {
        console.log(`\n📧 Sending NEW ORDER email to owner...`);
        await sendRestaurantNewOrderEmail(populatedOrder, restaurant, restaurantOwner);
      } else {
        console.warn(`⚠️ Restaurant owner email not available`);
      }

      // Send role-based emails to staff (initial status is PLACED)
      if (staffMembers.length > 0) {
        console.log(`\n📧 Sending role-based notifications to ${staffMembers.length} staff members...`);
        await sendStaffActionEmail(populatedOrder, restaurant, staffMembers, "PLACED");
      } else {
        console.log(`ℹ️ No staff members to notify for this restaurant`);
      }
    } else {
      console.warn(`⚠️ Restaurant not found for ID: ${order.restaurantId}`);
    }
  } catch (error) {
    console.error("❌ Failed to send order notification emails:", error.message);
    console.error("Full error:", error);
  }
  console.log(`📨 === EMAIL NOTIFICATION PROCESS COMPLETE === 📨\n`);

  res.status(201).json(order);
};

// USER ORDERS
exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort("-createdAt");
  res.json(orders);
};

// RESTAURANT ORDERS
exports.getRestaurantOrders = async (req, res) => {
  const restaurantId = await resolveRestaurantId(req.user);
  if (!restaurantId) {
    return res.status(403).json({ message: "Restaurant context not available" });
  }
  const orders = await Order.find({ restaurantId })
    .populate("userId", "username email phone")
    .sort("-createdAt");
  res.json(orders);
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("userId", "username email phone");
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "CANCELLED") {
    return res.status(400).json({ message: "Cancelled orders cannot be updated" });
  }

  const nextStatus = normalizeStatus(req.body.status);

  if (req.user.userType === "STAFF") {
    const staffRestaurantId = await resolveRestaurantId(req.user);
    if (!staffRestaurantId || order.restaurantId.toString() !== staffRestaurantId.toString()) {
      return res.status(403).json({ message: "Not allowed to update this order" });
    }

    const allowedStatuses = getStaffAllowedStatuses(req.user.staffRole);
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(403).json({ message: "Status change requires owner approval" });
    }
  }

  if (req.user.userType === "RESTAURANT") {
    const restaurantId = await resolveRestaurantId(req.user);
    if (!restaurantId || order.restaurantId.toString() !== restaurantId.toString()) {
      return res.status(403).json({ message: "Not allowed to update this order" });
    }
  }

  order.status = nextStatus;
  await order.save();

  console.log(`\n📨 === ORDER STATUS UPDATED (ID: ${order._id}) - NEW STATUS: ${nextStatus} === 📨`);

  // Send customer email notification
  if (nextStatus === "OUT_FOR_DELIVERY" || nextStatus === "DELIVERED") {
    try {
      console.log(`📧 Sending customer status update email...`);
      await sendOrderStatusEmail(order, nextStatus);
    } catch (error) {
      console.error("❌ Failed to send order status email:", error.message);
    }
  }

  // Send role-based staff notifications
  try {
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (restaurant) {
      // Find staff members - they might store either Restaurant._id or Restaurant.ownerId
      console.log(`🔍 Looking for staff: restaurantId or ownerId = ${restaurant._id} or ${restaurant.ownerId}`);
      
      const staffMembers = await User.find({
        userType: "STAFF",
        $or: [
          { restaurantId: order.restaurantId },  // Staff stored Restaurant._id
          { restaurantId: restaurant.ownerId }    // Staff stored Restaurant.ownerId
        ],
        status: "active",
      }).select("email username staffRole");

      console.log(`📧 Found ${staffMembers.length} staff members for notifications`);

      if (staffMembers.length > 0) {
        console.log(`📧 Sending status update notifications to staff...`);
        await sendStaffActionEmail(order, restaurant, staffMembers, nextStatus);
      }
    }
  } catch (error) {
    console.error("❌ Failed to send staff notification emails:", error.message);
  }

  console.log(`📨 === STATUS UPDATE EMAIL PROCESS COMPLETE === 📨\n`);

  res.json(order);
};

// USER CANCEL ORDER
exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not allowed to cancel this order" });
  }

  if (order.status === "CANCELLED") {
    return res.status(400).json({ message: "Order is already cancelled" });
  }

  if (!cancellableStatuses.has(order.status)) {
    return res.status(400).json({ message: "Order can no longer be cancelled" });
  }

  order.status = "CANCELLED";
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

  const staffRestaurantId = await resolveRestaurantId(req.user);
  if (!staffRestaurantId) {
    return res.status(403).json({ message: "Restaurant context not available" });
  }

  if (order.restaurantId.toString() !== staffRestaurantId.toString()) {
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

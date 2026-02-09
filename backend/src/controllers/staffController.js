const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");
const StaffInvite = require("../models/StaffInvite");
const Order = require("../models/Order");
const OrderStatusRequest = require("../models/OrderStatusRequest");

const STAFF_ROLES = ["MANAGER", "CHEF", "DELIVERY", "STAFF"];
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const normalizeEmail = (email) => email.trim().toLowerCase();

const ensureRestaurantOwner = (req, res) => {
  if (req.user.userType !== "RESTAURANT") {
    res.status(403).json({ message: "Only restaurant owners can perform this action" });
    return false;
  }
  return true;
};

exports.createStaffInvite = async (req, res) => {
  if (!ensureRestaurantOwner(req, res)) return;

  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ message: "Email and role are required" });
  }
  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: "Invalid staff role" });
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ message: "A user with this email already exists" });
  }

  const existingInvite = await StaffInvite.findOne({
    email: normalizedEmail,
    restaurantId: req.user._id,
    status: "PENDING",
  });
  if (existingInvite) {
    return res.status(400).json({ message: "An invite is already pending for this email" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);

  const invite = await StaffInvite.create({
    email: normalizedEmail,
    restaurantId: req.user._id,
    role,
    token,
    invitedBy: req.user._id,
    expiresAt,
  });

  const inviteUrl = `${FRONTEND_BASE_URL}/staff-invite/${invite.token}`;

  if (SENDGRID_API_KEY && SENDGRID_SENDER) {
    try {
      await sgMail.send({
        to: normalizedEmail,
        from: SENDGRID_SENDER,
        subject: "You're invited to join Order On The Go",
        text: `You have been invited to join as ${role}. Complete your account here: ${inviteUrl}`,
        html: `
          <p>You have been invited to join as <strong>${role}</strong>.</p>
          <p>Click the link below to complete your account:</p>
          <p><a href="${inviteUrl}">${inviteUrl}</a></p>
          <p>This invite expires in 3 days.</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send invite email:", error);
    }
  }

  res.status(201).json({
    message: "Staff invite created",
    inviteToken: invite.token,
    expiresAt: invite.expiresAt,
  });
};

exports.completeStaffInvite = async (req, res) => {
  const { token } = req.params;
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const invite = await StaffInvite.findOne({ token });
  if (!invite || invite.status !== "PENDING") {
    return res.status(400).json({ message: "Invite is invalid or already used" });
  }

  if (invite.expiresAt < new Date()) {
    invite.status = "EXPIRED";
    await invite.save();
    return res.status(400).json({ message: "Invite has expired" });
  }

  const existingUser = await User.findOne({ email: invite.email });
  if (existingUser) {
    return res.status(400).json({ message: "A user with this email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const staffUser = await User.create({
    username,
    email: invite.email,
    password: hashedPassword,
    userType: "STAFF",
    staffRole: invite.role,
    restaurantId: invite.restaurantId,
    invitedBy: invite.invitedBy,
    approval: false,
  });

  invite.status = "ACCEPTED";
  invite.acceptedAt = new Date();
  await invite.save();

  res.status(201).json({
    message: "Staff account created. Awaiting owner approval.",
    staffId: staffUser._id,
  });
};

exports.listStaff = async (req, res) => {
  if (!ensureRestaurantOwner(req, res)) return;

  const staff = await User.find({
    restaurantId: req.user._id,
    userType: "STAFF",
  }).select("username email staffRole status approval createdAt");

  res.json(staff);
};

exports.approveStaff = async (req, res) => {
  if (!ensureRestaurantOwner(req, res)) return;

  const staff = await User.findOne({
    _id: req.params.id,
    restaurantId: req.user._id,
    userType: "STAFF",
  });

  if (!staff) {
    return res.status(404).json({ message: "Staff member not found" });
  }

  staff.approval = true;
  await staff.save();

  res.json({ message: "Staff approved", staff });
};

exports.getPendingStatusRequests = async (req, res) => {
  if (!ensureRestaurantOwner(req, res)) return;

  const requests = await OrderStatusRequest.find({
    restaurantId: req.user._id,
    status: "PENDING",
  })
    .populate("orderId", "status totalAmount createdAt")
    .populate("requestedBy", "username email staffRole")
    .sort("-createdAt");

  res.json(requests);
};

exports.approveStatusRequest = async (req, res) => {
  if (!ensureRestaurantOwner(req, res)) return;

  const request = await OrderStatusRequest.findOne({
    _id: req.params.id,
    restaurantId: req.user._id,
    status: "PENDING",
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  const order = await Order.findById(request.orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = request.toStatus;
  await order.save();

  request.status = "APPROVED";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  res.json({ message: "Status change approved", order });
};

exports.rejectStatusRequest = async (req, res) => {
  if (!ensureRestaurantOwner(req, res)) return;

  const request = await OrderStatusRequest.findOne({
    _id: req.params.id,
    restaurantId: req.user._id,
    status: "PENDING",
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = "REJECTED";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  res.json({ message: "Status change rejected" });
};

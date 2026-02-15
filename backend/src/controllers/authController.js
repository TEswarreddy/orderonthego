const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sgMail = require("@sendgrid/mail");
const { getImageData } = require("../utils/uploadHandler");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER
exports.register = async (req, res) => {
  const { username, email, password, userType, phone, address, restaurantName, restaurantAddress, cuisineType, description } = req.body;

  if (userType === "STAFF") {
    return res.status(403).json({ message: "Staff accounts must be created via invitation" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate email verification code
  const emailVerificationCode = generateVerificationCode();

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    userType,
    phone,
    address,
    emailVerificationToken: emailVerificationCode,
    verificationTokenExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    approval: userType === "RESTAURANT" ? false : true,
  });

  // If restaurant, create the restaurant document as well
  if (userType === "RESTAURANT") {
    await Restaurant.create({
      ownerId: user._id,
      title: restaurantName,
      address: restaurantAddress,
      phone,
      cuisineType,
      description,
    });
  }

  // Send email verification code
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER) {
    console.warn("⚠️ SendGrid not configured. Email verification skipped.");
    console.warn("Missing:", {
      SENDGRID_API_KEY: !process.env.SENDGRID_API_KEY ? "NOT SET" : "SET",
      SENDGRID_SENDER: !process.env.SENDGRID_SENDER ? "NOT SET" : "SET"
    });
  } else {
    try {
      const msg = {
        to: email,
        from: process.env.SENDGRID_SENDER,
        subject: "Verify Your Email - Order On The Go",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .code-box { background: #f3f4f6; border: 2px dashed #f97316; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .code { font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 5px; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍽️ Welcome to Order On The Go!</h1>
              </div>
              <div class="content">
                <h2>Hello ${username}!</h2>
                <p>Thank you for registering with us. Please use the verification code below to verify your email address:</p>
                
                <div class="code-box">
                  <div class="code">${emailVerificationCode}</div>
                </div>
                
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <p>If you didn't create this account, please ignore this email.</p>
                
                <p>Best regards,<br>Order On The Go Team</p>
              </div>
              <div class="footer">
                <p>© 2026 Order On The Go. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await sgMail.send(msg);
      console.log("✅ Email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", {
        error: emailError.message,
        code: emailError.code,
        toEmail: email,
        fromEmail: process.env.SENDGRID_SENDER
      });
    }
  }

  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    emailVerified: false,
    phoneVerified: false,
    message: "Registration successful! Please check your email for verification code.",
    token: generateToken(user),
  });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", req.body);

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.userType === "RESTAURANT" && !user.approval) {
    return res.status(403).json({ message: "Restaurant not approved by admin" });
  }

  if (user.userType === "STAFF" && !user.approval) {
    return res.status(403).json({ message: "Staff account pending owner approval" });
  }

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    staffRole: user.staffRole,
    restaurantId: user.restaurantId,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    token: generateToken(user),
  });
};

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      profileImage: getImageData(user),
      userType: user.userType,
      staffRole: user.staffRole,
      restaurantId: user.restaurantId,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// UPDATE USER PROFILE
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { username, phone, address },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: getImageData(user),
        userType: user.userType,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// UPLOAD PROFILE IMAGE
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Validate file type
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed" });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: "File size must be less than 5MB" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store image as buffer in MongoDB
    user.profileImageBuffer = req.file.buffer;
    user.profileImageMimeType = req.file.mimetype;
    user.profileImage = `profile_${userId}_${Date.now()}`;

    await user.save();

    res.json({
      message: "Profile image uploaded successfully",
      profileImage: getImageData(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};

// DELETE PROFILE IMAGE
exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = null;
    user.profileImageBuffer = null;
    user.profileImageMimeType = null;

    await user.save();

    res.json({ message: "Profile image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error: error.message });
  }
};

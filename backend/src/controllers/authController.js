const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sgMail = require("@sendgrid/mail");

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
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
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

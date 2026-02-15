const User = require("../models/User");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Email Verification Code
exports.sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Save code with 10 minute expiry
    user.emailVerificationToken = verificationCode;
    user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
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
            .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Email Verification</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.username}!</h2>
              <p>Thank you for registering with Order On The Go. Please use the verification code below to verify your email address:</p>
              
              <div class="code-box">
                <div class="code">${verificationCode}</div>
              </div>
              
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this verification, please ignore this email.</p>
              
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

    // Validate SendGrid configuration
    if (!process.env.SENDGRID_API_KEY) {
      console.error("❌ SENDGRID_API_KEY not configured");
      return res.status(500).json({ 
        message: "Email service not configured. Please contact support.",
        error: "Missing SENDGRID_API_KEY"
      });
    }
    if (!process.env.SENDGRID_SENDER) {
      console.error("❌ SENDGRID_SENDER not configured");
      return res.status(500).json({ 
        message: "Email service not configured. Please contact support.",
        error: "Missing SENDGRID_SENDER"
      });
    }

    await sgMail.send(msg);
    console.log("✅ Verification email sent to:", email);

    res.json({ 
      message: "Verification code sent to your email",
      expiresIn: "10 minutes"
    });
  } catch (error) {
    console.error("❌ Error sending email verification:", {
      message: error.message,
      code: error.code,
      response: error.response?.body,
      toEmail: email,
      sender: process.env.SENDGRID_SENDER
    });
    res.status(500).json({ 
      message: "Failed to send verification code",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.response?.body : undefined
    });
  }
};

// Send Phone Verification Code (SMS)
exports.sendPhoneVerification = async (req, res) => {
  try {
    const { phone, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ message: "Phone already verified" });
    }

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(500).json({ message: "SMS service not configured. Please contact support." });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Save code with 10 minute expiry
    user.phoneVerificationToken = verificationCode;
    user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.phone = phone;
    await user.save();

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Order On The Go verification code is: ${verificationCode}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith("+") ? phone : `+91${phone}` // Add +91 for India if not present
      });

      res.json({ 
        message: "Verification code sent to your phone",
        phone: phone,
        expiresIn: "10 minutes"
      });
    } catch (smsError) {
      console.error("Twilio SMS Error:", smsError);
      // Fallback to email if SMS fails
      const msg = {
        to: email,
        from: process.env.SENDGRID_SENDER,
        subject: "Phone Verification Code - Order On The Go",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .code-box { background: #f3f4f6; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
              .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📱 Phone Verification</h1>
              </div>
              <div class="content">
                <h2>Hello ${user.username}!</h2>
                <p>Your phone verification code for <strong>${phone}</strong> is:</p>
                
                <div class="code-box">
                  <div class="code">${verificationCode}</div>
                </div>
                
                <div class="alert">
                  <strong>⚠️ Note:</strong> Your SMS could not be delivered at this moment. We've sent the code to your email instead. Please use this code to verify your phone number.
                </div>
                
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <p>If you didn't request this verification, please ignore this email.</p>
                
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

      res.json({ 
        message: "Verification code sent to your email (SMS pending)",
        phone: phone,
        expiresIn: "10 minutes",
        fallback: true
      });
    }
  } catch (error) {
    console.error("Error sending phone verification:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

// Verify Email Code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.emailVerificationToken) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }

    if (user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Verification code expired. Please request a new one." });
    }

    if (user.emailVerificationToken !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ 
      message: "Email verified successfully!",
      emailVerified: true
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Failed to verify email" });
  }
};

// Verify Phone Code
exports.verifyPhone = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ message: "Phone already verified" });
    }

    if (!user.phoneVerificationToken) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }

    if (user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Verification code expired. Please request a new one." });
    }

    if (user.phoneVerificationToken !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark phone as verified
    user.phoneVerified = true;
    user.phoneVerificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ 
      message: "Phone verified successfully!",
      phoneVerified: true
    });
  } catch (error) {
    console.error("Error verifying phone:", error);
    res.status(500).json({ message: "Failed to verify phone" });
  }
};

// Resend Verification Code
exports.resendVerification = async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'email' or 'phone'

    if (type === 'email') {
      return exports.sendEmailVerification(req, res);
    } else if (type === 'phone') {
      return exports.sendPhoneVerification(req, res);
    } else {
      return res.status(400).json({ message: "Invalid verification type" });
    }
  } catch (error) {
    console.error("Error resending verification:", error);
    res.status(500).json({ message: "Failed to resend verification code" });
  }
};

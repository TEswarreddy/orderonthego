const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verificationController");

// Send verification codes
router.post("/send-email", verificationController.sendEmailVerification);
router.post("/send-phone", verificationController.sendPhoneVerification);

// Verify codes
router.post("/verify-email", verificationController.verifyEmail);
router.post("/verify-phone", verificationController.verifyPhone);

// Resend verification
router.post("/resend", verificationController.resendVerification);

module.exports = router;

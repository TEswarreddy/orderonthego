const express = require("express");
const router = express.Router();
const { register, login, getUserProfile, updateUserProfile, uploadProfileImage, deleteProfileImage } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// Simple middleware to handle multipart form-data without multer
const handleMultipart = express.raw({ type: 'application/octet-stream', limit: '10mb' });

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/profile/image", protect, uploadProfileImageMiddleware, uploadProfileImage);
router.delete("/profile/image", protect, deleteProfileImage);

// Middleware to handle image upload
function uploadProfileImageMiddleware(req, res, next) {
  const chunks = [];
  let contentType = req.get('content-type');
  
  if (!contentType || !contentType.startsWith('image/')) {
    return res.status(400).json({ message: "Invalid content type. Expected image" });
  }

  req.on('data', chunk => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    
    if (buffer.length === 0) {
      return res.status(400).json({ message: "No image data provided" });
    }

    // Max file size 5MB
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(400).json({ message: "File size must be less than 5MB" });
    }

    req.file = {
      buffer: buffer,
      mimetype: contentType,
      size: buffer.length
    };

    next();
  });

  req.on('error', (error) => {
    res.status(500).json({ message: "Error reading image data", error: error.message });
  });
}

module.exports = router;

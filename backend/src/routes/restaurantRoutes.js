const express = require("express");
const router = express.Router();
const {
  getRestaurantProfile,
  updateRestaurantProfile,
  uploadRestaurantProfileImage,
  deleteRestaurantProfileImage,
  uploadUserProfileImage,
  deleteUserProfileImage,
  getAllRestaurants,
} = require("../controllers/restaurantController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Get all restaurants (public for admin)
router.get("/", getAllRestaurants);

// Restaurant profile endpoints
router.get("/profile", protect, authorize("RESTAURANT"), getRestaurantProfile);
router.put("/profile", protect, authorize("RESTAURANT"), updateRestaurantProfile);
router.post("/profile/image", protect, authorize("RESTAURANT"), uploadProfileImageMiddleware, uploadRestaurantProfileImage);
router.delete("/profile/image", protect, authorize("RESTAURANT"), deleteRestaurantProfileImage);

// User (owner) profile image endpoints
router.post("/profile/user-image", protect, authorize("RESTAURANT"), uploadProfileImageMiddleware, uploadUserProfileImage);
router.delete("/profile/user-image", protect, authorize("RESTAURANT"), deleteUserProfileImage);

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

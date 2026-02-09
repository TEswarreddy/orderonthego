const express = require("express");
const router = express.Router();
const {
  createStaffInvite,
  completeStaffInvite,
  listStaff,
  approveStaff,
  getPendingStatusRequests,
  approveStatusRequest,
  rejectStatusRequest,
  getStaffProfile,
  updateStaffProfile,
  uploadStaffProfileImage,
  deleteStaffProfileImage,
} = require("../controllers/staffController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public completion endpoint for invited staff
router.post("/invites/:token/complete", completeStaffInvite);

// Restaurant owner endpoints
router.post("/invites", protect, authorize("RESTAURANT"), createStaffInvite);
router.get("/members", protect, authorize("RESTAURANT"), listStaff);
router.put("/members/:id/approve", protect, authorize("RESTAURANT"), approveStaff);

router.get("/status-requests", protect, authorize("RESTAURANT"), getPendingStatusRequests);
router.put("/status-requests/:id/approve", protect, authorize("RESTAURANT"), approveStatusRequest);
router.put("/status-requests/:id/reject", protect, authorize("RESTAURANT"), rejectStatusRequest);

// Staff profile endpoints
router.get("/profile", protect, authorize("STAFF"), getStaffProfile);
router.put("/profile", protect, authorize("STAFF"), updateStaffProfile);
router.post("/profile/image", protect, authorize("STAFF"), uploadProfileImageMiddleware, uploadStaffProfileImage);
router.delete("/profile/image", protect, authorize("STAFF"), deleteStaffProfileImage);

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

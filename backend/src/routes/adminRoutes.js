const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  approveRestaurant,
  updateRestaurantAdmin,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAllFoodsAdmin,
  createFoodAdmin,
  updateFoodAdmin,
  deleteFoodAdmin,
  getAllStaffAdmin,
  createStaffAdmin,
  updateStaffAdmin,
  deleteStaffAdmin,
  resetStaffPasswordAdmin,
  getRevenueAnalytics,
  getOrderDistribution,
  getRestaurantStaff,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,
  deleteAdminProfileImage,
  getFoodRevenueAnalytics,
  getSubscriptionRevenueAnalytics,
  getRevenueByRestaurant,
  getRevenueStats,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Middleware to protect admin routes
const adminProtect = [protect, authorize("ADMIN")];

// Admin Profile endpoints
router.get("/profile", protect, authorize("ADMIN"), getAdminProfile);
router.put("/profile", protect, authorize("ADMIN"), updateAdminProfile);
router.post("/profile/image", protect, authorize("ADMIN"), uploadProfileImageMiddleware, uploadAdminProfileImage);
router.delete("/profile/image", protect, authorize("ADMIN"), deleteAdminProfileImage);

// Dashboard Stats
router.get("/stats", adminProtect, getDashboardStats);

// Users Management
router.get("/users", adminProtect, getAllUsers);
router.get("/users/:id", adminProtect, getUserById);
router.put("/users/:id/status", adminProtect, updateUserStatus);
router.delete("/users/:id", adminProtect, deleteUser);

// Restaurant Management
router.put("/approve-restaurant/:id", adminProtect, approveRestaurant);
router.put("/restaurants/:id", adminProtect, updateRestaurantAdmin);
router.get("/restaurants/:id/staff", adminProtect, getRestaurantStaff);

// Orders Management
router.get("/orders", adminProtect, getAllOrders);
router.get("/orders/:id", adminProtect, getOrderById);
router.put("/orders/:id/status", adminProtect, updateOrderStatus);
router.delete("/orders/:id", adminProtect, deleteOrder);

// Foods Management
router.get("/foods", adminProtect, getAllFoodsAdmin);
router.post("/foods", adminProtect, createFoodAdmin);
router.put("/foods/:id", adminProtect, updateFoodAdmin);
router.delete("/foods/:id", adminProtect, deleteFoodAdmin);

// Staff Management
router.get("/staff", adminProtect, getAllStaffAdmin);
router.post("/staff", adminProtect, createStaffAdmin);
router.put("/staff/:id", adminProtect, updateStaffAdmin);
router.delete("/staff/:id", adminProtect, deleteStaffAdmin);
router.post("/staff/:id/reset-password", adminProtect, resetStaffPasswordAdmin);

// Analytics
router.get("/analytics/revenue", adminProtect, getRevenueAnalytics);
router.get("/analytics/orders-distribution", adminProtect, getOrderDistribution);
router.get("/analytics/revenue/food", adminProtect, getFoodRevenueAnalytics);
router.get("/analytics/revenue/subscriptions", adminProtect, getSubscriptionRevenueAnalytics);
router.get("/analytics/revenue/by-restaurant", adminProtect, getRevenueByRestaurant);
router.get("/analytics/revenue/stats", adminProtect, getRevenueStats);

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

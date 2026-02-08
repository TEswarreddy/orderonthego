const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  approveRestaurant,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getRevenueAnalytics,
  getOrderDistribution,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Middleware to protect admin routes
const adminProtect = [protect, authorize("ADMIN")];

// Dashboard Stats
router.get("/stats", adminProtect, getDashboardStats);

// Users Management
router.get("/users", adminProtect, getAllUsers);
router.get("/users/:id", adminProtect, getUserById);
router.put("/users/:id/status", adminProtect, updateUserStatus);
router.delete("/users/:id", adminProtect, deleteUser);

// Restaurant Management
router.put("/approve-restaurant/:id", adminProtect, approveRestaurant);

// Orders Management
router.get("/orders", adminProtect, getAllOrders);
router.get("/orders/:id", adminProtect, getOrderById);
router.put("/orders/:id/status", adminProtect, updateOrderStatus);
router.delete("/orders/:id", adminProtect, deleteOrder);

// Analytics
router.get("/analytics/revenue", adminProtect, getRevenueAnalytics);
router.get("/analytics/orders-distribution", adminProtect, getOrderDistribution);

module.exports = router;

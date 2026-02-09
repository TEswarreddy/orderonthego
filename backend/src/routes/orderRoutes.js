const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus,
  requestStatusChange,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/", protect, authorize("USER"), placeOrder);
router.get("/my-orders", protect, authorize("USER"), getUserOrders);
router.get(
  "/restaurant",
  protect,
  authorize("RESTAURANT", "STAFF"),
  getRestaurantOrders
);
router.put(
  "/:id/status",
  protect,
  authorize("RESTAURANT", "STAFF"),
  updateOrderStatus
);
router.post(
  "/:id/status-request",
  protect,
  authorize("STAFF"),
  requestStatusChange
);

module.exports = router;

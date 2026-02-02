const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  approveRestaurant,
  getAllOrders,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/users", protect, authorize("ADMIN"), getAllUsers);
router.put(
  "/approve-restaurant/:id",
  protect,
  authorize("ADMIN"),
  approveRestaurant
);
router.get("/orders", protect, authorize("ADMIN"), getAllOrders);

module.exports = router;

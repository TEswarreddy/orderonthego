const express = require("express");
const router = express.Router();
const {
  addFood,
  getAllFoods,
  getFoodById,
  getFoodsByRestaurant,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

const { protect, authorize } = require("../middlewares/authMiddleware");
const { checkMenuItemLimit } = require("../middlewares/subscriptionMiddleware");

router.post("/", protect, authorize("RESTAURANT"), checkMenuItemLimit, addFood);
router.get("/", getAllFoods);
router.get("/restaurant/:id", getFoodsByRestaurant);
router.get("/:id", getFoodById);
router.put("/:id", protect, authorize("RESTAURANT"), updateFood);
router.delete("/:id", protect, authorize("RESTAURANT"), deleteFood);

module.exports = router;

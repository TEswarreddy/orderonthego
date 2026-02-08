const express = require("express");
const router = express.Router();
const {
  addFood,
  getAllFoods,
  getFoodById,
  getFoodsByRestaurant,
} = require("../controllers/foodController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/", protect, authorize("RESTAURANT"), addFood);
router.get("/", getAllFoods);
router.get("/restaurant/:id", getFoodsByRestaurant);
router.get("/:id", getFoodById);

module.exports = router;

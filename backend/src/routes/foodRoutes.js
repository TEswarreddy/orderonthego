const express = require("express");
const router = express.Router();
const {
  addFood,
  getAllFoods,
  getFoodsByRestaurant,
} = require("../controllers/foodController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/", protect, authorize("RESTAURANT"), addFood);
router.get("/", getAllFoods);
router.get("/restaurant/:id", getFoodsByRestaurant);

module.exports = router;

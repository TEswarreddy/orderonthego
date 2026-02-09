const express = require("express");
const router = express.Router();
const {
  addFood,
  getAllFoods,
  getFoodById,
  getFoodsByRestaurant,
  getOwnFoods,
  updateFood,
  deleteFood,
  updateAvailability,
} = require("../controllers/foodController");

const { protect, authorize } = require("../middlewares/authMiddleware");
const { checkMenuItemLimit } = require("../middlewares/subscriptionMiddleware");

router.post("/", protect, authorize("RESTAURANT", "STAFF"), checkMenuItemLimit, addFood);
router.get("/my-foods", protect, authorize("RESTAURANT", "STAFF"), getOwnFoods);
router.get("/", getAllFoods);
router.get("/restaurant/:id", getFoodsByRestaurant);
router.get("/:id", getFoodById);
router.put("/:id", protect, authorize("RESTAURANT"), updateFood);
router.put("/:id/availability", protect, authorize("RESTAURANT", "STAFF"), updateAvailability);
router.delete("/:id", protect, authorize("RESTAURANT"), deleteFood);

module.exports = router;

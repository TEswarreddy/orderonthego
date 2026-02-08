const express = require("express");
const router = express.Router();
const {
  addReview,
  getReviewsByFood,
  updateReview,
  deleteReview,
  getReviewStats,
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

// Public routes
router.get("/food/:foodId", getReviewsByFood);
router.get("/food/:foodId/stats", getReviewStats);

// Protected routes (USER only)
router.post("/", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;

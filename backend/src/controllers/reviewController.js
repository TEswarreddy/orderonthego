const Review = require("../models/Review");
const mongoose = require("mongoose");

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { foodId, rating, comment } = req.body;

    if (!foodId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this food
    const existingReview = await Review.findOne({
      foodId,
      userId: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this food" });
    }

    const review = await Review.create({
      foodId,
      userId: req.user._id,
      rating: Number(rating),
      comment,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "userId",
      "name email"
    );

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
};

// Get reviews for a food item
exports.getReviewsByFood = async (req, res) => {
  try {
    const reviews = await Review.find({ foodId: req.params.foodId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    const updatedReview = await Review.findById(review._id).populate(
      "userId",
      "name email"
    );

    res.json(updatedReview);
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

// Get review statistics for a food item
exports.getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { foodId: new mongoose.Types.ObjectId(req.params.foodId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    res.json(stats[0] || { averageRating: 0, totalReviews: 0 });
  } catch (error) {
    console.error("Get review stats error:", error);
    res.status(500).json({ message: "Failed to fetch review statistics" });
  }
};

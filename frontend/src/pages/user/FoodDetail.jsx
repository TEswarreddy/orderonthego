import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import { ArrowLeft, Heart, Star, Clock, MapPin, Truck, Shield, AlertCircle } from "lucide-react";

const FoodDetail = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [cartLoading, setCartLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [editingReview, setEditingReview] = useState(false);

  useEffect(() => {
    const fetchFoodDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/foods/${foodId}`);
        setFood(res.data);
      } catch (err) {
        console.error("Failed to fetch food detail:", err);
        alert("Failed to load food details");
      } finally {
        setLoading(false);
      }
    };
    fetchFoodDetail();
  }, [foodId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/reviews/food/${foodId}`);
        setReviews(res.data);
        
        // Find current user's review
        if (user) {
          const myReview = res.data.find(
            (review) => review.userId._id === user._id
          );
          setUserReview(myReview);
          if (myReview) {
            setReviewForm({ rating: myReview.rating, comment: myReview.comment });
          }
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    const fetchReviewStats = async () => {
      try {
        const res = await axios.get(`/reviews/food/${foodId}/stats`);
        setReviewStats(res.data);
      } catch (err) {
        console.error("Failed to fetch review stats:", err);
      }
    };

    if (foodId) {
      fetchReviews();
      fetchReviewStats();
    }
  }, [foodId, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert("Please write a comment");
      return;
    }

    try {
      setSubmittingReview(true);

      if (userReview && editingReview) {
        // Update existing review
        const res = await axios.put(`/reviews/${userReview._id}`, reviewForm);
        setReviews(
          reviews.map((r) => (r._id === userReview._id ? res.data : r))
        );
        setUserReview(res.data);
        setEditingReview(false);
        alert("Review updated successfully! ✅");
      } else {
        // Add new review
        const res = await axios.post("/reviews", {
          foodId,
          ...reviewForm,
        });
        setReviews([res.data, ...reviews]);
        setUserReview(res.data);
        alert("Review submitted successfully! ✅");
      }

      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }

    try {
      await axios.delete(`/reviews/${userReview._id}`);
      setReviews(reviews.filter((r) => r._id !== userReview._id));
      setUserReview(null);
      setReviewForm({ rating: 5, comment: "" });
      setEditingReview(false);
      alert("Review deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  const startEditReview = () => {
    setEditingReview(true);
    setReviewForm({ rating: userReview.rating, comment: userReview.comment });
  };

  const cancelEditReview = () => {
    setEditingReview(false);
    setReviewForm({ rating: userReview.rating, comment: userReview.comment });
  };

  const addToCart = async () => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      setCartLoading(true);
      await axios.post("/cart", {
        foodId,
        quantity,
      });
      alert("Added to cart 🛒");
      setQuantity(1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading food details...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-semibold mb-4">Food not found</p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section - Image and Details */}
          <div className="md:col-span-2">
            {/* Food Image */}
            <div className="relative bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl h-96 flex items-center justify-center mb-6 shadow-lg overflow-hidden group">
              <span className="text-9xl group-hover:scale-110 transition-transform duration-300">🍜</span>
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>

              {/* Discount Badge */}
              {food.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  -
                  {Math.round(
                    ((food.originalPrice - food.price) / food.originalPrice) * 100
                  )}
                  %
                </div>
              )}
            </div>

            {/* Food Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    {food.title}
                  </h1>
                  <p className="text-orange-600 text-lg font-semibold capitalize">
                    {food.category || "Other"}
                  </p>
                </div>
              </div>

              {/* Rating and Info */}
              <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b">
                {reviewStats.totalReviews > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={`${
                            i < Math.round(reviewStats.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-700">
                      {reviewStats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">({reviewStats.totalReviews} reviews)</span>
                  </div>
                ) : (
                  <p className="text-gray-500">No ratings yet</p>
                )}

                {food.deliveryTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="text-orange-500" size={20} />
                    <span className="text-gray-700 font-semibold">
                      {food.deliveryTime} min delivery
                    </span>
                  </div>
                )}

                {food.restaurantName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="text-orange-500" size={20} />
                    <span className="text-gray-700 font-semibold">
                      {food.restaurantName}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {food.description}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex gap-4 border-b mb-4">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-2 px-4 font-semibold transition-colors ${
                      activeTab === "overview"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`pb-2 px-4 font-semibold transition-colors ${
                      activeTab === "ingredients"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Ingredients
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-2 px-4 font-semibold transition-colors ${
                      activeTab === "reviews"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Reviews
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Shield className="text-blue-600" size={20} />
                      <span className="text-blue-800">100% fresh ingredients</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <Truck className="text-green-600" size={20} />
                      <span className="text-green-800">Fast & reliable delivery</span>
                    </div>
                  </div>
                )}

                {activeTab === "ingredients" && (
                  <div className="space-y-3">
                    {[
                      "Premium chicken breast",
                      "Fresh herbs and spices",
                      "Organic vegetables",
                      "Special house sauce",
                      "Aromatic basmati rice",
                    ].map((ingredient, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                        <span className="w-4 h-4 bg-orange-500 rounded-full"></span>
                        <span className="text-gray-700">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {/* Review Form */}
                    {user && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-200">
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">
                          {userReview && !editingReview
                            ? "Your Review"
                            : editingReview
                            ? "Edit Your Review"
                            : "Write a Review"}
                        </h4>

                        {userReview && !editingReview ? (
                          <div className="space-y-3">
                            <div className="flex gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={20}
                                  className={`${
                                    i < userReview.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{userReview.comment}</p>
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={startEditReview}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={handleDeleteReview}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitReview} className="space-y-4">
                            {/* Star Rating */}
                            <div>
                              <label className="block text-gray-700 font-semibold mb-2">
                                Rating
                              </label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <button
                                    key={rating}
                                    type="button"
                                    onClick={() =>
                                      setReviewForm({ ...reviewForm, rating })
                                    }
                                    className="transition-transform hover:scale-125"
                                  >
                                    <Star
                                      size={32}
                                      className={`${
                                        rating <= reviewForm.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Comment */}
                            <div>
                              <label className="block text-gray-700 font-semibold mb-2">
                                Your Review
                              </label>
                              <textarea
                                value={reviewForm.comment}
                                onChange={(e) =>
                                  setReviewForm({
                                    ...reviewForm,
                                    comment: e.target.value,
                                  })
                                }
                                placeholder="Share your experience with this food..."
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                              />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold disabled:opacity-50"
                              >
                                {submittingReview
                                  ? "Submitting..."
                                  : editingReview
                                  ? "Update Review"
                                  : "Submit Review"}
                              </button>
                              {editingReview && (
                                <button
                                  type="button"
                                  onClick={cancelEditReview}
                                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">
                          No reviews yet. Be the first to review!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-lg">
                          All Reviews ({reviews.length})
                        </h4>
                        {reviews.map((review) => (
                          <div key={review._id} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {review.userId.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={`${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Price and Add to Cart */}
          <div className="md:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24 space-y-6">
              {/* Price */}
              <div>
                <p className="text-gray-500 text-sm mb-2">Price</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-bold text-orange-600">₹{food.price}</p>
                  {food.originalPrice && (
                    <p className="text-xl text-gray-400 line-through">
                      ₹{food.originalPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <p className="text-gray-700 font-semibold mb-4">Quantity</p>
                <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex items-center justify-center w-10 h-10 bg-white text-orange-600 rounded-lg hover:bg-orange-100 transition font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-gray-800 flex-1 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex items-center justify-center w-10 h-10 bg-white text-orange-600 rounded-lg hover:bg-orange-100 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Total</p>
                <p className="text-3xl font-bold text-orange-600">
                  ₹{(food.price * quantity).toFixed(2)}
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={cartLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cartLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Adding...
                  </>
                ) : (
                  <>🛒 Add to Cart</>
                )}
              </button>

              {/* Continue Shopping Button */}
              <button
                onClick={() => navigate("/")}
                className="w-full border-2 border-orange-500 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
              >
                Continue Shopping
              </button>

              {/* Info Cards */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex gap-3 items-start">
                  <Truck className="text-green-600 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Free Delivery</p>
                    <p className="text-sm text-gray-600">On orders above ₹500</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Shield className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Satisfaction Guaranteed</p>
                    <p className="text-sm text-gray-600">100% authentic & fresh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;

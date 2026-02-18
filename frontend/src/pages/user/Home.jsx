import { useEffect, useState, useContext, useMemo } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Star, MapPin, Clock, TrendingUp, ShoppingCart } from "lucide-react";

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFoodType, setSelectedFoodType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("popularity");
  const [favorites, setFavorites] = useState([]);

  // Extract categories from foods
  const categories = useMemo(() => {
    if (foods.length === 0) return [];
    const cats = [...new Set(foods.map((f) => f.category || "Other"))];
    return ["all", ...cats];
  }, [foods]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/foods");
        setFoods(res.data);
        // Initialize quantities
        const initialQtys = {};
        res.data.forEach((food) => {
          initialQtys[food._id] = 1;
        });
        setQuantities(initialQtys);
      } catch (err) {
        console.error("Failed to fetch foods:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Filtered and sorted foods
  const filteredFoods = useMemo(() => {
    let result = foods.filter((food) => {
      const matchesSearch = food.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || food.category === selectedCategory;
      const matchesPrice = food.price >= priceRange[0] && food.price <= priceRange[1];
      const matchesFoodType =
        selectedFoodType === "all" ||
        (selectedFoodType === "veg" && food.isVeg === true) ||
        (selectedFoodType === "nonveg" && food.isVeg === false);

      return matchesSearch && matchesCategory && matchesPrice && matchesFoodType;
    });

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [foods, searchQuery, selectedCategory, priceRange, sortBy, selectedFoodType]);

  const toggleFavorite = (foodId) => {
    setFavorites((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId]
    );
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      italian: "🍕",
      american: "🍔",
      thai: "🍜",
      japanese: "🍣",
      british: "🐟",
      mexican: "🌮",
      dessert: "🍰",
      drinks: "🥤",
      healthy: "🥗",
      mediterranean: "🫒",
      indian: "🍛",
      pizza: "🍕",
      burger: "🍔",
      pasta: "🍝",
      sushi: "🍣",
      chicken: "🍗",
      chinese: "🥡",
      breakfast: "🥞",
      salad: "🥗",
      seafood: "🦐",
      other: "🍽️",
    };
    return emojis[category?.toLowerCase()] || emojis.other;
  };

  const getCategoryColor = (category) => {
    const colors = {
      italian: "from-red-400 to-orange-500",
      american: "from-yellow-400 to-red-500",
      thai: "from-orange-400 to-red-500",
      japanese: "from-pink-400 to-rose-500",
      british: "from-blue-400 to-indigo-500",
      mexican: "from-yellow-500 to-orange-600",
      dessert: "from-purple-400 to-pink-400",
      drinks: "from-blue-400 to-cyan-400",
      healthy: "from-green-400 to-emerald-500",
      mediterranean: "from-green-500 to-teal-500",
      indian: "from-orange-500 to-red-600",
      pizza: "from-yellow-400 to-orange-400",
      burger: "from-red-400 to-orange-500",
      pasta: "from-yellow-300 to-amber-400",
      sushi: "from-pink-400 to-rose-400",
      chicken: "from-orange-400 to-red-400",
      chinese: "from-red-400 to-pink-400",
      breakfast: "from-yellow-400 to-orange-400",
      salad: "from-green-400 to-emerald-400",
      seafood: "from-blue-400 to-indigo-400",
      other: "from-orange-400 to-red-400",
    };
    return colors[category?.toLowerCase()] || colors.other;
  };

  const updateQuantity = (foodId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: Math.max(1, (prev[foodId] || 1) + change),
    }));
  };

  const addToCart = async (foodId) => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await axios.post("/cart", {
        foodId,
        quantity: quantities[foodId] || 1,
      });
      alert("Added to cart 🛒");
      setQuantities((prev) => ({ ...prev, [foodId]: 1 }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white py-16 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 -mb-36 animate-pulse"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
                🍽️ Order <span className="text-yellow-200">Delicious</span> Food
              </h1>
              <p className="text-xl md:text-2xl opacity-95 mb-6 leading-relaxed drop-shadow-md">
                Discover amazing dishes from top restaurants delivered to your door in minutes
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/cart"
                  className="inline-flex items-center justify-center gap-2 bg-yellow-300 text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-yellow-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🛒 Start Ordering
                </Link>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center justify-center gap-2 bg-white bg-opacity-20 text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-30 transition-all duration-300 backdrop-blur border border-white border-opacity-30 hover:border-opacity-50"
                >
                  📍 Explore Menu
                </button>
              </div>
            </div>
            <div className="flex-1 hidden md:flex items-center justify-center">
              <div className="text-7xl animate-bounce">🍜</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff/Restaurant Quick Access Banner */}
      {(user?.userType === "STAFF" || user?.userType === "RESTAURANT") && (
        <div className="bg-blue-600 border-b-4 border-blue-700 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="text-white">
                  <p className="font-bold text-lg">
                    {user?.userType === "STAFF" ? "Staff Member" : "Restaurant Owner"}
                  </p>
                  <p className="text-sm text-blue-100">
                    Looking for your dashboard?
                  </p>
                </div>
              </div>
              <Link
                to="/restaurant"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Go to Restaurant Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search foods by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Filters</h2>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="ml-2 text-gray-700 capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Veg / Non-Veg */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Food Type</h3>
                <div className="space-y-2">
                  {["all", "veg", "nonveg"].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="foodType"
                        value={type}
                        checked={selectedFoodType === type}
                        onChange={(e) => setSelectedFoodType(e.target.value)}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="ml-2 text-gray-700 capitalize">
                        {type === "all" ? "All" : type === "veg" ? "Veg" : "Non-Veg"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    ₹0 - ₹{priceRange[1]}
                  </p>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedFoodType("all");
                  setPriceRange([0, 1000]);
                  setSortBy("popularity");
                }}
                className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Food Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-lg h-80 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow">
                <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No foods found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  <p>
                    Showing <span className="font-semibold">{filteredFoods.length}</span> food
                    {filteredFoods.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredFoods.map((food) => (
                    <div
                      key={food._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group relative transform hover:-translate-y-1"
                    >
                      {/* Image Section with Enhanced Design */}
                      <div
                        className={`h-52 bg-gradient-to-br ${getCategoryColor(
                          food.category
                        )} relative flex items-center justify-center overflow-hidden cursor-pointer`}
                        onClick={() => navigate(`/food/${food._id}`)}
                      >
                        {/* Animated Background Circle */}
                        <div className="absolute inset-0 bg-white opacity-10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                        
                        {/* Food Emoji */}
                        <span className="text-8xl z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg">
                          {getCategoryEmoji(food.category)}
                        </span>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(food._id);
                          }}
                          className="absolute top-3 right-3 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 z-20 hover:scale-110"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              favorites.includes(food._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>

                        {/* Discount Badge */}
                        {food.originalPrice && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg z-20 animate-pulse">
                            {Math.round(
                              ((food.originalPrice - food.price) /
                                food.originalPrice) *
                                100
                            )}
                            % OFF
                          </div>
                        )}

                        {/* New Badge (if food is recent) */}
                        {food.createdAt &&
                          new Date(food.createdAt) >
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                            <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg z-20">
                              ✨ NEW
                            </div>
                          )}

                        {/* Quick View Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                          <button
                            onClick={() => navigate(`/food/${food._id}`)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 bg-white text-orange-600 px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl"
                          >
                            👁️ Quick View
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5">
                        {/* Title and Category */}
                        <div className="mb-3 cursor-pointer" onClick={() => navigate(`/food/${food._id}`)}>
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1 flex-1">
                              {food.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                              {food.category || "Other"}
                            </span>
                            {food.isVeg !== undefined && (
                              <span
                                className={`inline-block ${
                                  food.isVeg
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                } text-xs font-semibold px-3 py-1 rounded-full`}
                              >
                                {food.isVeg ? "🌱 Veg" : "🍖 Non-Veg"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {food.description || "Delicious and freshly prepared just for you!"}
                        </p>

                        {/* Rating and Delivery Info */}
                        <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                          {food.rating ? (
                            <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg">
                              <Star className="w-4 h-4 fill-green-500 text-green-500" />
                              <span className="font-bold text-green-700">
                                {food.rating.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                              <Star className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500 text-xs">New</span>
                            </div>
                          )}

                          {food.deliveryTime && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="text-gray-700 font-medium">
                                {food.deliveryTime} min
                              </span>
                            </div>
                          )}

                          {food.restaurantId?.title && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 text-xs truncate max-w-[120px]">
                                {food.restaurantId.title}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Price Section */}
                        <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-orange-600">
                              ₹{food.price}
                            </span>
                            {food.originalPrice && (
                              <>
                                <span className="text-lg text-gray-400 line-through">
                                  ₹{food.originalPrice}
                                </span>
                                <span className="text-sm text-green-600 font-semibold">
                                  Save ₹{food.originalPrice - food.price}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-semibold text-gray-700">
                            Quantity:
                          </span>
                          <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(food._id, -1);
                              }}
                              className="w-8 h-8 flex items-center justify-center bg-white text-orange-600 rounded-lg hover:bg-orange-100 transition font-bold shadow-sm"
                            >
                              −
                            </button>
                            <span className="text-lg font-bold text-gray-800 w-8 text-center">
                              {quantities[food._id] || 1}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(food._id, 1);
                              }}
                              className="w-8 h-8 flex items-center justify-center bg-white text-orange-600 rounded-lg hover:bg-orange-100 transition font-bold shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(food._id);
                            }}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105 duration-200 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={18} />
                            Add to Cart
                          </button>
                        </div>
                      </div>

                      {/* Popular Badge */}
                      {food.rating >= 4.5 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-bl-lg rounded-tr-xl font-bold text-xs shadow-lg">
                          ⭐ Popular
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
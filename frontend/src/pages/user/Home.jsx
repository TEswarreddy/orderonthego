import { useEffect, useState, useContext, useMemo } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Star, MapPin, Clock, TrendingUp } from "lucide-react";

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

      return matchesSearch && matchesCategory && matchesPrice;
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
  }, [foods, searchQuery, selectedCategory, priceRange, sortBy]);

  const toggleFavorite = (foodId) => {
    setFavorites((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId]
    );
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                    >
                      {/* Image Placeholder */}
                      <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 relative flex items-center justify-center">
                        <span className="text-white text-4xl">🍜</span>
                        <button
                          onClick={() => toggleFavorite(food._id)}
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:shadow-lg transition"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.includes(food._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {food.title}
                            </h3>
                            <p className="text-xs text-orange-600 capitalize">
                              {food.category || "Other"}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {food.description}
                        </p>

                        {/* Rating and Info */}
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                          {food.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{food.rating}</span>
                            </div>
                          )}
                          {food.deliveryTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{food.deliveryTime} min</span>
                            </div>
                          )}
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-2xl font-bold text-orange-600">
                            ₹{food.price}
                          </p>
                          {food.originalPrice && (
                            <p className="text-sm line-through text-gray-400">
                              ₹{food.originalPrice}
                            </p>
                          )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            onClick={() => updateQuantity(food._id, -1)}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center font-semibold">
                            {quantities[food._id] || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(food._id, 1)}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold"
                          >
                            +
                          </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addToCart(food._id)}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md hover:shadow-lg"
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
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

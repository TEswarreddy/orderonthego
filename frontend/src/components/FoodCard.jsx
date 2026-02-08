import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Plus, Minus, ShoppingCart, Star } from "lucide-react";

const FoodCard = ({ food, onAddToCart, onToggleFavorite, isFavorite = false }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      pizza: "from-yellow-400 to-orange-500",
      burger: "from-red-400 to-pink-500",
      sushi: "from-pink-400 to-rose-500",
      pasta: "from-orange-400 to-red-500",
      dessert: "from-purple-400 to-pink-500",
      beverage: "from-blue-400 to-cyan-500",
    };
    return colors[category?.toLowerCase()] || "from-gray-400 to-gray-500";
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      pizza: "🍕",
      burger: "🍔",
      sushi: "🍣",
      pasta: "🍝",
      dessert: "🍰",
      beverage: "🍹",
    };
    return emojis[category?.toLowerCase()] || "🍽️";
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      setIsLoading(true);
      await onAddToCart(food._id, quantity);
      setIsLoading(false);
      setQuantity(1);
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(food._id);
    }
  };

  const discount = food.discount || 0;
  const finalPrice = food.price - discount;
  
  const isNew = useMemo(() => {
    const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    return new Date(food.createdAt).getTime() > sevenDaysAgo;
  }, [food.createdAt]);
  
  const isPopular = food.rating >= 4.5;

  return (
    <div
      onClick={() => navigate(`/food/${food._id}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            {Math.round((discount / food.price) * 100)}% OFF
          </span>
        )}
        {isNew && (
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            NEW
          </span>
        )}
        {isPopular && (
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={12} fill="white" /> POPULAR
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Heart
          size={20}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
        />
      </button>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(
            food.category
          )} opacity-90`}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl">{getCategoryEmoji(food.category)}</span>
        </div>
        {/* Animated circles */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
            {food.category}
          </span>
          {food.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={14} fill="#FFA500" className="text-orange-500" />
              <span className="text-sm font-bold text-gray-700">{food.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{food.title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {food.description || "Delicious food item"}
        </p>

        {/* Price & Actions */}
        <div className="flex items-center justify-between">
          <div>
            {discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  ₹{finalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">₹{food.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                ₹{food.price.toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                Save ₹{discount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <span className="font-bold text-gray-900 min-w-[20px] text-center">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(quantity + 1);
              }}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          {isLoading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
    else fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await axios.get("/cart");
      setCartItems(res.data?.items || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) removeFromCart(itemId);
    else setCartItems((prev) => prev.map((item) => item._id === itemId ? { ...item, quantity } : item));
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/cart/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase();
    if (code === "SAVE20") {
      setDiscount(0.2);
      alert("✅ Promo code applied! 20% off");
    } else if (code === "SAVE10") {
      setDiscount(0.1);
      alert("✅ Promo code applied! 10% off");
    } else {
      alert("❌ Invalid promo code");
      setDiscount(0);
    }
    setPromoCode("");
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * discount;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * 0.05;
  const deliveryFee = subtotalAfterDiscount > 500 ? 0 : 50;
  const total = subtotalAfterDiscount + tax + deliveryFee;

  if (loading) return <div className="p-6 text-center">Loading cart...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious food to get started!</p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
        >
          <ArrowLeft size={18} /> Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 transition"
        >
          <ArrowLeft size={18} /> Back to Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 border-b pb-4 hover:bg-gray-50 p-2 rounded transition"
                  >
                    {/* Food Image Placeholder */}
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 rounded-lg flex-shrink-0"></div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">{item.title || item.itemName}</h3>
                      <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition"
                      >
                        <Minus size={18} className="text-gray-600" />
                      </button>
                      <span className="px-4 font-semibold min-w-[30px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition"
                      >
                        <Plus size={18} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700 transition mt-1 flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="mt-6 border-t pt-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Apply Promo Code</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter code (SAVE20, SAVE10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={applyPromoCode}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-green-600 text-sm mt-2">
                    ✅ {Math.round(discount * 100)}% discount applied!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({Math.round(discount * 100)}%)</span>
                    <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mt-4 mb-6 text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Delivery Address</label>
                <textarea
                  placeholder="Enter your delivery address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={() => {
                  if (!address.trim()) {
                    alert("Please enter delivery address");
                    return;
                  }
                  navigate("/payment", { state: { total, address } });
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Free delivery on orders above ₹500
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

import { useState} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react";

const Payment = () => {
  //const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { total, address } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const handlePayment = async () => {
    if (!address) {
      alert("❌ Delivery address is missing");
      navigate("/cart");
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("❌ Razorpay is not configured. Please add VITE_RAZORPAY_KEY_ID to your frontend env.");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay payment order
      const { data } = await axios.post("/payment/create-order");

      const options = {
        key: razorpayKey,
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Order on the Go",
        description: "Food Order Payment",
        order_id: data.razorpayOrder.id,

        handler: async (response) => {
          try {
            // Verify payment & place order
            await axios.post("/payment/verify", {
              ...response,
              paymentId: data.paymentId,
              address,
            });

            alert("✅ Order placed successfully!");
            navigate("/orders");
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("❌ Payment verification failed. Please contact support.");
          }
        },

        theme: {
          color: "#f97316",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("❌ Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fallback COD option
  const handleCashOnDelivery = async () => {
    if (!address) {
      alert("❌ Delivery address is missing");
      navigate("/cart");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/orders", {
        address,
        paymentMethod: "COD",
      });

      alert("✅ Order placed successfully! Pay on delivery.");
      navigate("/orders");
    } catch (err) {
      console.error("Order placement failed:", err);
      alert("❌ Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!total || !address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <CreditCard size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Payment Request</h2>
        <p className="text-gray-600 mb-6">Please go back to cart and try again.</p>
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
        >
          <ArrowLeft size={18} /> Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 transition"
        >
          <ArrowLeft size={18} /> Back to Cart
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard size={32} className="text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Total Amount</span>
                <span className="font-semibold text-2xl text-gray-900">₹{total?.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
                <p className="text-gray-800 font-medium">{address}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Select Payment Method</h2>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === "razorpay"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-orange-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-orange-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Razorpay (Card/UPI/Wallet)</p>
                  <p className="text-sm text-gray-600">Pay securely with Razorpay</p>
                </div>
                <CheckCircle
                  size={24}
                  className={paymentMethod === "razorpay" ? "text-orange-500" : "text-gray-300"}
                />
              </label>

              {/* COD Option */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === "cod"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-orange-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-orange-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
                <CheckCircle
                  size={24}
                  className={paymentMethod === "cod" ? "text-orange-500" : "text-gray-300"}
                />
              </label>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={paymentMethod === "razorpay" ? handlePayment : handleCashOnDelivery}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Processing..."
            ) : paymentMethod === "razorpay" ? (
              `Pay ₹${total?.toFixed(2)} with Razorpay`
            ) : (
              "Place Order (Cash on Delivery)"
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;

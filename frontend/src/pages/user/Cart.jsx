import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/cart").then((res) => setCart(res.data));
  }, []);

  const removeItem = async (id) => {
    const res = await axios.delete(`/cart/${id}`);
    setCart(res.data);
  };

  // 🧮 Calculate total
  const totalAmount = cart
    ? cart.items.reduce(
        (sum, item) =>
          sum + item.quantity * (item.price - item.discount),
        0
      )
    : 0;

  // 💳 Razorpay Payment
  const handlePayment = async () => {
    if (!address) {
      alert("Please enter delivery address");
      return;
    }

    try {
      // 1️⃣ Create payment order
      const { data } = await axios.post("/payment/create-order");

      const options = {
        key: "rzp_test_SDZuVJeLueHBta", // Razorpay KEY_ID
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "SB Foods",
        description: "Food Order Payment",
        order_id: data.razorpayOrder.id,

        handler: async (response) => {
          // 2️⃣ Verify payment & place order
          await axios.post("/payment/verify", {
            ...response,
            paymentId: data.paymentId,
            address,
          });

          alert("Order placed successfully 🎉");
          navigate("/orders");
        },

        theme: { color: "#000000" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      alert("Payment failed");
      console.error(err);
    }
  };

  if (!cart || cart.items.length === 0)
    return <p className="p-4">Cart is empty</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Cart</h2>

      {cart.items.map((item) => (
        <div
          key={item.foodId}
          className="flex justify-between items-center mb-3 border-b pb-2"
        >
          <div>
            <p className="font-semibold">{item.itemName}</p>
            <p className="text-sm">
              ₹{item.price - item.discount} × {item.quantity}
            </p>
          </div>

          <button
            className="text-red-500"
            onClick={() => removeItem(item.foodId)}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Address */}
      <textarea
        placeholder="Delivery Address"
        className="w-full border p-2 mt-4"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* Total */}
      <div className="flex justify-between mt-4 font-bold text-lg">
        <span>Total</span>
        <span>₹{totalAmount}</span>
      </div>

      {/* Pay Now */}
      <button
        onClick={handlePayment}
        className="w-full bg-green-600 text-white py-2 mt-4 rounded"
      >
        Pay Now
      </button>
    </div>
  );
};

export default Cart;

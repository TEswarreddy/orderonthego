import { useEffect, useState } from "react";
import axios from "../../api/axios";

const Cart = () => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    axios.get("/cart").then((res) => setCart(res.data));
  }, []);

  const removeItem = async (id) => {
    const res = await axios.delete(`/cart/${id}`);
    setCart(res.data);
  };

  if (!cart) return <p className="p-4">Cart is empty</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Cart</h2>
      {cart.items.map((item) => (
        <div key={item.foodId} className="flex justify-between mb-3">
          <span>{item.itemName}</span>
          <button
            className="text-red-500"
            onClick={() => removeItem(item.foodId)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default Cart;

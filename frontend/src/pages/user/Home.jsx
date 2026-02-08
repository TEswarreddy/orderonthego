import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [foods, setFoods] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/foods").then((res) => setFoods(res.data));
  }, []);

  // ✅ ADD TO CART FUNCTION
  const addToCart = async (foodId) => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await axios.post("/cart", {
        foodId,
        quantity: 1,
      });
      alert("Added to cart 🛒");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {foods.map((food) => (
        <div
          key={food._id}
          className="border p-4 rounded shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold">{food.title}</h3>
          <p className="text-gray-600">{food.description}</p>
          <p className="font-semibold mt-2">₹{food.price}</p>

          <button
            onClick={() => addToCart(food._id)}
            className="mt-3 bg-black text-white px-4 py-1 rounded"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};

export default Home;

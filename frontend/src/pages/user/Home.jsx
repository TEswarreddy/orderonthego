import { useEffect, useState } from "react";
import axios from "../../api/axios";

const Home = () => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    axios.get("/foods").then((res) => setFoods(res.data));
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {foods.map((food) => (
        <div key={food._id} className="border p-4 rounded shadow">
          <h3 className="text-xl font-bold">{food.title}</h3>
          <p>{food.description}</p>
          <p className="font-semibold">₹{food.price}</p>
          <button className="mt-2 bg-black text-white px-4 py-1">
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};

export default Home;

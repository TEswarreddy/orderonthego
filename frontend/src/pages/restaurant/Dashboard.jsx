import { useEffect, useState } from "react";
import axios from "../../api/axios";

const Dashboard = () => {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });

  // Load foods & orders
  useEffect(() => {
    axios.get("/foods").then((res) => setFoods(res.data));
    axios.get("/orders/restaurant").then((res) => setOrders(res.data));
  }, []);

  // Add Food
  const addFood = async (e) => {
    e.preventDefault();
    const res = await axios.post("/foods", form);
    setFoods([...foods, res.data]);
    setForm({ title: "", description: "", price: "", category: "" });
  };

  // Update Order Status
  const updateStatus = async (id, status) => {
    const res = await axios.put(`/orders/${id}/status`, { status });
    setOrders(
      orders.map((o) => (o._id === id ? res.data : o))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>

      {/* Add Food */}
      <form onSubmit={addFood} className="mb-8 grid grid-cols-4 gap-2">
        <input
          placeholder="Food Name"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="border p-2"
        />
        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2"
        />
        <button className="bg-black text-white">Add</button>
      </form>

      {/* Food List */}
      <h2 className="text-xl font-bold mb-3">My Food Items</h2>
      {foods.map((food) => (
        <div key={food._id} className="border p-3 mb-2">
          {food.title} - ₹{food.price}
        </div>
      ))}

      {/* Orders */}
      <h2 className="text-xl font-bold mt-8 mb-3">Incoming Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="border p-3 mb-3">
          <p>Status: {order.status}</p>
          <select
            className="border mt-2"
            onChange={(e) =>
              updateStatus(order._id, e.target.value)
            }
          >
            <option>Update Status</option>
            <option value="PREPARING">Preparing</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

import { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Plus, Edit2, Trash2, TrendingUp, Clock, CheckCircle, Star } from "lucide-react";

const RestaurantDashboard = () => {
  const { user } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    activeOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFood, setNewFood] = useState({
    title: "",
    price: "",
    description: "",
    category: "pizza",
  });

  useEffect(() => {
    if (user) fetchRestaurantData();
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const foodsRes = await axios.get("/foods");
      setFoods(foodsRes.data || []);

      const ordersRes = await axios.get("/orders");
      const restaurantOrders = (ordersRes.data || []).filter((order) => order.restaurantId === user._id);

      const averageRating =
        foodsRes.data?.reduce((sum, food) => sum + (food.rating || 0), 0) / (foodsRes.data?.length || 1) || 0;

      const totalRevenue = restaurantOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalItems: foodsRes.data?.length || 0,
        activeOrders: restaurantOrders.filter((o) => o.status?.toLowerCase() !== "delivered").length,
        totalRevenue,
        averageRating: averageRating.toFixed(1),
      });

      setOrders(restaurantOrders);
    } catch (err) {
      console.error("Failed to fetch restaurant data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (!newFood.title || !newFood.price || !newFood.category) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await axios.post("/foods", {
        ...newFood,
        price: parseFloat(newFood.price),
        restaurantId: user._id,
      });
      setFoods([...foods, res.data]);
      setNewFood({ title: "", price: "", description: "", category: "pizza" });
      setShowAddForm(false);
      alert("✅ Food item added successfully!");
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to add food item"));
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/foods/${foodId}`);
        setFoods(foods.filter((f) => f._id !== foodId));
        alert("✅ Food item deleted");
      } catch (err) {
        alert("❌ Failed to delete item");
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? res.data : o)));
      alert("✅ Order status updated!");
    } catch (err) {
      alert("❌ Failed to update status");
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`bg-gradient-to-br ${color} text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-opacity-80 text-sm font-semibold mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon size={40} className="opacity-20" />
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading restaurant data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your menu and orders</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Plus}
            title="Menu Items"
            value={stats.totalItems}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Clock}
            title="Active Orders"
            value={stats.activeOrders}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toFixed(0)}`}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={Star}
            title="Avg Rating"
            value={`${stats.averageRating} ⭐`}
            color="from-yellow-500 to-yellow-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {["items", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "items" ? "Menu Items" : "Orders"} ({tab === "items" ? stats.totalItems : stats.activeOrders})
            </button>
          ))}
        </div>

        {/* Menu Items Tab */}
        {activeTab === "items" && (
          <div className="space-y-6">
            {/* Add Food Form */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
              >
                <Plus size={20} /> Add New Food Item
              </button>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Food Item</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Food Name *"
                    value={newFood.title}
                    onChange={(e) => setNewFood({ ...newFood, title: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹) *"
                    value={newFood.price}
                    onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={newFood.category}
                    onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="pizza">Pizza</option>
                    <option value="sushi">Sushi</option>
                    <option value="burger">Burger</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>

                <textarea
                  placeholder="Description"
                  value={newFood.description}
                  onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-4"
                  rows={3}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleAddFood}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Food Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map((food) => (
                <div key={food._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  {/* Image Placeholder */}
                  <div className="w-full h-40 bg-gradient-to-br from-orange-200 to-red-200"></div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{food.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{food.description || "No description"}</p>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-2xl font-bold text-orange-600">₹{food.price?.toFixed(2) || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-semibold text-gray-800 capitalize">{food.category || "Food"}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="text-lg font-bold text-yellow-500">{food.rating ? `${food.rating} ⭐` : "No ratings"}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg transition font-semibold">
                        <Edit2 size={18} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition font-semibold"
                      >
                        <Trash2 size={18} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg">No active orders</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Order ID</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Items</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Amount</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Current Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-800">Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-4 px-6 font-mono text-gray-700">#{order._id?.slice(-6) || "N/A"}</td>
                        <td className="py-4 px-6 text-gray-700">{order.items?.length || 0} items</td>
                        <td className="py-4 px-6 font-semibold text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              order.status?.toLowerCase() === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status?.toLowerCase() === "preparing"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.status || "pending"}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-semibold"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;

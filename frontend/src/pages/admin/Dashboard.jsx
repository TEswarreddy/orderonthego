import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Users, ShoppingBag, TrendingUp, AlertCircle, Edit2, Trash2, Eye } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const ordersRes = await axios.get("/orders");
      const allOrders = ordersRes.data || [];

      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const pendingOrders = allOrders.filter(
        (order) => order.status?.toLowerCase() === "pending"
      ).length;

      setStats({
        totalUsers: 150,
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrders,
      });

      setOrders(allOrders);
      setUsers([
        { id: 1, name: "John Doe", email: "john@example.com", orders: 5, status: "active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 12, status: "active" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", orders: 3, status: "inactive" },
        { id: 4, name: "Alice Williams", email: "alice@example.com", orders: 8, status: "active" },
        { id: 5, name: "Charlie Brown", email: "charlie@example.com", orders: 2, status: "inactive" },
      ]);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`bg-gradient-to-br ${color} text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-opacity-80 text-sm font-semibold mb-2">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <Icon size={40} className="opacity-20" />
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your platform, users, and orders</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={ShoppingBag}
            title="Total Orders"
            value={stats.totalOrders}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toFixed(0)}`}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={AlertCircle}
            title="Pending Orders"
            value={stats.pendingOrders}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {["overview", "orders", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-gray-200 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-mono text-gray-700">#{order._id?.slice(-6) || "N/A"}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(order.createdAt || new Date()).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status?.toLowerCase() === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "📊", title: "Generate Reports", color: "bg-blue-50 hover:bg-blue-100" },
                { icon: "➕", title: "Add New Item", color: "bg-green-50 hover:bg-green-100" },
                { icon: "👥", title: "Manage Users", color: "bg-purple-50 hover:bg-purple-100" },
                { icon: "📬", title: "Send Notifications", color: "bg-orange-50 hover:bg-orange-100" },
              ].map((action, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-lg cursor-pointer transition ${action.color} border`}
                >
                  <p className="text-2xl mb-2">{action.icon}</p>
                  <p className="font-semibold text-gray-800">{action.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Order ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Amount</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-mono text-gray-700">#{order._id?.slice(-6) || "N/A"}</td>
                      <td className="py-4 px-6 text-gray-700">
                        {new Date(order.createdAt || new Date()).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status?.toLowerCase() === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded transition">
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded transition">
                          <Edit2 size={18} className="text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Orders</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                      <td className="py-4 px-6 text-gray-700">{user.email}</td>
                      <td className="py-4 px-6 text-gray-700">{user.orders}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded transition">
                          <Edit2 size={18} className="text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded transition">
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Plus,
  X,
  CheckCircle,
  Clock,
  Award,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
    deliveredToday: 0,
  });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await axios.get("/admin/stats");
      setStats(statsRes.data);

      // Fetch orders
      const ordersRes = await axios.get("/admin/orders?limit=50");
      setOrders(ordersRes.data.orders || []);

      // Fetch users
      const usersRes = await axios.get("/admin/users?limit=50");
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
    <div
      className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1 relative overflow-hidden group`}
    >
      <div className="absolute -top-8 -right-8 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-opacity-70 text-xs font-semibold mb-2 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl md:text-4xl font-bold">{value}</p>
          {subtext && <p className="text-xs text-opacity-60 mt-1">{subtext}</p>}
        </div>
        <Icon size={48} className="opacity-25" />
      </div>
    </div>
  );

  const getFilteredOrders = () => {
    let filtered = orders;
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.status?.toLowerCase() === filterStatus
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id?.includes(searchTerm) ||
          order.totalAmount?.toString().includes(searchTerm)
      );
    }
    return filtered;
  };

  const getFilteredUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const handleUpdateOrder = async (orderId, newStatus) => {
    try {
      await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setShowOrderModal(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      setShowUserModal(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  const filteredOrders = getFilteredOrders();
  const filteredUsers = getFilteredUsers();
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your platform, users, and orders in real-time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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
            title="Revenue"
            value={`₹${stats.totalRevenue.toFixed(0)}`}
            color="from-emerald-500 to-emerald-600"
            subtext={`Avg: ₹${stats.avgOrderValue.toFixed(0)}`}
          />
          <StatCard
            icon={AlertCircle}
            title="Pending"
            value={stats.pendingOrders}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={CheckCircle}
            title="Today"
            value={stats.deliveredToday}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Award}
            title="Conversion"
            value={`${((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)}%`}
            color="from-pink-500 to-pink-600"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm">
          {["overview", "orders", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className={`flex-1 px-6 py-3 font-semibold rounded-xl transition ${
                activeTab === tab
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Revenue Overview
              </h2>
              <div className="h-40 flex items-end gap-2 bg-gradient-to-t from-orange-50 to-transparent rounded-lg p-4">
                {[65, 45, 78, 52, 88, 72, 95].map((value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition hover:shadow-lg hover:from-orange-600 hover:to-orange-500"
                    style={{ height: `${value}%`, minHeight: "20px" }}
                    title={`₹${value}k`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Last 7 days revenue trend
              </p>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Orders
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-semibold hover:bg-orange-200 transition">
                  <Download size={18} />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Order ID
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-orange-50 transition"
                      >
                        <td className="py-4 px-6 font-mono text-gray-700">
                          #{order._id?.slice(-6) || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(
                            order.createdAt || new Date()
                          ).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          ₹{(order.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "PLACED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status?.replace(/_/g, " ") || "Placed"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-700 font-semibold transition"
                          >
                            View
                          </button>
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
                {
                  icon: Download,
                  title: "Generate Reports",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Plus,
                  title: "Add New Item",
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: Users,
                  title: "Manage Users",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  icon: AlertCircle,
                  title: "Send Notifications",
                  color: "from-orange-500 to-orange-600",
                },
              ].map((action, idx) => (
                <button
                  key={idx}
                  className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-2xl cursor-pointer transition transform hover:-translate-y-1 hover:shadow-lg flex flex-col items-center gap-3`}
                >
                  <action.icon size={28} />
                  <p className="font-semibold text-center">{action.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-4 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search orders by ID or address..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
                >
                  <option value="all">All Status</option>
                  <option value="PLACED">Placed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Order ID
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-orange-50 transition"
                      >
                        <td className="py-4 px-6 font-mono text-gray-700 font-semibold">
                          #{order._id?.slice(-6) || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(
                            order.createdAt || new Date()
                          ).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
                          ₹{(order.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "PLACED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status?.replace(/_/g, " ") || "Placed"}
                          </span>
                        </td>
                        <td className="py-4 px-6 flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                            title="View details"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} className="text-blue-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {Math.ceil(filteredOrders.length / pageSize) > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredOrders.length)} of{" "}
                  {filteredOrders.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(
                          Math.ceil(filteredOrders.length / pageSize),
                          currentPage + 1
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(filteredOrders.length / pageSize)
                    }
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Search */}
            <div className="mb-6 relative">
              <Search
                size={20}
                className="absolute left-4 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
              />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Name
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Orders
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Join Date
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b hover:bg-orange-50 transition"
                      >
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          {user.name}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {user.email}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {user.orders}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700 text-sm">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono font-bold text-gray-900">
                  #{selectedOrder._id?.slice(-6) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{(selectedOrder.totalAmount || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(
                    selectedOrder.createdAt || new Date()
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Update Status</p>
                <select
                  value={selectedOrder.status || "PLACED"}
                  onChange={(e) =>
                    handleUpdateOrder(selectedOrder._id, e.target.value)
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
                >
                  <option value="PLACED">Placed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowOrderModal(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-bold text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-700">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedUser.orders}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Status</p>
                <select
                  defaultValue={selectedUser.status}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

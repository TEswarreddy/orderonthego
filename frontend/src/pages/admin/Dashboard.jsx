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
  Download,
  Plus,
  X,
  CheckCircle,
  Clock,
  Award,
  Store,
  Activity,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Save,
  XCircle,
  Home,
  User,
  BarChart3,
  PieChart,
} from "lucide-react";

// StatCard Component
const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
  <div className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-6 transition hover:-translate-y-1 hover:shadow-xl`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtext && <p className="text-xs opacity-75 mt-1">{subtext}</p>}
      </div>
      <Icon size={40} className="opacity-50" />
    </div>
  </div>
);

// Chart Component (Simple Bar Chart)
const SimpleChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div className="flex items-end gap-4 h-64">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="relative w-full flex items-end h-full group">
              <div
                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition hover:shadow-lg hover:from-orange-600 hover:to-orange-500 cursor-pointer"
                style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: "20px" }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <p className="text-xs font-semibold text-gray-700 mt-3 text-center">
              {item.label}
            </p>
            <p className="text-sm font-bold text-orange-600">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Table Component
const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  maxRows = 10,
  loading = false,
}) => {
  const displayed = data.slice(0, maxRows);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left py-4 px-6 font-semibold text-gray-800"
              >
                {col}
              </th>
            ))}
            <th className="text-left py-4 px-6 font-semibold text-gray-800">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {displayed.length > 0 ? (
            displayed.map((row) => (
              <tr
                key={row._id || row.id}
                className="border-b hover:bg-orange-50 transition"
              >
                {columns.map((col) => (
                  <td key={col} className="py-4 px-6 text-gray-700">
                    {col === "Amount" || col === "Revenue"
                      ? `₹${(row[col.toLowerCase()] ?? 0).toFixed(2)}`
                      : col === "Status"
                      ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              row.status === "active" ||
                              row.status === "DELIVERED" ||
                              row.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : row.status === "PLACED" ||
                                  row.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : row.status === "PREPARING" ||
                                  row.status === "inactive"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {String(row.status || "N/A").replace(/_/g, " ")}
                          </span>
                        )
                      : String(row[col.toLowerCase()] || "N/A")}
                  </td>
                ))}
                <td className="py-4 px-6 flex gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(row)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition"
                      title="View"
                    >
                      <Eye size={18} className="text-gray-600" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 size={18} className="text-blue-600" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="py-8 text-center text-gray-500">
                {loading ? "Loading..." : "No data found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Modal Component
const Modal = ({ title, isOpen, onClose, children, isWide = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full ${isWide ? "max-w-4xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [modals, setModals] = useState({
    order: false,
    user: false,
    restaurant: false,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes, usersRes, revenueRes] = await Promise.all([
          axios.get("/admin/stats"),
          axios.get("/admin/orders"),
          axios.get("/admin/users"),
          axios.get("/admin/analytics/revenue"),
        ]);

        setStats(statsRes.data);
        setOrders(ordersRes.data.orders || []);
        setUsers(usersRes.data.users || []);
        setRevenueData(
          revenueRes.data.map((item) => ({
            label: new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            value: Math.round(item.revenue),
          }))
        );

        // Fetch restaurants
        try {
          const restaurantsRes = await axios.get("/restaurants");
          setRestaurants(restaurantsRes.data || []);
        } catch (e) {
          console.log("Restaurants endpoint not available");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle Modal Actions
  const openModal = (type, item = null) => {
    setSelectedItem(item);
    setEditForm(item ? { ...item } : {});
    setModals({ ...modals, [type]: true });
  };

  const closeModal = (type) => {
    setModals({ ...modals, [type]: false });
    setSelectedItem(null);
  };

  // Order Management
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
      closeModal("order");
    } catch (error) {
      alert("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`/admin/orders/${orderId}`);
        setOrders(orders.filter((o) => o._id !== orderId));
        closeModal("order");
      } catch (error) {
        alert("Failed to delete order");
      }
    }
  };

  // User Management
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await axios.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        )
      );
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        setUsers(users.filter((u) => u._id !== userId));
        closeModal("user");
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  // Restaurant Management
  const handleApproveRestaurant = async (restaurantId) => {
    try {
      await axios.put(`/admin/approve-restaurant/${restaurantId}`);
      setRestaurants(
        restaurants.map((r) =>
          r._id === restaurantId ? { ...r, status: "approved" } : r
        )
      );
      alert("Restaurant approved successfully");
    } catch (error) {
      alert("Failed to approve restaurant");
    }
  };

  // Filter Functions
  const getFilteredOrders = () => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter((o) =>
        String(o._id || "").includes(searchTerm)
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }
    return filtered;
  };

  const getFilteredUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const getFilteredRestaurants = () => {
    let filtered = restaurants;
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.cuisineType || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }
    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const filteredUsers = getFilteredUsers();
  const filteredRestaurants = getFilteredRestaurants();

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
            Manage your platform, users, orders, and restaurants
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={ShoppingBag}
            title="Total Orders"
            value={stats.totalOrders || 0}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers || 0}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Store}
            title="Restaurants"
            value={restaurants.length}
            color="from-indigo-500 to-indigo-600"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`₹${(stats.totalRevenue || 0).toFixed(0)}`}
            color="from-emerald-500 to-emerald-600"
            subtext={`Avg: ₹${(stats.avgOrderValue || 0).toFixed(0)}`}
          />
          <StatCard
            icon={AlertCircle}
            title="Pending Orders"
            value={stats.pendingOrders || 0}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={CheckCircle}
            title="Delivered Today"
            value={stats.deliveredToday || 0}
            color="from-green-500 to-green-600"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm overflow-x-auto">
          {["overview", "orders", "users", "restaurants", "analytics"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className={`px-6 py-3 font-semibold rounded-xl whitespace-nowrap transition ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Revenue Chart */}
            {revenueData.length > 0 && (
              <SimpleChart data={revenueData} title="7-Day Revenue Trend" />
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: TrendingUp,
                  label: "Conversion Rate",
                  value: `${(
                    ((stats.totalOrders || 0) / Math.max(stats.totalUsers || 1, 1)) *
                    100
                  ).toFixed(1)}%`,
                  color: "from-blue-50 to-blue-100",
                  textColor: "text-blue-600",
                },
                {
                  icon: ShoppingBag,
                  label: "Avg Order Value",
                  value: `₹${(stats.avgOrderValue || 0).toFixed(0)}`,
                  color: "from-purple-50 to-purple-100",
                  textColor: "text-purple-600",
                },
                {
                  icon: Clock,
                  label: "Pending Orders",
                  value: stats.pendingOrders || 0,
                  color: "from-orange-50 to-orange-100",
                  textColor: "text-orange-600",
                },
                {
                  icon: CheckCircle,
                  label: "Delivered Today",
                  value: stats.deliveredToday || 0,
                  color: "from-green-50 to-green-100",
                  textColor: "text-green-600",
                },
              ].map((metric, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${metric.color} rounded-2xl shadow-lg p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {metric.label}
                      </p>
                      <p className={`text-3xl font-bold ${metric.textColor}`}>
                        {metric.value}
                      </p>
                    </div>
                    <metric.icon size={32} className={metric.textColor} />
                  </div>
                </div>
              ))}
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
              <DataTable
                columns={["orderid", "date", "amount", "status"]}
                data={orders.slice(0, 5).map((o) => ({
                  ...o,
                  orderid: `#${o._id?.slice(-6)}`,
                  date: new Date(o.createdAt).toLocaleDateString(),
                  amount: o.totalAmount,
                }))}
                onView={(item) => openModal("order", item)}
              />
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
                  icon: Users,
                  title: "Manage Users",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  icon: Store,
                  title: "Restaurants",
                  color: "from-indigo-500 to-indigo-600",
                },
                {
                  icon: BarChart3,
                  title: "View Analytics",
                  color: "from-orange-500 to-orange-600",
                },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(action.title.toLowerCase().replace(" ", ""))}
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
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-4 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
              >
                <option value="all">All Status</option>
                <option value="PLACED">Placed</option>
                <option value="PREPARING">Preparing</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            <DataTable
              columns={["orderid", "date", "amount", "status"]}
              data={filteredOrders.map((o) => ({
                ...o,
                orderid: `#${o._id?.slice(-6)}`,
                date: new Date(o.createdAt).toLocaleDateString(),
                amount: o.totalAmount,
              }))}
              onEdit={(item) => openModal("order", item)}
              onDelete={(item) => handleDeleteOrder(item._id)}
            />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
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

            <DataTable
              columns={["username", "email", "status", "phone"]}
              data={filteredUsers}
              onEdit={(item) => openModal("user", item)}
              onDelete={(item) => handleDeleteUser(item._id)}
            />
          </div>
        )}

        {/* Restaurants Tab */}
        {activeTab === "restaurants" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-4 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            <DataTable
              columns={["title", "cuisinetype", "status", "address"]}
              data={filteredRestaurants.map((r) => ({
                ...r,
                cuisinetype: r.cuisineType,
              }))}
              onView={(item) => openModal("restaurant", item)}
              onEdit={(item) => openModal("restaurant", item)}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {revenueData.length > 0 && (
              <SimpleChart data={revenueData} title="7-Day Revenue Analysis" />
            )}

            {/* Order Distribution Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Order Status Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Placed",
                        value: orders.filter((o) => o.status === "PLACED")
                          .length,
                        color: "bg-yellow-500",
                      },
                      {
                        label: "Preparing",
                        value: orders.filter((o) => o.status === "PREPARING")
                          .length,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Out for Delivery",
                        value: orders.filter(
                          (o) => o.status === "OUT_FOR_DELIVERY"
                        ).length,
                        color: "bg-orange-500",
                      },
                      {
                        label: "Delivered",
                        value: orders.filter((o) => o.status === "DELIVERED")
                          .length,
                        color: "bg-green-500",
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-700">
                            {item.label}
                          </span>
                          <span className="text-2xl font-bold text-gray-900">
                            {item.value}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${item.color} h-3 rounded-full transition-all`}
                            style={{
                              width: `${
                                (item.value /
                                  Math.max(orders.length, 1)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Total Orders",
                      value: orders.length,
                      icon: ShoppingBag,
                      color: "from-blue-50",
                    },
                    {
                      label: "Total Users",
                      value: users.length,
                      icon: Users,
                      color: "from-purple-50",
                    },
                    {
                      label: "Total Revenue",
                      value: `₹${orders
                        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                        .toFixed(0)}`,
                      icon: DollarSign,
                      color: "from-green-50",
                    },
                    {
                      label: "Avg Order Value",
                      value: `₹${(
                        orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) /
                        Math.max(orders.length, 1)
                      ).toFixed(0)}`,
                      icon: TrendingUp,
                      color: "from-orange-50",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`bg-gradient-to-br ${item.color} to-transparent rounded-2xl p-4`}
                    >
                      <p className="text-sm text-gray-600 mb-2">{item.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <Modal
        title="Order Details"
        isOpen={modals.order}
        onClose={() => closeModal("order")}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Order ID</label>
                <p className="font-mono font-bold text-gray-900">
                  #{selectedItem._id?.slice(-6)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Amount</label>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{(selectedItem.totalAmount || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date</label>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedItem.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={editForm.status || selectedItem.status || "PLACED"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
                >
                  <option value="PLACED">Placed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>

            {/* Items */}
            {selectedItem.items && selectedItem.items.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedItem.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => closeModal("order")}
                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateOrderStatus(
                    selectedItem._id,
                    editForm.status || selectedItem.status
                  )
                }
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteOrder(selectedItem._id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* User Modal */}
      <Modal
        title="User Details"
        isOpen={modals.user}
        onClose={() => closeModal("user")}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Username</label>
                <p className="font-bold text-gray-900">{selectedItem.username}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-gray-700 break-all">{selectedItem.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-semibold text-gray-900">
                  {selectedItem.phone || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={editForm.status || selectedItem.status || "active"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Address</label>
              <p className="text-gray-700">{selectedItem.address || "N/A"}</p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => closeModal("user")}
                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateUserStatus(
                    selectedItem._id,
                    editForm.status || selectedItem.status
                  )
                }
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteUser(selectedItem._id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Restaurant Modal */}
      <Modal
        title="Restaurant Details"
        isOpen={modals.restaurant}
        onClose={() => closeModal("restaurant")}
        isWide
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-bold text-gray-900">{selectedItem.title}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Cuisine Type</label>
                <p className="font-semibold text-gray-700">
                  {selectedItem.cuisineType}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedItem.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedItem.status}
                </span>
              </div>
              <div>
                <label className="text-sm text-gray-600">Owner</label>
                <p className="font-semibold text-gray-700">
                  {selectedItem.ownerId?.username || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Description</label>
              <p className="text-gray-700">{selectedItem.description || "N/A"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone size={18} />
                {selectedItem.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={18} />
                {selectedItem.address}
              </div>
            </div>

            {selectedItem.status === "pending" && (
              <button
                onClick={() => handleApproveRestaurant(selectedItem._id)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Approve Restaurant
              </button>
            )}

            <button
              onClick={() => closeModal("restaurant")}
              className="w-full bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;

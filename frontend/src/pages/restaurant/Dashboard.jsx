import { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Plus, Edit2, Trash2, TrendingUp, Clock, CheckCircle, Star, Crown, ArrowUpRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [subscriptionUsage, setSubscriptionUsage] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [pendingStatusRequests, setPendingStatusRequests] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MANAGER");
  const [latestInviteLink, setLatestInviteLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [newFood, setNewFood] = useState({
    title: "",
    price: "",
    description: "",
    category: "pizza",
  });

  useEffect(() => {
    if (user) fetchRestaurantData();
  }, [user]);

  useEffect(() => {
    if (user?.userType === "STAFF") {
      setActiveTab("orders");
    }
  }, [user]);

  const allStatusOptions = [
    { value: "PLACED", label: "Placed" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PREPARING", label: "Preparing" },
    { value: "READY", label: "Ready" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
  ];

  const getAllowedStatusOptions = () => {
    if (user?.userType !== "STAFF") return allStatusOptions;

    switch (user?.staffRole) {
      case "MANAGER":
        return allStatusOptions;
      case "CHEF":
        return allStatusOptions.filter((option) => ["PREPARING", "READY"].includes(option.value));
      case "DELIVERY":
        return allStatusOptions.filter((option) => ["OUT_FOR_DELIVERY", "DELIVERED"].includes(option.value));
      default:
        return [];
    }
  };

  const getDisplayStatusOptions = (currentStatus) => {
    if (user?.userType !== "STAFF") return allStatusOptions;

    const allowed = getAllowedStatusOptions();
    const hasCurrent = allowed.some((option) => option.value === currentStatus);
    if (hasCurrent) return allowed;

    return [
      { value: currentStatus, label: currentStatus.replace(/_/g, " ") },
      ...allowed,
    ];
  };

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.userType === "STAFF" ? user.restaurantId : user?._id;
      const foodsRes = restaurantId
        ? await axios.get(`/foods/restaurant/${restaurantId}`)
        : await axios.get("/foods");
      setFoods(foodsRes.data || []);

      const ordersRes = await axios.get("/orders/restaurant");
      const restaurantOrders = ordersRes.data || [];

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

      if (user?.userType === "RESTAURANT") {
        // Fetch subscription usage and plans
        try {
          const [usageRes, plansRes] = await Promise.all([
            axios.get("/subscriptions/usage"),
            axios.get("/subscriptions/plans"),
          ]);
          setSubscriptionUsage(usageRes.data);
          setAvailablePlans(plansRes.data || []);
        } catch (err) {
          if (err.response?.status === 401) {
            console.warn("⚠️ Subscription session expired. Please log in again.");
          } else if (err.response?.status === 404) {
            console.warn("⚠️ Subscription endpoints not found. Backend may still be starting.");
          }
          console.error("Failed to fetch subscription data:", err);
        }
      } else {
        setSubscriptionUsage(null);
      }

      if (user?.userType === "RESTAURANT") {
        await fetchStaffData();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn("⚠️ Session expired. Please log in again.");
      } else if (err.response?.status === 404) {
        console.warn("⚠️ API endpoints not found. Backend may still be starting.");
      }
      console.error("Failed to fetch restaurant data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffData = async () => {
    try {
      const [staffRes, requestsRes] = await Promise.all([
        axios.get("/staff/members"),
        axios.get("/staff/status-requests"),
      ]);
      setStaffMembers(staffRes.data || []);
      setPendingStatusRequests(requestsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch staff data:", err);
    }
  };

  const handleAddFood = async () => {
    if (!newFood.title || !newFood.price || !newFood.category) {
      alert("Please fill all required fields");
      return;
    }

    // Check subscription limit before adding
    try {
      const limitCheck = await axios.get("/subscriptions/check-limit/maxMenuItems");
      if (!limitCheck.data.canProceed) {
        alert(
          `❌ You've reached your plan limit of ${limitCheck.data.limit} menu items. Please upgrade your subscription to add more items.`
        );
        return;
      }
    } catch (err) {
      console.error("Failed to check limit:", err);
      // Continue anyway if check fails
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
      fetchRestaurantData(); // Refresh to update subscription usage
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

  const handleEditFood = (food) => {
    setEditingFood(food);
    setNewFood({
      title: food.title,
      price: food.price.toString(),
      description: food.description || "",
      category: food.category,
    });
    setShowEditForm(true);
  };

  const handleUpdateFood = async () => {
    if (!newFood.title || !newFood.price || !newFood.category) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await axios.put(`/foods/${editingFood._id}`, {
        ...newFood,
        price: parseFloat(newFood.price),
      });
      setFoods(foods.map((f) => (f._id === editingFood._id ? res.data : f)));
      setEditingFood(null);
      setShowEditForm(false);
      setNewFood({ title: "", price: "", description: "", category: "pizza" });
      alert("✅ Food item updated successfully!");
      fetchRestaurantData();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to update food item"));
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

  const requestStatusChange = async (orderId, newStatus) => {
    try {
      await axios.post(`/orders/${orderId}/status-request`, { status: newStatus });
      alert("✅ Status change request sent for approval.");
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to request status change"));
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    if (user?.userType === "STAFF") {
      const allowedOptions = getAllowedStatusOptions().map((option) => option.value);
      if (!allowedOptions.includes(newStatus)) {
        return requestStatusChange(orderId, newStatus);
      }
      return updateOrderStatus(orderId, newStatus);
    }
    return updateOrderStatus(orderId, newStatus);
  };

  const handleAvailabilityToggle = async (foodId, nextAvailability) => {
    try {
      const res = await axios.put(`/foods/${foodId}/availability`, {
        isAvailable: nextAvailability,
      });
      setFoods(foods.map((food) => (food._id === foodId ? res.data : food)));
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to update availability"));
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You can continue using it until the end date.")) {
      return;
    }

    try {
      setCancelling(true);
      await axios.put("/subscriptions/cancel");
      alert("✅ Subscription cancelled successfully. You can continue using your plan until the end date.");
      fetchRestaurantData();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to cancel subscription"));
    } finally {
      setCancelling(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!inviteEmail) {
      alert("Please enter a staff email");
      return;
    }

    try {
      const res = await axios.post("/staff/invites", {
        email: inviteEmail,
        role: inviteRole,
      });
      const inviteUrl = `${window.location.origin}/staff-invite/${res.data.inviteToken}`;
      setLatestInviteLink(inviteUrl);
      setInviteEmail("");
      alert("✅ Invite created. Share the invite link with the staff member.");
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to create invite"));
    }
  };

  const handleApproveStaff = async (staffId) => {
    try {
      await axios.put(`/staff/members/${staffId}/approve`);
      fetchStaffData();
      alert("✅ Staff member approved");
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to approve staff"));
    }
  };

  const handleApproveStatusRequest = async (requestId) => {
    try {
      await axios.put(`/staff/status-requests/${requestId}/approve`);
      fetchStaffData();
      fetchRestaurantData();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to approve request"));
    }
  };

  const handleRejectStatusRequest = async (requestId) => {
    try {
      await axios.put(`/staff/status-requests/${requestId}/reject`);
      fetchStaffData();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Failed to reject request"));
    }
  };

  const handleUpgradePlan = (planName) => {
    // Navigate to subscription plans page with selected plan
    window.location.href = `/subscriptions?plan=${planName}`;
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

        {/* Subscription Card */}
        {subscriptionUsage && (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Crown size={32} />
                  <div>
                    <h2 className="text-2xl font-bold">{subscriptionUsage.plan} Plan</h2>
                    <p className="text-orange-100 text-sm">
                      {subscriptionUsage.isActive ? (
                        subscriptionUsage.endDate ? (
                          <>Valid until {new Date(subscriptionUsage.endDate).toLocaleDateString()}</>
                        ) : (
                          "Active"
                        )
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle size={16} /> Subscription Expired
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm text-orange-100 mb-1">Menu Items</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">
                        {subscriptionUsage.usage.menuItems.current}
                      </p>
                      <p className="text-sm opacity-90">/ {subscriptionUsage.usage.menuItems.limit}</p>
                    </div>
                    <div className="mt-2 bg-white bg-opacity-30 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(subscriptionUsage.usage.menuItems.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm text-orange-100 mb-1">Orders Today</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">
                        {subscriptionUsage.usage.ordersToday.current}
                      </p>
                      <p className="text-sm opacity-90">/ {subscriptionUsage.usage.ordersToday.limit}</p>
                    </div>
                    <div className="mt-2 bg-white bg-opacity-30 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(subscriptionUsage.usage.ordersToday.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Limits Warning */}
                {(subscriptionUsage.usage.menuItems.percentage >= 80 ||
                  subscriptionUsage.usage.ordersToday.percentage >= 80) && (
                  <div className="bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3 mb-4">
                    <p className="text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>
                        You're approaching your plan limits. Consider upgrading for more capacity!
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Upgrade Button */}
              <Link
                to="/subscriptions"
                className="ml-4 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
              >
                {subscriptionUsage.plan === "FREE" ? "Upgrade Plan" : "Manage Plan"}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        )}

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
        <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          {(user?.userType === "RESTAURANT"
            ? ["items", "orders", "subscription", "staff", "settings"]
            : ["orders", "items"]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "items"
                ? "📋 Menu Items"
                : tab === "orders"
                ? "📦 Orders"
                : tab === "subscription"
                ? "👑 Subscription"
                : tab === "staff"
                ? "👥 Staff"
                : "⚙️ Settings"}
              {(tab === "items" || tab === "orders") && ` (${tab === "items" ? stats.totalItems : stats.activeOrders})`}
            </button>
          ))}
        </div>

        {/* Menu Items Tab */}
        {activeTab === "items" && (
          <div className="space-y-6">
            {/* Add Food Form */}
            {user?.userType === "RESTAURANT" && !showAddForm && !showEditForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
              >
                <Plus size={20} /> Add New Food Item
              </button>
            ) : null}

            {user?.userType === "RESTAURANT" && showAddForm && !showEditForm && (
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
                    className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

            {user?.userType === "RESTAURANT" && showEditForm && editingFood && (
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Food Item</h2>
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
                    className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    onClick={handleUpdateFood}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingFood(null);
                      setNewFood({ title: "", price: "", description: "", category: "pizza" });
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            {!showAddForm && !showEditForm && (
              <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-center">
                <input
                  type="text"
                  placeholder="🔍 Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                  className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="pizza">Pizza</option>
                  <option value="sushi">Sushi</option>
                  <option value="burger">Burger</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                </select>
                {(searchQuery || filterCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterCategory("all");
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            )}

            {/* Food Items Grid */}
            {!showAddForm && !showEditForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foods
                  .filter((food) => {
                    const matchesSearch = food.title.toLowerCase().includes(searchQuery);
                    const matchesCategory = filterCategory === "all" || food.category === filterCategory;
                    return matchesSearch && matchesCategory;
                  })
                  .map((food) => (
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

                        {/* Availability */}
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm text-gray-600">Availability</p>
                          <button
                            onClick={() => handleAvailabilityToggle(food._id, !(food.isAvailable !== false))}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                              food.isAvailable !== false
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {food.isAvailable !== false ? "Available" : "Unavailable"}
                          </button>
                        </div>

                        {/* Actions */}
                        {user?.userType === "RESTAURANT" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditFood(food)}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg transition font-semibold"
                            >
                              <Edit2 size={18} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFood(food._id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition font-semibold"
                            >
                              <Trash2 size={18} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-center">
              <input
                type="text"
                placeholder="🔍 Search by Order ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
              </select>
              {(orderSearch || orderFilter !== "all") && (
                <button
                  onClick={() => {
                    setOrderSearch("");
                    setOrderFilter("all");
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Orders Table */}
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
                      {orders
                        .filter((order) => {
                          const matchesSearch = order._id.includes(orderSearch);
                          const matchesFilter =
                            orderFilter === "all" || order.status?.toLowerCase() === orderFilter.toLowerCase();
                          return matchesSearch && matchesFilter;
                        })
                        .map((order) => (
                          <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                            <td className="py-4 px-6 font-mono text-gray-700 font-semibold">#{order._id?.slice(-6) || "N/A"}</td>
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
                                    : order.status?.toLowerCase() === "confirmed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {order.status || "Pending"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {user?.userType === "STAFF" && getAllowedStatusOptions().length === 0 ? (
                                <span className="text-sm text-gray-500">View only</span>
                              ) : (
                                <select
                                  value={(order.status || "PLACED").toString().toUpperCase()}
                                  onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                  className="bg-white text-gray-900 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-semibold"
                                >
                                  {getDisplayStatusOptions((order.status || "PLACED").toString().toUpperCase()).map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            {/* Current Plan Card */}
            {subscriptionUsage && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Crown size={40} />
                        <div>
                          <h2 className="text-3xl font-bold">{subscriptionUsage.plan} Plan</h2>
                          <p className="text-orange-100 text-sm mt-1">
                            {subscriptionUsage.isActive ? (
                              subscriptionUsage.endDate ? (
                                <>Valid until {new Date(subscriptionUsage.endDate).toLocaleDateString()}</>
                              ) : (
                                "Active • Forever Free"
                              )
                            ) : (
                              <span className="flex items-center gap-1">
                                <AlertCircle size={16} /> Subscription Expired - Please Renew
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-semibold">
                        {subscriptionUsage.status === "ACTIVE" ? (
                          <>
                            <CheckCircle size={16} /> Active
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} /> {subscriptionUsage.status}
                          </>
                        )}
                      </div>
                    </div>
                    {subscriptionUsage.plan !== "FREE" && subscriptionUsage.status === "ACTIVE" && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg font-semibold transition"
                      >
                        {cancelling ? "Cancelling..." : "Cancel Subscription"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  {/* Usage Statistics */}
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Menu Items</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {subscriptionUsage.usage.menuItems.current}
                            <span className="text-lg text-gray-500">/{subscriptionUsage.usage.menuItems.limit}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            {subscriptionUsage.usage.menuItems.percentage}%
                          </p>
                          <p className="text-xs text-gray-500">Used</p>
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            subscriptionUsage.usage.menuItems.percentage >= 90
                              ? "bg-red-500"
                              : subscriptionUsage.usage.menuItems.percentage >= 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(subscriptionUsage.usage.menuItems.percentage, 100)}%` }}
                        ></div>
                      </div>
                      {subscriptionUsage.usage.menuItems.percentage >= 80 && (
                        <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          Approaching limit - Consider upgrading
                        </p>
                      )}
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Orders Today</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {subscriptionUsage.usage.ordersToday.current}
                            <span className="text-lg text-gray-500">/{subscriptionUsage.usage.ordersToday.limit}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            {subscriptionUsage.usage.ordersToday.percentage}%
                          </p>
                          <p className="text-xs text-gray-500">Used</p>
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            subscriptionUsage.usage.ordersToday.percentage >= 90
                              ? "bg-red-500"
                              : subscriptionUsage.usage.ordersToday.percentage >= 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(subscriptionUsage.usage.ordersToday.percentage, 100)}%` }}
                        ></div>
                      </div>
                      {subscriptionUsage.usage.ordersToday.percentage >= 80 && (
                        <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          High volume today - Upgrade for more capacity
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Current Plan Features */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Plus size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Max Menu Items</p>
                        <p className="font-bold text-gray-900">{subscriptionUsage.features.maxMenuItems}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Daily Orders</p>
                        <p className="font-bold text-gray-900">{subscriptionUsage.features.maxOrdersPerDay}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Analytics</p>
                        <p className="font-bold text-gray-900">
                          {subscriptionUsage.features.analyticsAccess ? "Enabled" : "Not Available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star size={20} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Priority Support</p>
                        <p className="font-bold text-gray-900">
                          {subscriptionUsage.features.prioritySupport ? "24/7 Available" : "Standard"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Crown size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Custom Branding</p>
                        <p className="font-bold text-gray-900">
                          {subscriptionUsage.features.customBranding ? "Enabled" : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Plans */}
            {subscriptionUsage && subscriptionUsage.plan !== "PREMIUM" && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h3>
                <p className="text-gray-600 mb-6">
                  Get more features and capacity by upgrading to a higher tier
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePlans
                    .filter((plan) => {
                      // Show plans higher than current plan
                      const planOrder = { FREE: 0, BASIC: 1, PREMIUM: 2 };
                      return planOrder[plan.name] > planOrder[subscriptionUsage.plan];
                    })
                    .map((plan) => (
                      <div
                        key={plan.name}
                        className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg transition"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Crown size={24} className="text-orange-600" />
                          <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                        </div>
                        <div className="mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                            {plan.name !== "FREE" && <span className="text-gray-600">/month</span>}
                          </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleUpgradePlan(plan.name)}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                        >
                          Upgrade to {plan.name}
                        </button>
                      </div>
                    ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    to="/subscriptions"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    View all plans and features
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Have questions about subscriptions or need assistance choosing the right plan?
              </p>
              <Link
                to="/help"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Contact Support
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && user?.userType === "RESTAURANT" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Staff</h2>
              <p className="text-gray-600 mb-6">Send an invite link for staff to create their account.</p>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="staff@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="CHEF">Chef</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="STAFF">Staff</option>
                </select>
                <button
                  onClick={handleCreateInvite}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Create Invite
                </button>
              </div>
              {latestInviteLink && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800 font-semibold mb-1">Invite Link</p>
                  <p className="text-sm text-gray-700 break-all">{latestInviteLink}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Staff Approvals</h3>
              {staffMembers.filter((member) => !member.approval).length === 0 ? (
                <p className="text-gray-600">No pending staff approvals.</p>
              ) : (
                <div className="space-y-3">
                  {staffMembers
                    .filter((member) => !member.approval)
                    .map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{member.username}</p>
                          <p className="text-sm text-gray-600">{member.email} • {member.staffRole}</p>
                        </div>
                        <button
                          onClick={() => handleApproveStaff(member._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Status Change Requests</h3>
              {pendingStatusRequests.length === 0 ? (
                <p className="text-gray-600">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingStatusRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200 rounded-lg p-4"
                    >
                      <div className="mb-3 md:mb-0">
                        <p className="font-semibold text-gray-900">
                          Order #{request.orderId?._id?.slice(-6) || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.requestedBy?.username || "Staff"} • {request.requestedBy?.staffRole || ""}
                        </p>
                        <p className="text-sm text-gray-700">
                          {request.fromStatus} → {request.toStatus}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveStatusRequest(request._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectStatusRequest(request._id)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">All Staff Members</h3>
              {staffMembers.length === 0 ? (
                <p className="text-gray-600">No staff members added yet.</p>
              ) : (
                <div className="space-y-3">
                  {staffMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{member.username}</p>
                        <p className="text-sm text-gray-600">{member.email} • {member.staffRole}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.approval ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {member.approval ? "Approved" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Restaurant Profile */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🏪</span> Restaurant Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Account Type</label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-700 font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded inline-block">
                      🍽️ Restaurant Owner
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Member Since</label>
                  <input
                    type="text"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Contact Support</strong> to update your restaurant details. <Link to="/help" className="underline font-semibold">Get help here</Link>
                </p>
              </div>
            </div>

            {/* Business Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={28} className="text-orange-600" /> Business Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Menu Items</p>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalItems}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-2">Active Orders Today</p>
                  <p className="text-4xl font-bold text-orange-600">{stats.activeOrders}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                  <p className="text-4xl font-bold text-emerald-600">₹{Math.round(stats.totalRevenue)}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                  <p className="text-4xl font-bold text-yellow-600">{stats.averageRating} ⭐</p>
                </div>
              </div>
            </div>

            {/* Security & Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔒 Security & Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-600">Update your account password regularly</p>
                  </div>
                  <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add extra security to your account</p>
                  </div>
                  <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Get updates about orders and account activity</p>
                  </div>
                  <button className="px-6 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition font-semibold">
                    ✓ Enabled
                  </button>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-900 mb-2">Danger Zone</h2>
              <p className="text-red-700 mb-4">
                Once you log out, you will need to log in again to access your restaurant dashboard.
              </p>
              <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition">
                🚪 Logout
              </button>
            </div>
          </div>
        )}
            </div>
    </div>
  );
};

export default RestaurantDashboard;

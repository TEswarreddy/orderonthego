import { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Crown,
  ArrowUpRight,
  AlertCircle,
  Menu,
  LayoutGrid,
  ClipboardList,
  Users,
  User,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import RestaurantSidebar from "./components/RestaurantSidebar";
import StatCard from "./components/StatCard";
import MenuItemsTab from "./components/MenuItemsTab";
import OrdersTab from "./components/OrdersTab";
import SubscriptionTab from "./components/SubscriptionTab";
import StaffTab from "./components/StaffTab";
import StaffProfileTab from "./components/StaffProfileTab";
import SettingsTab from "./components/SettingsTab";

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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [restaurantProfile, setRestaurantProfile] = useState(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [newFood, setNewFood] = useState({
    title: "",
    price: "",
    description: "",
    category: "biryani",
    isVeg: true,
  });

  useEffect(() => {
    if (user) fetchRestaurantData();
  }, [user]);

  useEffect(() => {
    if (user?.userType === "STAFF") {
      setActiveTab("orders");
    }
  }, [user]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    const intervalId = setInterval(() => {
      fetchOrdersOnly();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  const allStatusOptions = [
    { value: "PLACED", label: "Placed" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PREPARING", label: "Preparing" },
    { value: "READY", label: "Ready" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
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
      // Use /my-foods endpoint - fetches foods for logged-in restaurant
      const foodsRes = await axios.get("/foods/my-foods");
      setFoods(foodsRes.data || []);

      const ordersRes = await axios.get("/orders/restaurant");
      const restaurantOrders = ordersRes.data || [];

      const averageRating =
        foodsRes.data?.reduce((sum, food) => sum + (food.rating || 0), 0) / (foodsRes.data?.length || 1) || 0;

      const totalRevenue = restaurantOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalItems: foodsRes.data?.length || 0,
        activeOrders: restaurantOrders.filter((o) => !["delivered", "cancelled"].includes(o.status?.toLowerCase())).length,
        totalRevenue,
        averageRating: averageRating.toFixed(1),
      });

      setOrders(restaurantOrders);
      setLastOrderCount(restaurantOrders.length);

      if (user?.userType === "RESTAURANT") {
        // Fetch subscription usage and plans
        try {
          const [usageRes, plansRes, profileRes] = await Promise.all([
            axios.get("/subscriptions/usage"),
            axios.get("/subscriptions/plans"),
            axios.get("/restaurants/profile"),
          ]);
          setSubscriptionUsage(usageRes.data);
          setAvailablePlans(plansRes.data || []);
          setRestaurantProfile(profileRes.data);
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

  const fetchOrdersOnly = async () => {
    try {
      setRefreshing(true);
      const ordersRes = await axios.get("/orders/restaurant");
      const restaurantOrders = ordersRes.data || [];

      const totalRevenue = restaurantOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats(prev => ({
        ...prev,
        activeOrders: restaurantOrders.filter((o) => !["delivered", "cancelled"].includes(o.status?.toLowerCase())).length,
        totalRevenue,
      }));

      // Check for new orders
      if (lastOrderCount > 0 && restaurantOrders.length > lastOrderCount) {
        const newOrdersCount = restaurantOrders.length - lastOrderCount;
        // Show browser notification if permission granted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Order Received!", {
            body: `You have ${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''}`,
            icon: "/favicon.ico",
          });
        }
        // Play a subtle audio notification
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaiTYIGWi77eeaTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQU=');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {}
      }

      setLastOrderCount(restaurantOrders.length);
      setOrders(restaurantOrders);
    } catch (err) {
      console.error("Failed to refresh orders:", err);
    } finally {
      setRefreshing(false);
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
    if (!newFood.title || !newFood.price || !newFood.category || typeof newFood.isVeg !== "boolean") {
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
      });
      setFoods([...foods, res.data]);
      setStats(prev => ({ ...prev, totalItems: prev.totalItems + 1 }));
      setNewFood({ title: "", price: "", description: "", category: "biryani", isVeg: true });
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
        fetchRestaurantData(); // Refresh to update subscription usage and stats
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
      isVeg: typeof food.isVeg === "boolean" ? food.isVeg : true,
    });
    setShowEditForm(true);
  };

  const handleUpdateFood = async () => {
    if (!newFood.title || !newFood.price || !newFood.category || typeof newFood.isVeg !== "boolean") {
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
      setNewFood({ title: "", price: "", description: "", category: "biryani", isVeg: true });
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

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading restaurant data...</div>;
  }

  const navItems = user?.userType === "RESTAURANT"
    ? [
        { id: "items", label: "Menu Items", icon: LayoutGrid },
        { id: "orders", label: "Orders", icon: ClipboardList },
        { id: "subscription", label: "Subscription", icon: Crown },
        { id: "staff", label: "Staff", icon: Users },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    : [
        { id: "orders", label: "Orders", icon: ClipboardList },
        { id: "items", label: "Menu Items", icon: LayoutGrid },
        { id: "profile", label: "Profile", icon: User },
      ];

  const handleNavigate = (tabId, closeMobile) => {
    setActiveTab(tabId);
    if (closeMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <RestaurantSidebar
          activeTab={activeTab}
          navItems={navItems}
          onNavigate={handleNavigate}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur border-b border-gray-200 md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-xs text-gray-500">Restaurant</p>
                <p className="text-base font-semibold text-gray-900">Dashboard</p>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <p className="text-gray-600">Manage your menu and orders</p>
                  {refreshing && (
                    <span className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking for new orders...
                    </span>
                  )}
                </div>
                {user?.userType === "STAFF" && (
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Update Profile
                  </button>
                )}
              </div>

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
                  <div className=" bg-opacity-20 rounded-lg p-4">
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

                  <div className=" bg-opacity-20 rounded-lg p-4">
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
        <div className="flex gap-4 mb-6 border-b overflow-x-auto md:hidden">
          {(user?.userType === "RESTAURANT"
            ? ["items", "orders", "subscription", "staff", "settings"]
            : ["orders", "items", "profile"]
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
                : tab === "profile"
                ? "👤 Profile"
                : "⚙️ Settings"}
              {(tab === "items" || tab === "orders") && ` (${tab === "items" ? stats.totalItems : stats.activeOrders})`}
            </button>
          ))}
        </div>

        {/* Menu Items Tab */}
        {activeTab === "items" && (
          <MenuItemsTab
            user={user}
            foods={foods}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            showEditForm={showEditForm}
            setShowEditForm={setShowEditForm}
            editingFood={editingFood}
            setEditingFood={setEditingFood}
            newFood={newFood}
            setNewFood={setNewFood}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            handleAddFood={handleAddFood}
            handleUpdateFood={handleUpdateFood}
            handleDeleteFood={handleDeleteFood}
            handleEditFood={handleEditFood}
            handleAvailabilityToggle={handleAvailabilityToggle}
          />
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <OrdersTab
            user={user}
            orders={orders}
            orderSearch={orderSearch}
            setOrderSearch={setOrderSearch}
            orderFilter={orderFilter}
            setOrderFilter={setOrderFilter}
            getAllowedStatusOptions={getAllowedStatusOptions}
            getDisplayStatusOptions={getDisplayStatusOptions}
            handleOrderStatusChange={handleOrderStatusChange}
            onRefresh={fetchOrdersOnly}
            refreshing={refreshing}
          />
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <SubscriptionTab
            subscriptionUsage={subscriptionUsage}
            availablePlans={availablePlans}
            handleCancelSubscription={handleCancelSubscription}
            handleUpgradePlan={handleUpgradePlan}
            cancelling={cancelling}
          />
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && user?.userType === "RESTAURANT" && (
          <StaffTab
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviteRole={inviteRole}
            setInviteRole={setInviteRole}
            latestInviteLink={latestInviteLink}
            staffMembers={staffMembers}
            pendingStatusRequests={pendingStatusRequests}
            handleCreateInvite={handleCreateInvite}
            handleApproveStaff={handleApproveStaff}
            handleApproveStatusRequest={handleApproveStatusRequest}
            handleRejectStatusRequest={handleRejectStatusRequest}
          />
        )}

        {/* Staff Profile Tab */}
        {activeTab === "profile" && user?.userType === "STAFF" && (
          <StaffProfileTab user={user} />
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <SettingsTab
            user={user}
            stats={stats}
            restaurantProfile={restaurantProfile}
          />
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;

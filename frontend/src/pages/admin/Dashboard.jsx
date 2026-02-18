import { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Store,
  DollarSign,
  MapPin,
  Phone,
  Home,
  BarChart3,
  Utensils,
  UserCheck,
  PieChart,
} from "lucide-react";
import StatCard from "./components/StatCard";
import Modal from "./components/Modal";
import AdminSidebar from "./components/AdminSidebar";
import OverviewTab from "./components/OverviewTab";
import OrdersTab from "./components/OrdersTab";
import UsersTab from "./components/UsersTab";
import RestaurantsTab from "./components/RestaurantsTab";
import AnalyticsTab from "./components/AnalyticsTab";
import FoodsTab from "./components/FoodsTab";
import StaffTab from "./components/StaffTab";
import RevenueTab from "./components/RevenueTab";

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
  const [foodAvailability, setFoodAvailability] = useState("all");
  const [staffApproval, setStaffApproval] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurantFoods, setRestaurantFoods] = useState([]);
  const [restaurantStaff, setRestaurantStaff] = useState([]);
  const [restaurantDetailsLoading, setRestaurantDetailsLoading] = useState(false);
  const [foods, setFoods] = useState([]);
  const [staff, setStaff] = useState([]);
  const defaultFoodForm = {
    restaurantId: "",
    title: "",
    price: "",
    category: "",
    menuType: "",
    description: "",
    mainImg: "",
    discount: "",
    isAvailable: true,
  };
  const [foodForm, setFoodForm] = useState(defaultFoodForm);
  const [foodErrors, setFoodErrors] = useState({});
  const defaultStaffForm = {
    username: "",
    email: "",
    password: "",
    restaurantId: "",
    staffRole: "STAFF",
    phone: "",
    address: "",
    status: "active",
    approval: true,
  };
  const [staffForm, setStaffForm] = useState(defaultStaffForm);
  const [restaurantEditMode, setRestaurantEditMode] = useState(false);
  const [restaurantFormData, setRestaurantFormData] = useState({});

  // Modal states
  const [modals, setModals] = useState({
    order: false,
    user: false,
    restaurant: false,
    food: false,
    staff: false,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          statsRes,
          ordersRes,
          usersRes,
          revenueRes,
          foodsRes,
          staffRes,
        ] = await Promise.all([
          axios.get("/admin/stats"),
          axios.get("/admin/orders"),
          axios.get("/admin/users"),
          axios.get("/admin/analytics/revenue"),
          axios.get("/admin/foods"),
          axios.get("/admin/staff"),
        ]);

        setStats(statsRes.data);
        setOrders(ordersRes.data.orders || []);
        setUsers(usersRes.data.users || []);
        setFoods(foodsRes.data || []);
        setStaff(staffRes.data || []);
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

  const fetchRestaurantDetails = async (restaurantId) => {
    try {
      setRestaurantDetailsLoading(true);
      const [foodsRes, staffRes] = await Promise.all([
        axios.get(`/foods/restaurant/${restaurantId}`),
        axios.get(`/admin/restaurants/${restaurantId}/staff`),
      ]);
      setRestaurantFoods(foodsRes.data || []);
      setRestaurantStaff(staffRes.data || []);
    } catch (error) {
      console.error("Failed to fetch restaurant details:", error);
      setRestaurantFoods([]);
      setRestaurantStaff([]);
    } finally {
      setRestaurantDetailsLoading(false);
    }
  };

  // Handle Modal Actions
  const openModal = (type, item = null) => {
    setSelectedItem(item);
    setEditForm(item ? { ...item } : {});
    setModals({ ...modals, [type]: true });
    if (type === "restaurant" && item?._id) {
      setRestaurantEditMode(false);
      setRestaurantFormData({
        title: item.title || "",
        cuisineType: item.cuisineType || "",
        description: item.description || "",
        address: item.address || "",
        phone: item.phone || "",
        status: item.status || "pending",
      });
      fetchRestaurantDetails(item._id);
    }
    if (type === "food") {
      setFoodForm(
        item
          ? {
              ...defaultFoodForm,
              ...item,
              restaurantId: item.restaurantId?._id || item.restaurantId || "",
              price: item.price ?? "",
              discount: item.discount ?? "",
            }
          : defaultFoodForm
      );
      setFoodErrors({});
    }
  };

  const closeModal = (type) => {
    setModals({ ...modals, [type]: false });
    setSelectedItem(null);
    if (type === "restaurant") {
      setRestaurantFoods([]);
      setRestaurantStaff([]);
      setRestaurantEditMode(false);
      setRestaurantFormData({});
    }
    if (type === "food") {
      setFoodForm(defaultFoodForm);
      setFoodErrors({});
    }
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

  const handleUpdateRestaurant = async () => {
    try {
      const response = await axios.put(
        `/admin/restaurants/${selectedItem._id}`,
        restaurantFormData
      );
      
      setRestaurants(
        restaurants.map((r) =>
          r._id === selectedItem._id ? response.data.restaurant : r
        )
      );
      
      setSelectedItem(response.data.restaurant);
      setRestaurantEditMode(false);
      alert("Restaurant updated successfully");
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert("Failed to update restaurant");
    }
  };

  const validateFoodForm = () => {
    const errors = {};
    if (!foodForm.restaurantId) {
      errors.restaurantId = "Restaurant is required";
    }
    if (!foodForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (foodForm.price === "" || Number(foodForm.price) <= 0) {
      errors.price = "Price must be greater than 0";
    }

    setFoodErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateFood = async () => {
    if (!validateFoodForm()) {
      return;
    }
    try {
      const payload = {
        ...foodForm,
        price: Number(foodForm.price),
        discount: foodForm.discount === "" ? 0 : Number(foodForm.discount),
        isAvailable: Boolean(foodForm.isAvailable),
      };
      const response = await axios.post("/admin/foods", payload);
      setFoods([response.data, ...foods]);
      closeModal("food");
    } catch (error) {
      alert("Failed to create food item");
    }
  };

  const handleUpdateFood = async () => {
    if (!validateFoodForm()) {
      return;
    }
    try {
      const payload = {
        ...foodForm,
        price: Number(foodForm.price),
        discount: foodForm.discount === "" ? 0 : Number(foodForm.discount),
        isAvailable: Boolean(foodForm.isAvailable),
      };
      const response = await axios.put(`/admin/foods/${selectedItem._id}`, payload);
      setFoods(foods.map((food) => (food._id === selectedItem._id ? response.data : food)));
      closeModal("food");
    } catch (error) {
      alert("Failed to update food item");
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) {
      return;
    }

    try {
      await axios.delete(`/admin/foods/${foodId}`);
      setFoods(foods.filter((food) => food._id !== foodId));
    } catch (error) {
      alert("Failed to delete food item");
    }
  };

  const handleToggleFoodAvailability = async (food) => {
    try {
      const response = await axios.put(`/admin/foods/${food._id}`, {
        isAvailable: !food.isAvailable,
      });
      setFoods(
        foods.map((item) => (item._id === food._id ? response.data : item))
      );
    } catch (error) {
      alert("Failed to update availability");
    }
  };

  const handleCreateStaff = async () => {
    try {
      const payload = {
        ...staffForm,
        approval: Boolean(staffForm.approval),
      };
      const response = await axios.post("/admin/staff", payload);
      setStaff([response.data, ...staff]);
      closeModal("staff");
    } catch (error) {
      alert("Failed to create staff member");
    }
  };

  const handleUpdateStaff = async () => {
    try {
      const payload = { ...staffForm };
      if (!payload.password) {
        delete payload.password;
      }
      const response = await axios.put(`/admin/staff/${selectedItem._id}`, payload);
      setStaff(
        staff.map((member) =>
          member._id === selectedItem._id ? response.data : member
        )
      );
      closeModal("staff");
    } catch (error) {
      alert("Failed to update staff member");
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    try {
      await axios.delete(`/admin/staff/${staffId}`);
      setStaff(staff.filter((member) => member._id !== staffId));
    } catch (error) {
      alert("Failed to delete staff member");
    }
  };

  const handleApproveStaff = async (member) => {
    try {
      const response = await axios.put(`/admin/staff/${member._id}`, {
        approval: true,
      });
      setStaff(
        staff.map((item) => (item._id === member._id ? response.data : item))
      );
    } catch (error) {
      alert("Failed to approve staff member");
    }
  };

  const handleRejectStaff = async (member) => {
    try {
      const response = await axios.put(`/admin/staff/${member._id}`, {
        approval: false,
      });
      setStaff(
        staff.map((item) => (item._id === member._id ? response.data : item))
      );
    } catch (error) {
      alert("Failed to reject staff member");
    }
  };

  const handleResetStaffPassword = async (member) => {
    if (!window.confirm(`Reset password for ${member.username}?`)) {
      return;
    }

    try {
      const response = await axios.post(
        `/admin/staff/${member._id}/reset-password`
      );
      const tempPassword = response.data?.tempPassword;
      if (tempPassword) {
        alert(`Temporary password: ${tempPassword}`);
      } else {
        alert("Password reset successfully");
      }
    } catch (error) {
      alert("Failed to reset password");
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
  const filteredFoods = foods.filter((food) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (food.title || "").toLowerCase().includes(term) ||
      (food.category || "").toLowerCase().includes(term) ||
      (food.restaurantId?.title || "").toLowerCase().includes(term);

    const matchesAvailability =
      foodAvailability === "all" ||
      (foodAvailability === "available" && food.isAvailable) ||
      (foodAvailability === "unavailable" && !food.isAvailable);

    return matchesSearch && matchesAvailability;
  });
  const filteredStaff = staff
    .map((member) => ({
      ...member,
      restaurantName:
        restaurants.find((restaurant) => restaurant._id === member.restaurantId)
          ?.title || "N/A",
    }))
    .filter((member) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (member.username || "").toLowerCase().includes(term) ||
        (member.email || "").toLowerCase().includes(term) ||
        (member.restaurantName || "").toLowerCase().includes(term);

      const matchesApproval =
        staffApproval === "all" ||
        (staffApproval === "approved" && member.approval) ||
        (staffApproval === "pending" && !member.approval);

      return matchesSearch && matchesApproval;
    });

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "users", label: "Users", icon: Users },
    { id: "restaurants", label: "Restaurants", icon: Store },
    { id: "staff", label: "Staff", icon: UserCheck },
    { id: "foods", label: "Foods", icon: Utensils },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleNavigate = (tab, closeSidebar) => {
    setActiveTab(tab);
    setSearchTerm("");
    setFilterStatus("all");
    setFoodAvailability("all");
    setStaffApproval("all");
    if (closeSidebar) {
      setSidebarOpen(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          navItems={navItems}
          onNavigate={handleNavigate}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage your platform, users, orders, and restaurants
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Menu
              </button>
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

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            orders={orders}
            revenueData={revenueData}
            restaurants={restaurants}
            setActiveTab={setActiveTab}
            openModal={openModal}
          />
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <OrdersTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filteredOrders={filteredOrders}
            openModal={openModal}
            handleDeleteOrder={handleDeleteOrder}
          />
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <UsersTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredUsers={filteredUsers}
            openModal={openModal}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {/* Restaurants Tab */}
        {activeTab === "restaurants" && (
          <RestaurantsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filteredRestaurants={filteredRestaurants}
            openModal={openModal}
          />
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && (
          <StaffTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            staffApproval={staffApproval}
            setStaffApproval={setStaffApproval}
            filteredStaff={filteredStaff}
            onCreate={() => openModal("staff")}
            onEdit={(item) => openModal("staff", item)}
            onDelete={(item) => handleDeleteStaff(item._id)}
            onApprove={handleApproveStaff}
            onReject={handleRejectStaff}
            onResetPassword={handleResetStaffPassword}
          />
        )}

        {/* Foods Tab */}
        {activeTab === "foods" && (
          <FoodsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            foodAvailability={foodAvailability}
            setFoodAvailability={setFoodAvailability}
            filteredFoods={filteredFoods}
            onCreate={() => openModal("food")}
            onEdit={(item) => openModal("food", item)}
            onDelete={(item) => handleDeleteFood(item._id)}
            onToggleAvailability={handleToggleFoodAvailability}
          />
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <RevenueTab />
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <AnalyticsTab
            orders={orders}
            users={users}
            revenueData={revenueData}
          />
        )}
          </div>
        </main>
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
                  <option value="CANCELLED">Cancelled</option>
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
            {restaurantEditMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={restaurantFormData.title}
                      onChange={(e) =>
                        setRestaurantFormData({
                          ...restaurantFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Cuisine Type
                    </label>
                    <input
                      type="text"
                      value={restaurantFormData.cuisineType}
                      onChange={(e) =>
                        setRestaurantFormData({
                          ...restaurantFormData,
                          cuisineType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={restaurantFormData.description}
                    onChange={(e) =>
                      setRestaurantFormData({
                        ...restaurantFormData,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={restaurantFormData.phone}
                      onChange={(e) =>
                        setRestaurantFormData({
                          ...restaurantFormData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      value={restaurantFormData.address}
                      onChange={(e) =>
                        setRestaurantFormData({
                          ...restaurantFormData,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={restaurantFormData.status}
                    onChange={(e) =>
                      setRestaurantFormData({
                        ...restaurantFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateRestaurant}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setRestaurantEditMode(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Food Items</h3>
                      <span className="text-xs text-gray-500">
                        {restaurantFoods.length} items
                      </span>
                    </div>
                    {restaurantDetailsLoading ? (
                      <p className="text-sm text-gray-500">Loading food items...</p>
                    ) : restaurantFoods.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {restaurantFoods.map((food) => (
                          <div
                            key={food._id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {food.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {food.category || "Uncategorized"}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              ₹{Number(food.price || 0).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No food items found.</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Staff</h3>
                      <span className="text-xs text-gray-500">
                        {restaurantStaff.length} members
                      </span>
                    </div>
                    {restaurantDetailsLoading ? (
                      <p className="text-sm text-gray-500">Loading staff...</p>
                    ) : restaurantStaff.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {restaurantStaff.map((staff) => (
                          <div
                            key={staff._id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {staff.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                {staff.staffRole || "STAFF"}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                staff.approval
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {staff.approval ? "Approved" : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No staff found.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedItem.status === "pending" && (
                    <button
                      onClick={() => handleApproveRestaurant(selectedItem._id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Approve Restaurant
                    </button>
                  )}
                  <button
                    onClick={() => setRestaurantEditMode(true)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Edit Restaurant
                  </button>
                </div>

                <button
                  onClick={() => closeModal("restaurant")}
                  className="w-full bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={selectedItem ? "Edit Food" : "Add Food"}
        isOpen={modals.food}
        onClose={() => closeModal("food")}
        isWide
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Restaurant</label>
              <select
                value={foodForm.restaurantId}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, restaurantId: e.target.value })
                }
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              >
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.title}
                  </option>
                ))}
              </select>
              {foodErrors.restaurantId && (
                <p className="text-xs text-red-600 mt-1">
                  {foodErrors.restaurantId}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Title</label>
              <input
                type="text"
                value={foodForm.title}
                onChange={(e) => setFoodForm({ ...foodForm, title: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
              {foodErrors.title && (
                <p className="text-xs text-red-600 mt-1">{foodErrors.title}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Price</label>
              <input
                type="number"
                value={foodForm.price}
                onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
              {foodErrors.price && (
                <p className="text-xs text-red-600 mt-1">{foodErrors.price}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <input
                type="text"
                value={foodForm.category}
                onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Menu Type</label>
              <input
                type="text"
                value={foodForm.menuType}
                onChange={(e) => setFoodForm({ ...foodForm, menuType: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Main Image URL</label>
              <input
                type="text"
                value={foodForm.mainImg}
                onChange={(e) => setFoodForm({ ...foodForm, mainImg: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Discount (%)</label>
              <input
                type="number"
                value={foodForm.discount}
                onChange={(e) => setFoodForm({ ...foodForm, discount: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="food-available"
                type="checkbox"
                checked={Boolean(foodForm.isAvailable)}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, isAvailable: e.target.checked })
                }
                className="h-4 w-4"
              />
              <label htmlFor="food-available" className="text-sm text-gray-700">
                Available
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea
              value={foodForm.description}
              onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
              className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => closeModal("food")}
              className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => (selectedItem ? handleUpdateFood() : handleCreateFood())}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
            >
              {selectedItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        title={selectedItem ? "Edit Staff" : "Add Staff"}
        isOpen={modals.staff}
        onClose={() => closeModal("staff")}
        isWide
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Username</label>
              <input
                type="text"
                value={staffForm.username}
                onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                {selectedItem ? "New Password (optional)" : "Password"}
              </label>
              <input
                type="password"
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Restaurant</label>
              <select
                value={staffForm.restaurantId}
                onChange={(e) => setStaffForm({ ...staffForm, restaurantId: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              >
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Role</label>
              <select
                value={staffForm.staffRole}
                onChange={(e) => setStaffForm({ ...staffForm, staffRole: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              >
                <option value="MANAGER">Manager</option>
                <option value="CHEF">Chef</option>
                <option value="DELIVERY">Delivery</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select
                value={staffForm.status}
                onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <input
                type="text"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <input
                type="text"
                value={staffForm.address}
                onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })}
                className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition mt-1"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="staff-approval"
                type="checkbox"
                checked={Boolean(staffForm.approval)}
                onChange={(e) => setStaffForm({ ...staffForm, approval: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="staff-approval" className="text-sm text-gray-700">
                Approved
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => closeModal("staff")}
              className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => (selectedItem ? handleUpdateStaff() : handleCreateStaff())}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
            >
              {selectedItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

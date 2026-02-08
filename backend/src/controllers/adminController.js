const User = require("../models/User");
const Order = require("../models/Order");

// GET DASHBOARD STATISTICS
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ userType: "USER" });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const pendingOrders = await Order.countDocuments({
      status: { $ne: "DELIVERED" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deliveredToday = await Order.countDocuments({
      status: "DELIVERED",
      createdAt: { $gte: today },
    });

    const avgOrderValue =
      totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      deliveredToday,
      avgOrderValue: Math.round(avgOrderValue),
      conversionRate:
        totalUsers > 0
          ? ((totalOrders / totalUsers) * 100).toFixed(2)
          : "0.00",
    };

    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = { userType: "USER" };
    if (search) {
      query = {
        ...query,
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      total: totalUsers,
      pages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

// UPDATE USER STATUS
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User status updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update user status",
        error: error.message,
      });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

// APPROVE RESTAURANT
exports.approveRestaurant = async (req, res) => {
  try {
    const restaurant = await User.findById(req.params.id);
    if (!restaurant || restaurant.userType !== "RESTAURANT") {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.approval = true;
    await restaurant.save();

    res.json({ message: "Restaurant approved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to approve restaurant",
        error: error.message,
      });
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status && status !== "all") {
      query.status = status.toUpperCase();
    }

    if (search) {
      query = {
        ...query,
        $or: [
          { _id: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      };
    }

    const orders = await Order.find(query)
      .populate("userId", "username email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(query);

    res.json({
      orders,
      total: totalOrders,
      pages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "username email")
      .populate("restaurantId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: error.message });
  }
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status.toUpperCase() },
      { new: true }
    )
      .populate("userId", "username email")
      .populate("restaurantId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update order status",
        error: error.message,
      });
  }
};

// DELETE ORDER
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order", error: error.message });
  }
};

// GET REVENUE ANALYTICS
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const days = 7;
    const revenues = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: date, $lt: nextDate },
            status: "DELIVERED",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      revenues.push({
        date: date.toISOString().split("T")[0],
        revenue: dayRevenue[0]?.total || 0,
      });
    }

    res.json(revenues);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch revenue analytics",
        error: error.message,
      });
  }
};

// GET ORDER DISTRIBUTION BY STATUS
exports.getOrderDistribution = async (req, res) => {
  try {
    const distribution = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statuses = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
    const result = statuses.map((status) => {
      const found = distribution.find((d) => d._id === status);
      return { status, count: found?.count || 0 };
    });

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch order distribution",
        error: error.message,
      });
  }
};

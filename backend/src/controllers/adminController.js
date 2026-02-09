const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");

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
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("ownerId", "username email");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Also update the User model's approval field
    await User.findByIdAndUpdate(restaurant.ownerId._id, { approval: true });

    res.json({ message: "Restaurant approved successfully", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to approve restaurant",
        error: error.message,
      });
  }
};

// UPDATE RESTAURANT (ADMIN)
exports.updateRestaurantAdmin = async (req, res) => {
  try {
    const { title, cuisineType, description, address, phone, status } =
      req.body;

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Update only provided fields
    if (title) restaurant.title = title;
    if (cuisineType) restaurant.cuisineType = cuisineType;
    if (description) restaurant.description = description;
    if (address) restaurant.address = address;
    if (phone) restaurant.phone = phone;
    if (status) restaurant.status = status;

    await restaurant.save();

    const updatedRestaurant = await Restaurant.findById(req.params.id).populate(
      "ownerId",
      "username email phone"
    );

    res.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update restaurant",
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

// GET STAFF BY RESTAURANT (ADMIN)
exports.getRestaurantStaff = async (req, res) => {
  try {
    const staff = await User.find({
      restaurantId: req.params.id,
      userType: "STAFF",
    }).select("username email staffRole status approval createdAt");

    res.json(staff);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch restaurant staff",
      error: error.message,
    });
  }
};

// GET ALL FOODS (ADMIN)
exports.getAllFoodsAdmin = async (req, res) => {
  try {
    const foods = await Food.find().populate("restaurantId", "title");
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch foods", error: error.message });
  }
};

// CREATE FOOD (ADMIN)
exports.createFoodAdmin = async (req, res) => {
  try {
    const {
      restaurantId,
      title,
      price,
      description,
      category,
      menuType,
      mainImg,
      discount,
      isAvailable,
    } = req.body;

    if (!restaurantId || !title || price === undefined) {
      return res.status(400).json({ message: "Restaurant, title, and price are required" });
    }

    const food = await Food.create({
      restaurantId,
      title,
      price: Number(price),
      description,
      category,
      menuType,
      mainImg,
      discount: discount !== undefined ? Number(discount) : 0,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    await food.populate("restaurantId", "title");
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: "Failed to create food", error: error.message });
  }
};

// UPDATE FOOD (ADMIN)
exports.updateFoodAdmin = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.discount !== undefined) updates.discount = Number(updates.discount);
    if (updates.isAvailable !== undefined) updates.isAvailable = Boolean(updates.isAvailable);

    const food = await Food.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate("restaurantId", "title");

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({ message: "Failed to update food", error: error.message });
  }
};

// DELETE FOOD (ADMIN)
exports.deleteFoodAdmin = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete food", error: error.message });
  }
};

// GET ALL STAFF (ADMIN)
exports.getAllStaffAdmin = async (req, res) => {
  try {
    const staff = await User.find({ userType: "STAFF" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff", error: error.message });
  }
};

// CREATE STAFF (ADMIN)
exports.createStaffAdmin = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      restaurantId,
      staffRole,
      phone,
      address,
      status,
      approval,
    } = req.body;

    if (!username || !email || !password || !restaurantId) {
      return res.status(400).json({
        message: "Username, email, password, and restaurant are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = await User.create({
      username,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      userType: "STAFF",
      staffRole,
      restaurantId,
      phone,
      address,
      status: status || "active",
      approval: approval !== undefined ? Boolean(approval) : true,
    });

    const staffSafe = await User.findById(staff._id).select("-password");
    res.status(201).json(staffSafe);
  } catch (error) {
    res.status(500).json({ message: "Failed to create staff", error: error.message });
  }
};

// UPDATE STAFF (ADMIN)
exports.updateStaffAdmin = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
    }

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    } else {
      delete updates.password;
    }

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "STAFF" },
      updates,
      { new: true }
    ).select("-password");

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to update staff", error: error.message });
  }
};

// DELETE STAFF (ADMIN)
exports.deleteStaffAdmin = async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({ _id: req.params.id, userType: "STAFF" });
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete staff", error: error.message });
  }
};

// RESET STAFF PASSWORD (ADMIN)
exports.resetStaffPasswordAdmin = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, userType: "STAFF" });
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const tempPassword = crypto.randomBytes(6).toString("base64url");
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(tempPassword, salt);
    await staff.save();

    res.json({ message: "Password reset successfully", tempPassword });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
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

// GET ADMIN PROFILE
const { getImageData } = require("../utils/uploadHandler");

exports.getAdminProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user || user.userType !== "ADMIN") {
      return res.status(403).json({ message: "Not an admin account" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      profileImage: getImageData(user),
      userType: user.userType,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin profile", error: error.message });
  }
};

// UPDATE ADMIN PROFILE
exports.updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { username, phone, address },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Admin profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: getImageData(user),
        userType: user.userType,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating admin profile", error: error.message });
  }
};

// UPLOAD ADMIN PROFILE IMAGE
exports.uploadAdminProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed" });
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: "File size must be less than 5MB" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    user.profileImageBuffer = req.file.buffer;
    user.profileImageMimeType = req.file.mimetype;
    user.profileImage = `admin_${userId}_${Date.now()}`;

    await user.save();

    res.json({
      message: "Admin profile image uploaded successfully",
      profileImage: getImageData(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};

// DELETE ADMIN PROFILE IMAGE
exports.deleteAdminProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    user.profileImage = null;
    user.profileImageBuffer = null;
    user.profileImageMimeType = null;

    await user.save();

    res.json({ message: "Admin profile image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error: error.message });
  }
};

// GET FOOD REVENUE ANALYTICS
exports.getFoodRevenueAnalytics = async (req, res) => {
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
    res.status(500).json({
      message: "Failed to fetch food revenue analytics",
      error: error.message,
    });
  }
};

// GET SUBSCRIPTION REVENUE ANALYTICS
exports.getSubscriptionRevenueAnalytics = async (req, res) => {
  try {
    const Subscription = require("../models/Subscription");
    const days = 7;
    const revenues = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = await Subscription.aggregate([
        {
          $match: {
            createdAt: { $gte: date, $lt: nextDate },
            status: "active",
          },
        },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]);

      revenues.push({
        date: date.toISOString().split("T")[0],
        revenue: dayRevenue[0]?.total || 0,
      });
    }

    res.json(revenues);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subscription revenue analytics",
      error: error.message,
    });
  }
};

// GET REVENUE BY RESTAURANT
exports.getRevenueByRestaurant = async (req, res) => {
  try {
    const Subscription = require("../models/Subscription");

    // Get food revenue by restaurant
    const foodRevenue = await Order.aggregate([
      {
        $match: { status: "DELIVERED" },
      },
      {
        $group: {
          _id: "$restaurantId",
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      {
        $unwind: "$restaurant",
      },
      {
        $project: {
          restaurantId: "$_id",
          restaurantName: "$restaurant.title",
          foodRevenue: "$total",
          orderCount: "$count",
          _id: 0,
        },
      },
      {
        $sort: { foodRevenue: -1 },
      },
    ]);

    // Get subscription revenue by restaurant
    const subscriptionRevenue = await Subscription.aggregate([
      {
        $match: { status: "active" },
      },
      {
        $group: {
          _id: "$restaurantId",
          total: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      {
        $unwind: "$restaurant",
      },
      {
        $project: {
          restaurantId: "$_id",
          restaurantName: "$restaurant.title",
          subscriptionRevenue: "$total",
          subscriptionCount: "$count",
          _id: 0,
        },
      },
      {
        $sort: { subscriptionRevenue: -1 },
      },
    ]);

    // Merge both revenues
    const merged = [];
    const restaurantMap = new Map();

    foodRevenue.forEach((item) => {
      restaurantMap.set(item.restaurantId.toString(), {
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        foodRevenue: item.foodRevenue,
        orderCount: item.orderCount,
        subscriptionRevenue: 0,
        subscriptionCount: 0,
      });
    });

    subscriptionRevenue.forEach((item) => {
      const key = item.restaurantId.toString();
      if (restaurantMap.has(key)) {
        const existing = restaurantMap.get(key);
        existing.subscriptionRevenue = item.subscriptionRevenue;
        existing.subscriptionCount = item.subscriptionCount;
      } else {
        restaurantMap.set(key, {
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          foodRevenue: 0,
          orderCount: 0,
          subscriptionRevenue: item.subscriptionRevenue,
          subscriptionCount: item.subscriptionCount,
        });
      }
    });

    const result = Array.from(restaurantMap.values())
      .map((item) => ({
        ...item,
        totalRevenue: item.foodRevenue + item.subscriptionRevenue,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch revenue by restaurant",
      error: error.message,
    });
  }
};

// GET REVENUE STATISTICS
exports.getRevenueStats = async (req, res) => {
  try {
    const Subscription = require("../models/Subscription");

    // Total food revenue
    const foodRevenueData = await Order.aggregate([
      {
        $match: { status: "DELIVERED" },
      },
      {
        $group: { _id: null, total: { $sum: "$totalAmount" } },
      },
    ]);

    // Total subscription revenue
    const subscriptionRevenueData = await Subscription.aggregate([
      {
        $match: { status: "active" },
      },
      {
        $group: { _id: null, total: { $sum: "$price" } },
      },
    ]);

    const foodRevenue = foodRevenueData[0]?.total || 0;
    const subscriptionRevenue = subscriptionRevenueData[0]?.total || 0;

    res.json({
      foodRevenue,
      subscriptionRevenue,
      totalRevenue: foodRevenue + subscriptionRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch revenue statistics",
      error: error.message,
    });
  }
};

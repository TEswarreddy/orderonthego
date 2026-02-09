const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const { getImageData } = require("../utils/uploadHandler");

// GET RESTAURANT PROFILE
exports.getRestaurantProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user || user.userType !== "RESTAURANT") {
      return res.status(403).json({ message: "Not a restaurant account" });
    }

    const restaurant = await Restaurant.findOne({ ownerId: userId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: getImageData(user),
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        approval: user.approval,
      },
      restaurant: {
        _id: restaurant._id,
        title: restaurant.title,
        address: restaurant.address,
        phone: restaurant.phone,
        cuisineType: restaurant.cuisineType,
        description: restaurant.description,
        profileImage: getImageData(restaurant),
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant profile", error: error.message });
  }
};

// UPDATE RESTAURANT PROFILE
exports.updateRestaurantProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, phone, address, restaurantTitle, restaurantAddress, restaurantPhone, cuisineType, description } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { username, phone, address },
      { new: true }
    ).select("-password");

    const restaurant = await Restaurant.findOneAndUpdate(
      { ownerId: userId },
      {
        title: restaurantTitle || restaurant.title,
        address: restaurantAddress || restaurant.address,
        phone: restaurantPhone || restaurant.phone,
        cuisineType: cuisineType || restaurant.cuisineType,
        description: description || restaurant.description,
      },
      { new: true }
    );

    if (!user || !restaurant) {
      return res.status(404).json({ message: "Restaurant or user not found" });
    }

    res.json({
      message: "Restaurant profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: getImageData(user),
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      restaurant: {
        _id: restaurant._id,
        title: restaurant.title,
        address: restaurant.address,
        phone: restaurant.phone,
        cuisineType: restaurant.cuisineType,
        description: restaurant.description,
        profileImage: getImageData(restaurant),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating restaurant profile", error: error.message });
  }
};

// UPLOAD RESTAURANT PROFILE IMAGE
exports.uploadRestaurantProfileImage = async (req, res) => {
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

    const restaurant = await Restaurant.findOne({ ownerId: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.profileImageBuffer = req.file.buffer;
    restaurant.profileImageMimeType = req.file.mimetype;
    restaurant.profileImage = `restaurant_${restaurant._id}_${Date.now()}`;

    await restaurant.save();

    res.json({
      message: "Restaurant profile image uploaded successfully",
      profileImage: getImageData(restaurant),
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};

// DELETE RESTAURANT PROFILE IMAGE
exports.deleteRestaurantProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const restaurant = await Restaurant.findOne({ ownerId: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.profileImage = null;
    restaurant.profileImageBuffer = null;
    restaurant.profileImageMimeType = null;

    await restaurant.save();

    res.json({ message: "Restaurant profile image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error: error.message });
  }
};

// UPLOAD USER PROFILE IMAGE
exports.uploadUserProfileImage = async (req, res) => {
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
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImageBuffer = req.file.buffer;
    user.profileImageMimeType = req.file.mimetype;
    user.profileImage = `profile_${userId}_${Date.now()}`;

    await user.save();

    res.json({
      message: "User profile image uploaded successfully",
      profileImage: getImageData(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};

// DELETE USER PROFILE IMAGE
exports.deleteUserProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = null;
    user.profileImageBuffer = null;
    user.profileImageMimeType = null;

    await user.save();

    res.json({ message: "Profile image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error: error.message });
  }
};

// GET ALL RESTAURANTS (for admin dashboard)
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("ownerId", "username email phone")
      .select("-profileImageBuffer");

    const restaurantsWithImages = restaurants.map((r) => ({
      _id: r._id,
      title: r.title,
      address: r.address,
      phone: r.phone,
      cuisineType: r.cuisineType,
      description: r.description,
      status: r.status || "pending",
      profileImage: getImageData(r),
      ownerId: r.ownerId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json(restaurantsWithImages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch restaurants",
      error: error.message,
    });
  }
};

const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const resolveRestaurantId = (user) =>
  user.userType === "STAFF" ? user.restaurantId : user._id;

// Get logged-in restaurant owner's foods
exports.getOwnFoods = async (req, res) => {
  try {
    let restaurantId;

    if (req.user.userType === "STAFF") {
      restaurantId = req.user.restaurantId;
    } else if (req.user.userType === "RESTAURANT") {
      // Find the restaurant document where this user is the owner
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      restaurantId = restaurant._id;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const foods = await Food.find({ restaurantId }).populate("restaurantId", "title");
    res.json(foods);
  } catch (error) {
    console.error("Get own foods error:", error);
    res.status(500).json({ message: "Failed to fetch foods", error: error.message });
  }
};


// Add food item (Restaurant only)
exports.addFood = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      category,
      menuType,
      mainImg,
      discount,
      isVeg,
    } = req.body;

    // ✅ BACKEND VALIDATION (CRITICAL)
    if (!title || price === undefined) {
      return res.status(400).json({
        message: "Food title and price are required",
      });
    }

    if (typeof isVeg !== "boolean") {
      return res.status(400).json({
        message: "Veg/Non-Veg selection is required",
      });
    }

    // Get the restaurant ID for this owner
    let restaurantId;
    if (req.user.userType === "RESTAURANT") {
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      restaurantId = restaurant._id;
    } else if (req.user.userType === "STAFF") {
      restaurantId = req.user.restaurantId;
    }

    const food = await Food.create({
      restaurantId,
      title,
      price: Number(price),
      description,
      category,
      menuType,
      mainImg,
      discount,
      isVeg,
    });

    res.status(201).json(food);
  } catch (error) {
    console.error("Add food error:", error);
    res.status(500).json({ message: "Failed to add food" });
  }
};

// Get all food items
exports.getAllFoods = async (req, res) => {
  const foods = await Food.find().populate("restaurantId", "title");
  res.json(foods);
};

// Get single food by ID
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate("restaurantId", "title");
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.json(food);
  } catch (error) {
    console.error("Get food by ID error:", error);
    res.status(500).json({ message: "Failed to fetch food details" });
  }
};

// Get food by restaurant
exports.getFoodsByRestaurant = async (req, res) => {
  const foods = await Food.find({ restaurantId: req.params.id });
  res.json(foods);
};

// Update food item (Restaurant only)
exports.updateFood = async (req, res) => {
  try {
    const { title, price, description, category, isVeg } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Verify ownership - check if user owns the restaurant
    const restaurant = await Restaurant.findById(food.restaurantId);
    if (!restaurant || restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this food" });
    }

    // Update fields
    if (title) food.title = title;
    if (price !== undefined) food.price = Number(price);
    if (description) food.description = description;
    if (category) food.category = category;
    if (typeof isVeg === "boolean") food.isVeg = isVeg;

    await food.save();
    res.json(food);
  } catch (error) {
    console.error("Update food error:", error);
    res.status(500).json({ message: "Failed to update food" });
  }
};

// Delete food item (Restaurant only)
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Verify ownership - check if user owns the restaurant
    const restaurant = await Restaurant.findById(food.restaurantId);
    if (!restaurant || restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this food" });
    }

    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(500).json({ message: "Failed to delete food" });
  }
};

// Update availability (Restaurant or Staff)
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Verify ownership
    const restaurant = await Restaurant.findById(food.restaurantId);
    
    let isOwner = false;
    if (req.user.userType === "STAFF") {
      // Staff member belongs to the restaurant
      isOwner = restaurant._id.toString() === req.user.restaurantId.toString();
    } else if (req.user.userType === "RESTAURANT") {
      // Restaurant owner
      isOwner = restaurant.ownerId.toString() === req.user._id.toString();
    }
    
    if (!isOwner) {
      return res.status(403).json({ message: "Not authorized to update this food" });
    }

    food.isAvailable = Boolean(isAvailable);
    await food.save();

    res.json(food);
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({ message: "Failed to update availability" });
  }
};

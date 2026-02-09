const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");


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
    } = req.body;

    // ✅ BACKEND VALIDATION (CRITICAL)
    if (!title || price === undefined) {
      return res.status(400).json({
        message: "Food title and price are required",
      });
    }

    const food = await Food.create({
      restaurantId: req.user._id,
      title,
      price: Number(price),
      description,
      category,
      menuType,
      mainImg,
      discount,
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
    const { title, price, description, category } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Verify ownership
    if (food.restaurantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this food" });
    }

    // Update fields
    if (title) food.title = title;
    if (price !== undefined) food.price = Number(price);
    if (description) food.description = description;
    if (category) food.category = category;

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

    // Verify ownership
    if (food.restaurantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this food" });
    }

    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(500).json({ message: "Failed to delete food" });
  }
};

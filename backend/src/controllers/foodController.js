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

// Get food by restaurant
exports.getFoodsByRestaurant = async (req, res) => {
  const foods = await Food.find({ restaurantId: req.params.id });
  res.json(foods);
};

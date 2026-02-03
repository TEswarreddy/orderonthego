const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");


// Add food item (Restaurant only)
exports.addFood = async (req, res) => {
  const food = await Food.create({
    ...req.body,
    restaurantId: req.user._id,
  });
  res.status(201).json(food);
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

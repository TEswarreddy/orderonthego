const Cart = require("../models/Cart");
const Food = require("../models/Food");

// Add item to cart
exports.addToCart = async (req, res) => {
  const { foodId, quantity } = req.body;
  const food = await Food.findById(foodId);

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      userId: req.user._id,
      restaurantId: food.restaurantId,
      items: [],
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.foodId.toString() === foodId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      foodId,
      itemName: food.title,
      itemImg: food.mainImg,
      quantity,
      price: food.price,
      discount: food.discount,
    });
  }

  await cart.save();
  res.json(cart);
};

// Get cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  res.json(cart);
};

// Remove item
exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  cart.items = cart.items.filter(
    (item) => item.foodId.toString() !== req.params.id
  );
  await cart.save();
  res.json(cart);
};

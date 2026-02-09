const mongoose = require("mongoose");
const dns = require("dns");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
require("dotenv").config();

const sampleFoods = [
  {
    title: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella, basil, and tomato sauce",
    mainImg: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
    menuType: "Main Course",
    category: "Italian",
    price: 12.99,
    discount: 0,
    rating: 4.5,
    isAvailable: true,
  },
  {
    title: "Pepperoni Pizza",
    description: "Loaded with pepperoni, mozzarella cheese, and tomato sauce",
    mainImg: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500",
    menuType: "Main Course",
    category: "Italian",
    price: 14.99,
    discount: 10,
    rating: 4.7,
    isAvailable: true,
  },
  {
    title: "Caesar Salad",
    description: "Crispy romaine lettuce with Caesar dressing, croutons, and parmesan",
    mainImg: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500",
    menuType: "Salad",
    category: "Healthy",
    price: 8.99,
    discount: 0,
    rating: 4.3,
    isAvailable: true,
  },
  {
    title: "Beef Burger",
    description: "Juicy beef patty with lettuce, tomato, cheese, and special sauce",
    mainImg: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    menuType: "Main Course",
    category: "American",
    price: 11.99,
    discount: 5,
    rating: 4.6,
    isAvailable: true,
  },
  {
    title: "Chicken Wings",
    description: "Crispy fried chicken wings with your choice of sauce",
    mainImg: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500",
    menuType: "Appetizer",
    category: "American",
    price: 9.99,
    discount: 0,
    rating: 4.4,
    isAvailable: true,
  },
  {
    title: "Spaghetti Carbonara",
    description: "Creamy pasta with bacon, eggs, parmesan, and black pepper",
    mainImg: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500",
    menuType: "Main Course",
    category: "Italian",
    price: 13.99,
    discount: 0,
    rating: 4.5,
    isAvailable: true,
  },
  {
    title: "Pad Thai",
    description: "Traditional Thai stir-fried noodles with shrimp, tofu, and peanuts",
    mainImg: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500",
    menuType: "Main Course",
    category: "Thai",
    price: 12.49,
    discount: 0,
    rating: 4.6,
    isAvailable: true,
  },
  {
    title: "Sushi Platter",
    description: "Assorted sushi rolls including California, spicy tuna, and salmon",
    mainImg: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500",
    menuType: "Main Course",
    category: "Japanese",
    price: 18.99,
    discount: 15,
    rating: 4.8,
    isAvailable: true,
  },
  {
    title: "Fish and Chips",
    description: "Crispy battered fish with golden fries and tartar sauce",
    mainImg: "https://images.unsplash.com/photo-1579208570378-8c970854bc23?w=500",
    menuType: "Main Course",
    category: "British",
    price: 14.49,
    discount: 0,
    rating: 4.4,
    isAvailable: true,
  },
  {
    title: "Tacos Al Pastor",
    description: "Three soft tacos with marinated pork, pineapple, cilantro, and onions",
    mainImg: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500",
    menuType: "Main Course",
    category: "Mexican",
    price: 10.99,
    discount: 0,
    rating: 4.7,
    isAvailable: true,
  },
  {
    title: "Chocolate Lava Cake",
    description: "Warm chocolate cake with melted chocolate center and vanilla ice cream",
    mainImg: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500",
    menuType: "Dessert",
    category: "Dessert",
    price: 6.99,
    discount: 0,
    rating: 4.9,
    isAvailable: true,
  },
  {
    title: "Mango Smoothie",
    description: "Refreshing blend of fresh mangoes, yogurt, and honey",
    mainImg: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500",
    menuType: "Beverage",
    category: "Drinks",
    price: 5.99,
    discount: 0,
    rating: 4.5,
    isAvailable: true,
  },
  {
    title: "BBQ Ribs",
    description: "Tender pork ribs glazed with smoky BBQ sauce, served with coleslaw",
    mainImg: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
    menuType: "Main Course",
    category: "American",
    price: 19.99,
    discount: 10,
    rating: 4.8,
    isAvailable: true,
  },
  {
    title: "Greek Salad",
    description: "Fresh tomatoes, cucumbers, olives, feta cheese with olive oil dressing",
    mainImg: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500",
    menuType: "Salad",
    category: "Mediterranean",
    price: 9.49,
    discount: 0,
    rating: 4.4,
    isAvailable: true,
  },
  {
    title: "Chicken Tikka Masala",
    description: "Tender chicken in creamy tomato-based curry with Indian spices",
    mainImg: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
    menuType: "Main Course",
    category: "Indian",
    price: 15.99,
    discount: 0,
    rating: 4.7,
    isAvailable: true,
  },
];

const seedFoods = async () => {
  try {
    // Set DNS servers if configured
    if (process.env.MONGO_DNS_SERVERS) {
      dns.setServers(
        process.env.MONGO_DNS_SERVERS
          .split(",")
          .map((server) => server.trim())
          .filter(Boolean)
      );
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log("Connected to MongoDB");

    // Find all approved restaurants
    const restaurants = await Restaurant.find();
    
    if (restaurants.length === 0) {
      console.log("No restaurants found. Please create a restaurant first.");
      process.exit(1);
    }

    console.log(`Found ${restaurants.length} restaurant(s)`);

    // Delete existing food items (optional - comment out if you want to keep existing items)
    await Food.deleteMany({});
    console.log("Cleared existing food items");

    // Add food items to each restaurant
    const foodsToInsert = [];
    restaurants.forEach((restaurant) => {
      sampleFoods.forEach((food) => {
        foodsToInsert.push({
          ...food,
          restaurantId: restaurant._id,
        });
      });
    });

    const insertedFoods = await Food.insertMany(foodsToInsert);
    console.log(`✅ Successfully inserted ${insertedFoods.length} food items`);
    
    console.log("\nFood items distribution:");
    restaurants.forEach((restaurant, index) => {
      console.log(`  - ${restaurant.title}: ${sampleFoods.length} items`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding foods:", error);
    process.exit(1);
  }
};

seedFoods();

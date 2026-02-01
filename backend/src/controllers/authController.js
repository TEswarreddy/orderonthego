const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// REGISTER
exports.register = async (req, res) => {
  const { username, email, password, userType } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    userType,
    approval: userType === "RESTAURANT" ? false : true,
  });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    token: generateToken(user),
  });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", req.body);

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.userType === "RESTAURANT" && !user.approval) {
    return res.status(403).json({ message: "Restaurant not approved by admin" });
  }

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    token: generateToken(user),
  });
};

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken } = require('../services/users')

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateAccessToken({ username: user.username, email: user.email });

        req.session.user = { id: user._id, username: user.username, email: user.email };

        res.json({ message: "Login successful", user: req.session.user, token });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
} 

const logout = (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
}

const register = async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await User.findOne({ $or: [{ username }, { email }] }).lean();
      if (existing) {
        const field = existing.username === username ? "username" : "email";
        return res.status(409).json({ error: `${field} already exists` });
      }
  

      const newUser = new User({ username, email, password });
      await newUser.save();
  
      return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {

      if (error && error.code === 11000) {
        const field =
          (error.keyPattern && Object.keys(error.keyPattern)[0]) ||
          (error.keyValue && Object.keys(error.keyValue)[0]) ||
          "field";
        return res.status(409).json({ error: `${field} already exists` });
      }
  
      if (error && error.name === "ValidationError") {
        const msg = Object.values(error.errors).map(e => e.message).join(", ");
        return res.status(400).json({ error: msg });
      }
  
      console.error("Error in /register:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

const getUser = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Missing email parameter" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ username: user.username });
    } catch (error) {
        console.error("Error fetching username:", error);
        res.status(500).json({ message: "Server error" });
    }
} 

module.exports = {
    login,
    logout,
    register,
    getUser,
}
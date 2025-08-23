const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken } = require('../services/users')

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt:", email, password);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("User found:", user);

        console.log("Comparing:", password, "VS", user.password);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

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
        console.log("Received register request:", req.body);

        const { username, email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ username, email, password });
        await newUser.save();

        console.log("User saved to MongoDB:", newUser);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error in /register:", error);
        res.status(500).json({ message: "Server error" });
    }
}

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
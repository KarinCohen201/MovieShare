const User = require("../models/User");
const Link = require("../models/Link");


exports.checkAdmin = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Missing email" });
    }

    try {
        const user = await User.findOne({ email });
        res.json({ isAdmin: user?.role === "admin" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};



exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Retrieving all users without the password field
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};


exports.makeAdmin = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Missing email" });
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { role: "admin" },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User is now an admin", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};


exports.getAllPublicLinks = async (req, res) => {
    try {
        const publicLinks = await Link.find({ linkType: "public" });
        res.json(publicLinks);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};



exports.deletePublicLink = async (req, res) => {
    const { linkId } = req.body;
    if (!linkId) {
        return res.status(400).json({ error: "Missing linkId" });
    }

    try {
        const deletedLink = await Link.findByIdAndDelete(linkId);
        if (!deletedLink) {
            return res.status(404).json({ error: "Link not found" });
        }

        res.json({ message: "Link deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

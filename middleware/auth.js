const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Link = require("../models/Link");

exports.checkAdminMiddleware = async (req, res, next) => {
    const email = req.body.email || req.query.email;

    if (!email) {
        return res.status(400).json({ error: "Missing email" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        return next(); 
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.replace("Bearer ", "");
  if (!token || token === "null") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};


exports.authorizeUserOrAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token || token === "null") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = user;

    const foundUser = await User.findOne({ email: user.email });
    if (foundUser && foundUser.role === "admin") {
      return next(); 
    }

    const linkId = req.body.linkId; 
    if (!linkId) {
      return res.status(400).json({ error: "Missing link ID" });
    }

    console.log("Link:", Link);
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    if (link.username !== user.username) {
      return res.status(403).json({ error: "Access denied: You are not the owner of this link" });
    }

    return next();

  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(403).json({ error: "Invalid token or unauthorized access" });
  }
};

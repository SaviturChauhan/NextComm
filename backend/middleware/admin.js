const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Admin middleware - checks if user is authenticated AND is an admin
const admin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = admin;

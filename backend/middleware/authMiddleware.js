const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');

// Middleware to authenticate regular users
const authUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "Token not provided. You must be logged in." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Optional: remove this console log in production
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(403).json({ error: "Access denied. User not found." });
        }

        req.user = user; // Attach the authenticated user to the request object
        next();
    } catch (error) {
        console.error("User authentication error:", error);
        res.status(400).json({ error: "Invalid token. Please ensure you're sending a valid token." });
    }
};

// Middleware to authenticate administrators
const authAdmin = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "Token not provided. You must be logged in as an administrator." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ email: decoded.email });

        if (!admin) {
            return res.status(403).json({ error: "Access denied. Only administrators can access this route." });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error("Admin authentication error:", error);
        res.status(400).json({ error: "Invalid token. Please ensure you're sending a valid token." });
    }
};

module.exports = { authUser, authAdmin };

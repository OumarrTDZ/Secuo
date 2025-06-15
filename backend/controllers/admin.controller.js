const { isValidObjectId } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.model");
const User = require("../models/User.model");

// Register a new admin (only accessible to other admins)
const registerAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: "An admin with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ email, password: hashedPassword });

        await newAdmin.save();
        res.status(201).json({ message: "Admin successfully registered." });
    } catch (error) {
        console.error("Error registering admin:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ error: "Admin not found." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password." });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Login successful.", token });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Delete a user by admin
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format." });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: "User account deleted successfully by admin." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Admin dashboard
const getDashboard = (req, res) => {
    res.json({ message: "Admin dashboard", admin: req.admin });
};

module.exports = {
    registerAdmin,
    loginAdmin,
    deleteAdmin,
    getDashboard
};

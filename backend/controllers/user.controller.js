const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Contract = require('../models/Contract.model');
const Space = require('../models/Space.model');
const { isValidObjectId } = require('mongoose');
const fs = require('fs');
const path = require('path');

// Helper to get relative file path based on uploaded field
const getRelativePath = (field, req) => {
    const file = req.files?.[field]?.[0];
    if (!file) return null;

    let subfolder = '';
    switch (field) {
        case 'idFrontPhoto':
            subfolder = 'idfront';
            break;
        case 'idBackPhoto':
            subfolder = 'idback';
            break;
        case 'profilePhoto':
            subfolder = 'profilephoto';
            break;
        default:
            subfolder = 'misc';
    }

    return `/uploads/${req.body.dni}/${subfolder}/${file.filename}`;
};

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { dni, firstName, lastName, email, phoneNumber, preference, password } = req.body;

        const idFrontPhoto = getRelativePath('idFrontPhoto', req);
        const idBackPhoto = getRelativePath('idBackPhoto', req);
        const profilePhoto = getRelativePath('profilePhoto', req);

        // Check if user with email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user document
        const user = new User({
            dni,
            firstName,
            lastName,
            email,
            phoneNumber,
            preference,
            idFrontPhoto,
            idBackPhoto,
            profilePhoto,
            password: hashedPassword
        });

        await user.save();

        // Generate JWT token (optional)
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        res.status(201).json({
            message: "User successfully registered",
            token,
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User login
const loginUser = async (req, res) => {
    try {
        const { dni, password } = req.body;

        const user = await User.findOne({ dni });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        const token = jwt.sign(
            { id: user._id, dni: user.dni },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Login successful", user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile (only user themselves)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        if (req.user._id.toString() !== id) {
            return res.status(403).json({ error: "Unauthorized: You can only edit your own profile" });
        }

        const updates = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        Object.keys(updates).forEach(key => {
            if (key === "password") {
                user.password = bcrypt.hashSync(updates[key], 10);
            } else {
                user[key] = updates[key];
            }
        });

        await user.save();
        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete user profile (only user themselves)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user || req.user._id.toString() !== id) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own account" });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get user profile (from token)
const getUserProfile = async (req, res) => {
    res.json({ message: "User profile", user: req.user });
};

// Approve or reject user (admin action)
const validateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found." });

        user.validationStatus = req.body.validationStatus; // Expect "APPROVED" or "REJECTED"
        await user.save();

        res.json({
            message: `User ${req.body.validationStatus === "APPROVED" ? "approved" : "rejected"}`,
            user
        });
    } catch (error) {
        console.error("Error validating user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get dashboard for tenant (rented spaces and contracts)
const getTenantDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const rentedContracts = await Contract.find({ tenantDni: user.dni }).populate({
            path: "spaceId",
            model: "Space",
            select: "spaceType monthlyPrice description _id gallery rooms"
        });

        const rentedSpaces = rentedContracts.map(contract => contract.spaceId);

        res.json({ message: "User profile", user, rentedSpaces });
    } catch (error) {
        console.error("Error in getTenantDashboard:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get dashboard for owner (owned spaces)
const getOwnerDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const ownedSpaces = await Space.find({ ownerDni: user.dni }).select(
            "spaceType monthlyPrice description _id gallery rooms validationStatus status"
        );

        res.json({ user, ownedSpaces });
    } catch (error) {
        console.error("Error in getOwnerDashboard:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Delete profile photo file and remove path in user document
const deleteProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found." });

        if (user.profilePhoto) {
            const filePath = path.isAbsolute(user.profilePhoto)
                ? user.profilePhoto
                : path.join(__dirname, "..", user.profilePhoto);

            fs.unlink(filePath, (err) => {
                if (err) console.warn("Could not delete old profile photo", err);
            });
        }

        user.profilePhoto = null;
        await user.save();

        res.json({ message: "Profile photo deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update profile photo file and path in user document
const updateProfilePhoto = async (req, res) => {
    try {
        const user = await User.findOne({ dni: req.params.dni });
        if (!user) return res.status(404).json({ error: "User not found." });

        // Delete old profile photo if exists
        if (user.profilePhoto) {
            const filePath = path.isAbsolute(user.profilePhoto)
                ? user.profilePhoto
                : path.join(__dirname, "..", user.profilePhoto);

            fs.unlink(filePath, (err) => {
                if (err) console.warn("Could not delete old profile photo", err);
            });
        }

        // Save new relative path of uploaded file
        const relativePath = req.file.path.replace(path.join(__dirname, ".."), "").replace(/\\/g, "/");
        user.profilePhoto = relativePath;
        await user.save();

        res.json({ message: "Profile photo updated", photo: user.profilePhoto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getOwnerDashboard,
    getTenantDashboard,
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUserProfile,
    validateUser,
    deleteProfilePhoto,
    updateProfilePhoto
};

const express = require('express');
const { authUser, authAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User.model');
const { upload } = require('../utils/upload');
const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUserProfile,
    validateUser,
    getTenantDashboard,
    getOwnerDashboard,
    deleteProfilePhoto,
    updateProfilePhoto
} = require('../controllers/user.controller');

const router = express.Router();

// Register a new user with file uploads
router.post('/register', upload.fields([
    { name: 'idFrontPhoto', maxCount: 1 },
    { name: 'idBackPhoto', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 }
]), registerUser);

// User login
router.post('/login', loginUser);

// Get tenant dashboard
router.get('/getTenantDashboard', authUser, getTenantDashboard);

// Get owner dashboard
router.get('/getOwnerDashboard', authUser, getOwnerDashboard);

// Get authenticated user's profile
router.get('/profile', authUser, getUserProfile);

// Get users with pending validation status (admin only)
router.get('/pending', authAdmin, async (req, res) => {
    const users = await User.find({ validationStatus: "PENDING" });
    res.json({ users });
});

// Update user's profile photo
router.post('/upload-profile/:dni', authUser, upload.single('profilePhoto'), updateProfilePhoto);

// Edit user details
router.patch('/:id/edit', authUser, updateUser);

// Validate user (admin only)
router.patch('/:id/validate', authAdmin, validateUser);

// Delete user account
router.delete('/:id/delete', authUser, deleteUser);

// Delete user's profile photo
router.delete('/:id/profilePhoto', authUser, deleteProfilePhoto);

module.exports = router;

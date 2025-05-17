const express = require('express');
const { authAdmin } = require('../middleware/authMiddleware');
const { registerAdmin, loginAdmin, deleteAdmin, getDashboard } = require('../controllers/admin.controller');

const router = express.Router();

// Routes related to admin user management and dashboard

// Register a new admin (protected route)
router.post('/register', authAdmin, registerAdmin);

// Admin login (public route)
router.post('/login', loginAdmin);

// Delete an admin by ID (protected route)
router.delete('/:id/delete', authAdmin, deleteAdmin);

// Get admin dashboard data (protected route)
router.get('/dashboard', authAdmin, getDashboard);

// Check if the current user is an admin (protected route)
router.get('/check', authAdmin, (req, res) => {
    res.json({ isAdmin: true });
});

module.exports = router;

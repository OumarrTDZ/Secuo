const express = require('express');
const { authUser } = require('../middleware/authMiddleware');
const {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notification.controller');

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authUser, getUserNotifications);

// Get unread notifications count
router.get('/unread', authUser, getUnreadCount);

// Mark notifications as read
router.post('/mark-read', authUser, markAsRead);

// Mark all notifications as read
router.post('/mark-all-read', authUser, markAllAsRead);

// Delete a notification
router.delete('/:id', authUser, deleteNotification);

module.exports = router; 
const Notification = require('../models/Notification.model');

// Create a new notification
const createNotification = async (recipientDni, type, title, message, relatedId = null) => {
    try {
        const notification = new Notification({
            recipientDni,
            type,
            title,
            message,
            relatedId
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            recipientDni: req.user.dni 
        }).sort({ createdAt: -1 });
        
        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get unread notifications count for a user
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            recipientDni: req.user.dni,
            read: false
        });
        
        res.json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;
        
        await Notification.updateMany(
            { 
                _id: { $in: notificationIds },
                recipientDni: req.user.dni 
            },
            { $set: { read: true } }
        );
        
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientDni: req.user.dni },
            { $set: { read: true } }
        );
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findOne({ 
            _id: id,
            recipientDni: req.user.dni
               });
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        await notification.remove();
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
}; 
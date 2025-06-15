const Notification = require('../models/Notification.model');

// Create a new notification
const createNotification = async (recipientDni, type, title, message, relatedId = null) => {
    try {
        console.log('[createNotification] Creating notification for:', { recipientDni, type, title });
        const notification = new Notification({
            recipientDni,
            type,
            title,
            message,
            relatedId
        });
        await notification.save();
        console.log('[createNotification] Notification created:', notification._id);
        return notification;
    } catch (error) {
        console.error('[createNotification] Error:', error);
        throw error;
    }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        console.log('[getUserNotifications] Fetching notifications for user:', req.user.dni);
        const notifications = await Notification.find({ 
            recipientDni: req.user.dni 
        }).sort({ createdAt: -1 });
        
        console.log('[getUserNotifications] Found notifications:', notifications.length);
        console.log('[getUserNotifications] Unread count:', notifications.filter(n => !n.read).length);
        
        res.json(notifications);
    } catch (error) {
        console.error('[getUserNotifications] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get unread notifications count for a user
const getUnreadCount = async (req, res) => {
    try {
        console.log('[getUnreadCount] Counting unread notifications for user:', req.user.dni);
        const count = await Notification.countDocuments({ 
            recipientDni: req.user.dni,
            read: false
        });
        
        console.log('[getUnreadCount] Unread count:', count);
        res.json({ count });
    } catch (error) {
        console.error('[getUnreadCount] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;
        console.log('[markAsRead] Marking notifications as read:', { user: req.user.dni, notificationIds });
        
        const updatedNotifications = await Notification.updateMany(
            { 
                _id: { $in: notificationIds },
                recipientDni: req.user.dni 
            },
            { $set: { read: true } }
        );

        console.log('[markAsRead] Updated notifications count:', updatedNotifications.nModified);

        const io = req.app.get('io');
        if (io) {
            const room = `notifications:${req.user.dni}`;
            console.log('[markAsRead] Emitting socket event to room:', room);
            io.to(room).emit('notificationsRead', { notificationIds });
        }
        
        res.json({ message: 'Notifications marked as read', updated: updatedNotifications.nModified });
    } catch (error) {
        console.error('[markAsRead] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        console.log('[markAllAsRead] Marking all notifications as read for user:', req.user.dni);
        
        const result = await Notification.updateMany(
            { recipientDni: req.user.dni },
            { $set: { read: true } }
        );

        console.log('[markAllAsRead] Updated notifications count:', result.nModified);

        // emit the socket event to update the notification in real time
        const io = req.app.get('io');
        if (io) {
            const room = `notifications:${req.user.dni}`;
            console.log('[markAllAsRead] Emitting socket event to room:', room);
            io.to(room).emit('allNotificationsRead');
        }
        
        res.json({ 
            message: 'All notifications marked as read',
            updated: result.nModified
        });
    } catch (error) {
        console.error('[markAllAsRead] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[deleteNotification] Deleting notification:', { id, user: req.user.dni });
        
        const notification = await Notification.findOne({ 
            _id: id,
            recipientDni: req.user.dni
        });
        
        if (!notification) {
            console.log('[deleteNotification] Notification not found');
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        await notification.remove();
        console.log('[deleteNotification] Notification deleted successfully');

        // emit the socket event to update the notification in real time
        const io = req.app.get('io');
        if (io) {
            const room = `notifications:${req.user.dni}`;
            console.log('[deleteNotification] Emitting socket event to room:', room);
            io.to(room).emit('notificationDeleted', { notificationId: id });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('[deleteNotification] Error:', error);
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
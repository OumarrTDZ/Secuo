const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipientDni: {
        type: String,
        required: true,
        // DNI of the user who should receive this notification
    },
    type: {
        type: String,
        required: true,
        enum: ['SPACE_APPROVED', 'SPACE_REJECTED', 'CONTRACT_APPROVED', 'CONTRACT_REJECTED', 'NEW_MESSAGE', 'PAYMENT_RECEIVED', 'PAYMENT_DUE', 'USER_APPROVED', 'USER_REJECTED'],
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        // ID of the related document (space, contract, etc.)
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Notification', NotificationSchema); 
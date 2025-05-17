const mongoose = require('mongoose');

/**
 * Schema representing a message within a conversation or group chat
 */
const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true
        // ID of the conversation or chat group
    },
    senderDni: {
        type: String,
        required: true
        // DNI (identifier) of the user sending the message
    },
    message: {
        type: String,
        required: true
        // Content of the message
    },
    status: {
        type: String,
        enum: ["SENT", "DELIVERED", "READ"],
        default: "SENT"
        // Current status of the message delivery
    },
    sentAt: {
        type: Date,
        default: Date.now
        // Timestamp when the message was sent
    },
    reactions: {
        type: Map,
        of: Number,
        default: {}
        // Reactions to the message, mapped by emoji to count
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: false
        // Reference to another message this one is replying to
    },
    deleted: {
        type: Boolean,
        default: false
        // Indicates if the message was deleted
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);

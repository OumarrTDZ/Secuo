const Message = require('../models/Message.model');
const ChatGroup = require('../models/ChatGroup.model');

// Send a message
const sendMessage = async (socket, messageData) => {
    try {
        const { conversationId, senderDni, message, replyTo } = messageData;

        // Validate if the chat exists
        const chatExists = await ChatGroup.findById(conversationId);
        if (!chatExists) return socket.emit('error', { message: "Chat not found" });

        // Create and save the message
        const newMessage = new Message({ conversationId, senderDni, message, replyTo });
        await newMessage.save();

        // Emit the message to everyone in the chat
        socket.broadcast.to(conversationId).emit('receiveMessage', newMessage);
        socket.emit('messageSent', newMessage); // Confirmation to sender
    } catch (error) {
        console.error("Error sending message:", error);
        socket.emit('error', { message: "Internal error" });
    }
};

// Get message history in a chat
const getMessagesByChat = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ sentAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ error: "Internal error" });
    }
};

// Mark messages as delivered
const markDelivered = async (socket, conversationId) => {
    try {
        await Message.updateMany({ conversationId, status: "SENT" }, { $set: { status: "DELIVERED" } });
        socket.emit('messagesUpdated', { conversationId, status: "DELIVERED" });
    } catch (error) {
        console.error("Error marking messages as delivered:", error);
    }
};

// Mark messages as read
const markRead = async (socket, conversationId) => {
    try {
        await Message.updateMany({ conversationId, status: "DELIVERED" }, { $set: { status: "READ" } });
        socket.emit('messagesUpdated', { conversationId, status: "READ" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
    }
};

// Delete a message (marks 'deleted' as true)
const deleteMessage = async (socket, messageId, senderDni) => {
    try {
        const message = await Message.findById(messageId);
        if (!message) return socket.emit('error', { message: "Message not found" });

        // Validate that the user is the sender
        if (message.senderDni !== senderDni) {
            return socket.emit('error', { message: "Unauthorized: You can only delete your own messages" });
        }

        // Mark the message as deleted
        message.deleted = true;
        await message.save();

        // Notify everyone in the chat
        socket.broadcast.to(message.conversationId).emit('messageDeleted', { messageId });
        socket.emit('messageDeleted', { messageId });
    } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit('error', { message: "Internal error" });
    }
};

// Add a reaction to a message
const reactMessage = async (socket, { messageId, emoji }) => {
    try {
        const message = await Message.findById(messageId);
        if (!message) return socket.emit('error', { message: "Message not found" });

        // Increment the reaction counter
        message.reactions.set(emoji, (message.reactions.get(emoji) || 0) + 1);
        await message.save();

        // Notify everyone in the chat
        socket.broadcast.to(message.conversationId).emit('messageReacted', { messageId, emoji });
        socket.emit('messageReacted', { messageId, emoji });
    } catch (error) {
        console.error("Error reacting to message:", error);
        socket.emit('error', { message: "Internal error" });
    }
};

module.exports = {
    sendMessage,
    getMessagesByChat,
    markDelivered,
    markRead,
    deleteMessage,
    reactMessage
};

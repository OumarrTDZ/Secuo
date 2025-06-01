const { sendMessage, markDelivered, markRead, deleteMessage, reactMessage } = require('./controllers/message.controller');
const { createNotification } = require('./controllers/notification.controller');

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join user's personal notification room
        socket.on('joinNotifications', (userDni) => {
            socket.join(`notifications:${userDni}`);
            console.log(`User ${userDni} joined their notification room`);
        });

        socket.on('joinChat', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.id} joined chat ${conversationId}`);
            markDelivered(socket, conversationId);
        });

        socket.on('sendMessage', async (messageData) => {
            await sendMessage(socket, messageData);
        });

        socket.on('messageRead', async (conversationId) => {
            await markRead(socket, conversationId);
        });

        socket.on('deleteMessage', async ({ messageId, senderDni }) => {
            await deleteMessage(socket, messageId, senderDni);
        });

        socket.on('reactMessage', async ({ messageId, emoji }) => {
            await reactMessage(socket, { messageId, emoji });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    // Function to emit notification to a specific user
    io.notifyUser = async (userDni, type, title, message, relatedId = null) => {
        try {
            const notification = await createNotification(userDni, type, title, message, relatedId);
            io.to(`notifications:${userDni}`).emit('newNotification', notification);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };
};

module.exports = socketHandler;

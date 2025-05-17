const { sendMessage, markDelivered, markRead, deleteMessage, reactMessage } = require('./controllers/message.controller');

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

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
};

module.exports = socketHandler;

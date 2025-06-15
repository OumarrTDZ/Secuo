const jwt = require('jsonwebtoken');
const { createNotification } = require('./controllers/notification.controller');

module.exports = (io) => {
    // Store active connections
    const activeConnections = new Map();

    io.on('connection', (socket) => {
        console.log('New socket connection');

        socket.on('joinNotifications', async (data) => {
            try {
                const { dni, token } = data;
                
                // Verify token
                jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err || decoded.dni !== dni) {
                        socket.emit('error', { message: 'Authentication failed' });
                        return;
                    }

                    // Join notification room
                    const room = `notifications:${dni}`;
                    socket.join(room);
                    activeConnections.set(socket.id, { dni, room });
                    
                    socket.emit('joinedNotifications', { 
                        message: 'Successfully joined notifications room',
                        room 
                    });
                });
            } catch (error) {
                console.error('Error joining notifications:', error);
                socket.emit('error', { message: 'Failed to join notifications' });
            }
        });

        // --- CHAT SOCKET LOGIC ---
        socket.on('joinChat', (data) => {
            const { conversationId } = data;
            if (conversationId) {
                socket.join(conversationId);
                socket.emit('joinedChat', { conversationId });
            }
        });

        // manage message sents
        socket.on('sendMessage', async (messageData) => {
            try {

                const { sendMessage } = require('./controllers/message.controller');
                await sendMessage(socket, messageData);
            } catch (error) {
                console.error('Error in sendMessage socket event:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            const connection = activeConnections.get(socket.id);
            if (connection) {
                activeConnections.delete(socket.id);
            }
            console.log('Client disconnected');
        });
    });

    // Add notifyUser as a method of io
    io.notifyUser = async (userDni, type, title, message, relatedId = null) => {
        try {
            console.log(`Creating notification for user ${userDni}:`, { type, title });
            const notification = await createNotification(userDni, type, title, message, relatedId);
            const room = `notifications:${userDni}`;
            console.log(`Emitting notification to room: ${room}`);
            io.to(room).emit('newNotification', notification);
            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    };

    return io;
};

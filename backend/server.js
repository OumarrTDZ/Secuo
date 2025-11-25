require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socketHandler');
const { app, allowedOrigins } = require('./app');

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io available to our controllers
app.set('io', io);

// Initialize WebSocket handlers
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
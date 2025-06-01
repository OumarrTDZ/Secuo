require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('./config/db'); // MongoDB connection
const socketHandler = require('./socketHandler'); // WebSockets handler
const path = require('path');
const createUploadDirectories = require('./utils/initializeUploadDirs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.json());
app.use(require('cors')());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log all static file requests for debugging
app.use('/uploads', (req, res, next) => {
    console.log('Static file request:', req.url);
    next();
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const contractRoutes = require('./routes/contractRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatGroupRoutes = require('./routes/chatGroupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chatGroups', chatGroupRoutes);
app.use('/api/notifications', notificationRoutes);

// Make io available to our controllers
app.set('io', io);

// Initialize WebSocket handlers
socketHandler(io);

// Initialize upload directories
createUploadDirectories();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('./config/db'); // MongoDB connection
const socketHandler = require('./socketHandler'); // WebSockets handler
const path = require('path');
const createUploadDirectories = require('./utils/initializeUploadDirs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS Configuration
// Allow requests from Vercel (Frontend) and Localhost (Development)
const allowedOrigins = [
    "https://secuo-rho.vercel.app",
    "http://localhost:5173",
    "http://localhost:5000"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log all static file requests for debugging
app.use('/uploads', (req, res, next) => {
    console.log('Static file request:', req.url);
    next();
});

// Health Check Route (Important for Render)
app.get('/', (req, res) => {
    res.status(200).send('API is running...');
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

// Initialize upload directories
createUploadDirectories();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
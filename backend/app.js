require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const createUploadDirectories = require('./utils/initializeUploadDirs');

// Connect to database (executes on require)
require('./config/db');

// Initialize upload directories
createUploadDirectories();

const app = express();

// CORS Configuration
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

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log all static file requests for debugging
app.use('/uploads', (req, res, next) => {
    console.log('Static file request:', req.url);
    next();
});

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).send('API is running...');
});

// Import Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const contractRoutes = require('./routes/contractRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatGroupRoutes = require('./routes/chatGroupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chatGroups', chatGroupRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = { app, allowedOrigins };
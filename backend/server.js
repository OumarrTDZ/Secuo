require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('./config/db'); // MongoDB connection
const socketHandler = require('./socketHandler'); // WebSockets handler
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.json());
app.use(require('cors')());
// Make uploads folder accessible at http://localhost:5000/uploads/<dni>/<folder>/<file>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const contractRoutes = require('./routes/contractRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatGroupRoutes = require('./routes/chatGroupRoutes');

app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chatGroups', chatGroupRoutes);

// Initialize WebSocket handlers
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

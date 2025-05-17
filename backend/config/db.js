const mongoose = require('mongoose');

// Connect to MongoDB using URI from environment variables
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("Failed to connect to MongoDB:", err));

module.exports = mongoose;

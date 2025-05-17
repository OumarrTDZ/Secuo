const mongoose = require('mongoose');

// Schema definition for administrator accounts
const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);

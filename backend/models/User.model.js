const mongoose = require('mongoose');

/**
 * User schema representing tenants or owners.
 * DNI is used as a unique identifier.
 */
const userSchema = new mongoose.Schema({
    dni: {
        type: String,
        required: true,
        unique: true,
        minlength: 9,
        maxlength: 9
        // National ID number, exactly 9 characters
    },
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100
        // User's first name
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 150
        // User's last name
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
        // User's email address
    },
    phoneNumber: {
        type: String,
        minlength: 9,
        maxlength: 15
        // Optional phone number
    },
    preference: {
        type: String,
        enum: ['TENANT', 'OWNER'],
        required: true
    },
    idFrontPhoto: {
        type: String,
        required: true
    },
    idBackPhoto: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        // URL or path to profile photo
    },
    password: {
        type: String,
        required: true
        // Hashed password
    },
    validationStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
        // Validation status of the user profile
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

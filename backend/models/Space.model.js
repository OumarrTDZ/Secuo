const mongoose = require('mongoose');

/**
 * Schema representing a rentable or sellable space (e.g., apartment, garage)
 */
const SpaceSchema = new mongoose.Schema({
    spaceType: {
        type: String,
        enum: ['APARTMENT', 'GARAGE'],
        required: true
        // Type of space
    },
    floor: {
        type: Number,
        required: false
        // Floor number, if applicable
    },
    door: {
        type: String,
        required: false
        // Door identifier or number
    },
    squareMeters: {
        type: Number,
        required: true
        // Size of the space in square meters
    },
    rooms: {
        type: Number,
        required: false
        // Number of rooms, applicable for apartments
    },
    marking: {
        type: String,
        required: false
        // Additional marking or identifier
    },
    ownerDni: {
        type: String,
        required: true
        // DNI of the owner (used as identifier)
    },
    description: {
        type: String,
        required: false
        // Optional description of the space
    },
    status: {
        type: String,
        enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
        default: "AVAILABLE"
        // Current status of the space
    },
    validationDocuments: {
        type: [String],
        required: false,
        default: []
        // Array of paths or URLs of validation documents
    },
    validationStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
        // Approval status for the space
    },
    monthlyEarnings: {
        type: Number,
        default: 0
        // Total monthly earnings from all active contracts
    },
    salePrice: {
        type: Number,
        required: false
        // Sale price (if applicable)
    },
    gallery: {
        type: [{ url: String, description: String }],
        required: false,
        default: []
        // Array of images with URLs and optional descriptions
    },
    // Location fields
    municipality: {
        type: String,
        required: true
        // Municipality where the space is located
    },
    city: {
        type: String,
        required: true
        // City where the space is located
    },
    address: {
        type: String,
        required: true
        // Full street address of the space
    },
    postalCode: {
        type: String,
        required: true
        // Postal code of the space location
    }
}, { timestamps: true });

module.exports = mongoose.model('Space', SpaceSchema);

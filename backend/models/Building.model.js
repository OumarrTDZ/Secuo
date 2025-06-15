const mongoose = require('mongoose');
// FINALLY I DONT USE THIS CLASS, I HAVE FUSIONED THE BUILD ATTRIBUTES TO THE SPACE MODEL
// Schema definition for building details linked to a space
const BuildingSchema = new mongoose.Schema({
    spaceId: {
        type: String,
        required: true
        // Reference ID for the associated space
    },
    postalCode: {
        type: String,
        required: true
        // Postal code of the building's location
    },
    city: {
        type: String,
        required: true
        // City where the building is located
    },
    address: {
        type: String,
        required: true
        // Full street address of the building
    },
    yearBuilt: {
        type: Number,
        required: false
        // Year the building was constructed (optional)
    }
}, { timestamps: true });

module.exports = mongoose.model('Building', BuildingSchema);

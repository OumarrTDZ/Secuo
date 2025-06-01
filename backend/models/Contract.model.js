const mongoose = require('mongoose');

/**
 * Contract schema representing rental or sale agreements
 *
 * Notes:
 * - In the future, support for multiple owners and tenants per contract may be added.
 * - Contract and space validation by admins is tracked via validationStatus.
 * - Contracts may have different statuses and payment statuses.
 */
const ContractSchema = new mongoose.Schema({
    spaceId: {
        type: String,
        required: true
        // Reference to the related space
    },
    ownerDni: {
        type: String,
        required: true
        // DNI (identifier) of the space owner
    },
    tenantDni: {
        type: String,
        required: true
        // DNI of the tenant signing the contract
    },
    contractType: {
        type: String,
        enum: ["RENT", "SALE"],
        required: true
        // Type of contract: rent or sale
    },
    startDate: {
        type: Date,
        required: true
        // Contract start date
    },
    endDate: {
        type: Date,
        required: false
        // Contract end date (only for rentals)
    },
    monthlyPayment: {
        type: Number,
        required: false
        // Monthly payment amount (only for rentals)
    },
    initialPayment: {
        type: Number,
        required: true
        // Initial payment amount
    },
    lateFee: {
        type: Number,
        required: false,
        default: 0
        // Late payment fee, default to 0
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "OVERDUE"],
        required: true,
        default: "PENDING"
        // Current payment status
    },
    contractStatus: {
        type: String,
        enum: ["ACTIVE", "EXPIRED"],
        required: true,
        default: "ACTIVE"
        // Contract lifecycle status
    },
    contractDocument: [{
        path: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        }
    }],
    validationStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
        // Admin approval status of the contract
    }
}, { timestamps: true });

module.exports = mongoose.model('Contract', ContractSchema);

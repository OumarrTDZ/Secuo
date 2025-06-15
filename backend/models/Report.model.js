const mongoose = require('mongoose');

/**
 * Schema for reporting issues related to a space by tenants
 */
const ReportSchema = new mongoose.Schema({
    spaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space',
        required: true
        // Reference to the space where the issue occurs
    },
    tenantDni: {
        type: String,
        required: true
        // DNI of the tenant reporting the issue
    },
    issueType: {
        type: String,
        enum: ["LEAK", "ANIMALS", "ELECTRICAL", "STRUCTURAL", "OTHER"],
        required: true
        // Category of the reported issue
    },
    description: {
        type: String,
        required: true
        // Detailed description of the issue
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        required: true,
        default: "MEDIUM"
        // Priority level for addressing the issue
    },
    status: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "RESOLVED"],
        required: true,
        default: "PENDING"
        // Current status of the report
    },
    attachments: {
        type: [String],
        required: false
        // Optional list of file URLs attached to the report
    },
    reportedAt: {
        type: Date,
        default: Date.now
        // Date and time when the issue was reported
    },
    resolvedAt: {
        type: Date,
        required: false
        // Date and time when the issue was resolved (if applicable)
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);

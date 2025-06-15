const Report = require('../models/Report.model');
const Space = require('../models/Space.model');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');

// Create a new report with optional attachments
const createReport = async (req, res) => {
    try {
        const { description, priority, issueType, spaceId } = req.body;
        console.log('Creating report:', { description, priority, issueType, spaceId });

        // Validate spaceId format
        if (!mongoose.Types.ObjectId.isValid(spaceId)) {
            console.log('Invalid spaceId format:', spaceId);
            return res.status(400).json({ error: 'Invalid space ID format' });
        }

        // Find the space
        const space = await Space.findById(spaceId);
        if (!space) {
            console.log('Space not found:', spaceId);
            return res.status(404).json({ error: 'Space not found' });
        }

        // Check if the user has an active contract for this space
        const Contract = require('../models/Contract.model');
        const activeContract = await Contract.findOne({
            spaceId: spaceId,
            tenantDni: req.user.dni,
            contractStatus: 'ACTIVE'
        });

        if (!activeContract) {
            console.log('No active contract found for tenant:', req.user.dni);
            return res.status(403).json({
                error: 'You can only create reports for spaces where you have an active contract'
            });
        }

        // Create and save the report
        const report = new Report({
            description,
            priority,
            issueType,
            spaceId: space._id,
            tenantDni: req.user.dni
        });

        await report.save();

        // Populate space information before responding
        await report.populate('spaceId', 'spaceType address');

        // Create notification for the owner
        const notification = new Notification({
            recipientDni: space.ownerDni,
            title: 'New Report Received',
            message: `A report has been received for space ${space.spaceType} - ${space.address}. Priority: ${priority}`,
            type: 'NEW_REPORT',
            relatedId: report._id,
            read: false
        });

        await notification.save();

        // Emit real-time notification
        const io = req.app.get('io');
        if (io) {
            io.to(space.ownerDni).emit('newNotification');
        }

        console.log('Report created:', report._id);
        res.status(201).json({ message: 'Report created successfully', report });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Upload files to an existing report
const uploadFilesToReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const spaceId = req.headers['x-space-id'];

        if (!spaceId) {
            return res.status(400).json({ error: 'Space ID is required' });
        }

        const report = await Report.findById(reportId);
        if (!report) return res.status(404).json({ error: 'Report not found' });

        // Ensure files were uploaded
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({ error: 'No files were uploaded' });
        }

        // Map file paths
        const attachments = req.files.map(file =>
            `/uploads/${spaceId}/reports/${reportId}/${file.filename}`
        );

        // Update report
        report.attachments = attachments;
        await report.save();

        res.json({
            message: 'Report files uploaded successfully',
            report,
            attachments
        });
    } catch (error) {
        console.error('Error uploading report files:', error);
        res.status(500).json({
            error: 'Failed to upload images',
            details: error.message
        });
    }
};

// Check if a user is the owner of a space
const isOwner = async (ownerDni, spaceId) => {
    if (!isValidObjectId(spaceId)) return false;
    const space = await Space.findById(spaceId);
    return space && space.ownerDni === ownerDni;
};

// Check if a user is the tenant of a space
const isTenant = async (tenantDni, spaceId) => {
    if (!isValidObjectId(spaceId)) return false;
    const space = await Space.findById(spaceId);
    if (!space) return false;
    return space.tenantDni === tenantDni;
};

// Get all reports (admins see all, owners see reports for their spaces)
const getReports = async (req, res) => {
    try {
        // Force preference for testing
        console.log('Forcing req.user.preference = "OWNER"');
        req.user.preference = 'OWNER';

        console.log('Getting reports for user:', req.user);
        let reports;

        if (req.user.preference === "OWNER") {
            console.log('Finding spaces for owner:', req.user.dni);
            const ownedSpaces = await Space.find({ ownerDni: req.user.dni }).select('_id');
            const spaceIds = ownedSpaces.map(space => space._id);
            console.log('Found spaces:', spaceIds);

            reports = await Report.find({ spaceId: { $in: spaceIds } })
                .populate('spaceId', 'spaceType address')
                .sort({ createdAt: -1 });
        } else {
            reports = [];
        }

        console.log("===============================");
        console.log('Reports found:', reports.length);
        console.log('User -> :', req.user);
        console.log("===============================");
        res.json(reports);
    } catch (error) {
        console.error("Error getting reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get report by ID (accessible only to tenant, owner, or admin)
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID format" });

        const report = await Report.findById(id);
        if (!report) return res.status(404).json({ error: "Report not found" });

        const space = await Space.findById(report.spaceId);
        if (!space) return res.status(404).json({ error: "Space not found" });

        if (
            req.user.role !== "ADMIN" &&
            req.user.dni !== report.tenantDni &&
            req.user.dni !== space.ownerDni
        ) {
            return res.status(403).json({ error: "Unauthorized: Only tenant, owner, or admin can view the report" });
        }

        res.json(report);
    } catch (error) {
        console.error("Error getting report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update report details (only tenant can edit)
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID format" });

        const report = await Report.findById(id);
        if (!report) return res.status(404).json({ error: "Report not found" });

        if (req.user.dni !== report.tenantDni) {
            return res.status(403).json({ error: "Unauthorized: Only the tenant can edit the report" });
        }

        Object.assign(report, req.body);
        await report.save();

        res.json({ message: "Report updated successfully", report });
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all reports submitted by the current tenant
const getReportsByTenant = async (req, res) => {
    try {
        console.log('Getting reports for tenant:', req.user.dni);
        const reports = await Report.find({ tenantDni: req.user.dni })
            .populate('spaceId', 'spaceType address')
            .sort({ createdAt: -1 });

        console.log('Found tenant reports:', reports.length);
        res.json(reports);
    } catch (error) {
        console.error("Error getting tenant's reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update the status of a report (owners/admins)
const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const report = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('spaceId');

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        const space = await Space.findById(report.spaceId);
        if (!space) {
            return res.status(404).json({ error: "Space not found" });
        }

        // Define message based on status
        const statusMessages = {
            'PENDING': 'marked as pending',
            'IN_PROGRESS': 'marked as in progress',
            'RESOLVED': 'marked as resolved'
        };

        const notificationMessage = `Report for ${space.spaceType} at ${space.address} has been ${statusMessages[status]}`;

        // Create notifications for both tenant and owner
        const notifications = [
            new Notification({
                recipientDni: report.tenantDni,
                title: 'Report Status Updated',
                message: notificationMessage,
                type: 'REPORT_STATUS_UPDATED',
                relatedId: report._id,
                read: false
            }),
            new Notification({
                recipientDni: space.ownerDni,
                title: 'Report Status Updated',
                message: notificationMessage,
                type: 'REPORT_STATUS_UPDATED',
                relatedId: report._id,
                read: false
            })
        ];

        await Promise.all(notifications.map(notification => notification.save()));

        // Emit real-time updates
        const io = req.app.get('io');
        if (io) {
            io.to(report.tenantDni).emit('newNotification');
            io.to(space.ownerDni).emit('newNotification');
        }

        res.json(report);
    } catch (error) {
        console.error("Error updating report status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    createReport,
    uploadFilesToReport,
    getReports,
    getReportById,
    updateReport,
    isOwner,
    isTenant,
    getReportsByTenant,
    updateReportStatus
};

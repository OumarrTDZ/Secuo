const Report = require('../models/Report.model');
const Space = require('../models/Space.model');
const { isValidObjectId } = require('mongoose');

// Check if user is owner of the space
const isOwner = async (ownerDni, spaceId) => {
    if (!isValidObjectId(spaceId)) return false;
    const space = await Space.findById(spaceId);
    return space && space.ownerDni === ownerDni;
};

// Check if user is tenant of the space
const isTenant = async (tenantDni, spaceId) => {
    if (!isValidObjectId(spaceId)) return false;
    const space = await Space.findById(spaceId);
    if (!space) return false;
    // Assuming Space has a tenantDni field
    return space.tenantDni === tenantDni;
};

// Get all reports (Admin sees all, owners see only their spaces)
const getReports = async (req, res) => {
    try {
        let reports;

        if (req.user.role === "ADMIN") {
            reports = await Report.find();
        } else {
            const ownedSpaces = await Space.find({ ownerDni: req.user.dni }).select('_id');
            const spaceIds = ownedSpaces.map(space => space._id);
            reports = await Report.find({ spaceId: { $in: spaceIds } });
        }

        res.json(reports);
    } catch (error) {
        console.error("Error getting reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get report by ID (only tenant, owner or admin)
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

// Update report (only tenant can update)
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

module.exports = { getReports, getReportById, updateReport, isOwner, isTenant };

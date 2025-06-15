const express = require('express');
const { authUser } = require('../middleware/authMiddleware');
const { uploadReportImages } = require('../utils/uploadReports');
const {
    getReports,
    getReportById,
    updateReport,
    createReport,
    uploadFilesToReport,
    getReportsByTenant,
    updateReportStatus
} = require('../controllers/report.controller');

const router = express.Router();

// Create a new report with optional image attachments
router.post('/', authUser, createReport);

// Upload images to an existing report
router.post(
    '/:reportId/images',
    authUser,
    uploadReportImages.array('attachments', 5),
    uploadFilesToReport
);

// Get all reports: Admins see all, owners see reports of their spaces
router.get('/', authUser, getReports);

// Get reports created by the logged-in tenant
router.get('/my-reports', authUser, getReportsByTenant);

// Get a specific report: Only the reporting tenant, the space owner, or an admin can view it
router.get('/:id', authUser, getReportById);

// Update a report: Only the tenant who created it can update
router.patch('/:id', authUser, updateReport);

// Update report status
router.patch('/:id/status', authUser, updateReportStatus);

module.exports = router;

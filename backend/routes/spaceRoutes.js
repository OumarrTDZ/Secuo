const express = require('express');
const { authUser, authAdmin } = require('../middleware/authMiddleware');
const {
    createSpace,
    getSpaces,
    getSpaceById,
    updateSpace,
    deleteSpace,
    validateSpace,
    uploadFilesToSpace,
    getPendingSpaces
} = require('../controllers/space.controller');
const { uploadSpaceFiles } = require('../utils/uploadSpaces');

const router = express.Router();

// Create a new space (owners only)
router.post('/', authUser, createSpace);

// Upload files for a space (gallery images, validation document)
router.post(
    '/:spaceId/upload',
    authUser,
    uploadSpaceFiles.fields([
        { name: 'gallery', maxCount: 10 },
        { name: 'validationDocument', maxCount: 1 }
    ]),
    uploadFilesToSpace
);

// Get all spaces (public)
router.get('/', getSpaces);

// Get pending spaces for validation (admin only)
router.get('/pending', authAdmin, getPendingSpaces);

// Get space details by ID (public)
router.get('/:id', getSpaceById);

// Update space details (owners only)
router.patch('/:id', authUser, updateSpace);

// Validate space (admin only)
router.patch('/:id/validate', authAdmin, validateSpace);

// Delete space (owners only)
router.delete('/:id', authUser, deleteSpace);

module.exports = router;

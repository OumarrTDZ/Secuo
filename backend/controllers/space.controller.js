const Space = require('../models/Space.model');
const Contract = require('../models/Contract.model');
const { isValidObjectId } = require('mongoose');

/**
 * Create a new space (only owners allowed)
 */
const createSpace = async (req, res) => {
    try {
        const space = new Space({ ...req.body, ownerDni: req.user.dni });
        await space.save();
        res.status(201).json({ message: "Space created successfully", space });
    } catch (error) {
        console.error("Error creating space:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get all spaces
 */
const getSpaces = async (req, res) => {
    try {
        const spaces = await Space.find();
        res.json(spaces);
    } catch (error) {
        console.error("Error getting spaces:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get a space by ID including associated contracts
 */
const getSpaceById = async (req, res) => {
    try {
        console.log('1. Backend: Recibida petición getSpaceById');
        console.log('2. Backend: Parámetros:', {
            id: req.params.id,
            headers: req.headers,
            user: req.user
        });

        const { id } = req.params;
        console.log('3. Backend: Buscando espacio con ID:', id);
        const space = await Space.findById(id);
        
        if (!space) {
            console.log('4. Backend: Espacio no encontrado');
            return res.status(404).json({ error: "Space not found" });
        }
        
        console.log('5. Backend: Espacio encontrado:', space);
        console.log('6. Backend: Buscando contratos para el espacio');
        const contracts = await Contract.find({ spaceId: id });
        console.log('7. Backend: Contratos encontrados:', contracts.length);

        console.log('8. Backend: Enviando respuesta');
        res.json({ space, contracts });
    } catch (error) {
        console.error('9. Backend: Error en getSpaceById:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Update a space (only owner allowed)
 */
const updateSpace = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const space = await Space.findById(id);
        if (!space) return res.status(404).json({ error: "Space not found" });

        if (req.user.dni !== space.ownerDni) {
            return res.status(403).json({ error: "Unauthorized: Only the owner can modify this space" });
        }

        Object.assign(space, req.body);
        await space.save();
        res.json({ message: "Space updated successfully", space });

    } catch (error) {
        console.error("Error updating space:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Delete a space (only owner allowed)
 */
const deleteSpace = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const space = await Space.findById(id);
        if (!space) return res.status(404).json({ error: "Space not found" });

        if (req.user.dni !== space.ownerDni) {
            return res.status(403).json({ error: "Unauthorized: Only the owner can delete this space" });
        }

        await Space.findByIdAndDelete(id);
        res.json({ message: "Space deleted successfully" });

    } catch (error) {
        console.error("Error deleting space:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Approve or reject a space (admin action)
 */
const validateSpace = async (req, res) => {
    try {
        const { id } = req.params;
        const { validationStatus } = req.body;

        const space = await Space.findById(id);
        if (!space) {
            return res.status(404).json({ error: 'Space not found' });
        }

        space.validationStatus = validationStatus;
        await space.save();

        // Send notification to the space owner
        const io = req.app.get('io');
        if (io) {
            const title = validationStatus === 'APPROVED' ? 'Space Approved!' : 'Space Rejected';
            const message = validationStatus === 'APPROVED' 
                ? `Your space ${space.spaceType} has been approved.`
                : `Your space ${space.spaceType} has been rejected.`;
            
            await io.notifyUser(
                space.ownerDni,
                validationStatus === 'APPROVED' ? 'SPACE_APPROVED' : 'SPACE_REJECTED',
                title,
                message,
                space._id
            );
        }

        res.json({ message: 'Space validation status updated successfully', space });
    } catch (error) {
        console.error('Error validating space:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get all spaces with pending validation (admin only)
 */
const getPendingSpaces = async (req, res) => {
    try {
        const spaces = await Space.find({ validationStatus: "PENDING" });
        res.json(spaces);
    } catch (error) {
        console.error("Error getting pending spaces:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

/**
 * Upload files (gallery and validation documents) for a space
 */
const uploadFilesToSpace = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const space = await Space.findById(spaceId);
        if (!space) return res.status(404).json({ error: 'Space not found' });

        if (req.files?.gallery) {
            space.gallery = req.files.gallery.map(file => ({
                url: `/uploads/spaces/${spaceId}/gallery/${file.filename}`,
                description: ''
            }));
        }

        if (req.files?.validationDocuments) {
            space.validationDocuments = req.files.validationDocuments.map(file => 
                `/uploads/spaces/${spaceId}/validationDocument/${file.filename}`
            );
        }

        await space.validate();
        await space.save();
        res.json({ message: 'Files uploaded successfully', space });
    } catch (err) {
        console.error("Error saving space with files:", err);
        res.status(500).json({ error: 'Error saving space with uploaded files' });
    }
};

module.exports = {
    createSpace,
    getSpaces,
    getSpaceById,
    updateSpace,
    deleteSpace,
    validateSpace,
    getPendingSpaces,
    uploadFilesToSpace
};

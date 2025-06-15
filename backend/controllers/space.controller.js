const Space = require('../models/Space.model');
const Contract = require('../models/Contract.model');
const User = require('../models/User.model');
const { isValidObjectId } = require('mongoose');

// Create a new space (only owners allowed)
const createSpace = async (req, res) => {
    try {
        // Extract location fields from request body
        const { municipality, city, address, postalCode, ...otherFields } = req.body;

        console.log('Location fields:', { municipality, city, address, postalCode });
        console.log('Other fields:', otherFields);

        // Create space with all fields including location and initialize monthlyEarnings to 0
        const space = new Space({
            ...otherFields,
            municipality,
            city,
            address,
            postalCode,
            monthlyEarnings: 0,
            ownerDni: req.user.dni
        });

        await space.save();
        res.status(201).json({ message: "Space created successfully", space });
    } catch (error) {
        console.error("Error creating space:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all spaces
const getSpaces = async (req, res) => {
    try {
        const spaces = await Space.find();
        res.json(spaces);
    } catch (error) {
        console.error("Error getting spaces:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get a space by ID including associated contracts and tenant info
const getSpaceById = async (req, res) => {
    try {
        console.log('Request received: getSpaceById');
        console.log('Request params:', {
            id: req.params.id,
            headers: req.headers,
            user: req.user
        });

        const { id } = req.params;
        const space = await Space.findById(id);

        if (!space) {
            console.log('Space not found');
            return res.status(404).json({ error: "Space not found" });
        }

        // Get contracts and enrich them with tenant names
        const contracts = await Contract.find({ spaceId: id });
        const contractsWithTenants = await Promise.all(contracts.map(async (contract) => {
            const tenant = await User.findOne({ dni: contract.tenantDni }).select('firstName lastName');
            const contractObj = contract.toObject();
            contractObj.tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
            return contractObj;
        }));

        res.json({ space, contracts: contractsWithTenants });
    } catch (error) {
        console.error('Error in getSpaceById:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update a space (only owner allowed)
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

        // Extract location fields from request body
        const { municipality, city, address, postalCode, ...otherFields } = req.body;

        // Update fields and reset validation status
        Object.assign(space, {
            ...otherFields,
            municipality,
            city,
            address,
            postalCode,
            validationStatus: "PENDING"
        });

        await space.save();

        // Notify admins that the space was updated
        const io = req.app.get('io');
        if (io) {
            try {
                const notificationMessage = `Space [${space._id}] has been updated and requires validation.`;
                const notificationType = 'SPACE_UPDATED';
                const notificationTitle = 'Space Updated - Validation Required';

                await io.notifyAdmins(
                    notificationType,
                    notificationTitle,
                    notificationMessage,
                    space._id
                );
            } catch (notificationError) {
                console.error('Error sending space update notification:', notificationError);
            }
        }

        res.json({ message: "Space updated successfully. Waiting for admin validation.", space });

    } catch (error) {
        console.error("Error updating space:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a space (only owner allowed)
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

// Approve or reject a space (admin only)
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

        // Notify owner about validation result
        const io = req.app.get('io');
        if (io) {
            const title = validationStatus === 'APPROVED' ? 'Space Approved!' : 'Space Rejected';
            const message = validationStatus === 'APPROVED'
                ? `Your space [${space._id}] has been approved.`
                : `Your space [${space._id}] has been rejected. Please review your documents and property information, make any necessary corrections, and try submitting again.`;

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

// Get all spaces that are pending validation (admin only)
const getPendingSpaces = async (req, res) => {
    try {
        const spaces = await Space.find({ validationStatus: "PENDING" });
        res.json(spaces);
    } catch (error) {
        console.error("Error getting pending spaces:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Upload files (gallery and validation documents) for a space
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

// Update monthly earnings for a space based on its active contracts
const updateMonthlyEarnings = async (spaceId) => {
    try {
        const activeContracts = await Contract.find({
            spaceId: spaceId,
            contractStatus: 'ACTIVE'
        });

        const totalEarnings = activeContracts.reduce((sum, contract) => {
            return sum + (contract.monthlyPayment || 0);
        }, 0);

        await Space.findByIdAndUpdate(spaceId, {
            monthlyEarnings: totalEarnings
        });

        return totalEarnings;
    } catch (error) {
        console.error('Error updating monthly earnings:', error);
        throw error;
    }
};

// Get a specific space and its contracts, update earnings
const getSpace = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid space ID format" });
        }

        const space = await Space.findById(id);
        if (!space) {
            return res.status(404).json({ error: "Space not found" });
        }

        const contracts = await Contract.find({ spaceId: id });

        await updateMonthlyEarnings(id);
        const updatedSpace = await Space.findById(id);

        res.json({ space: updatedSpace, contracts });
    } catch (error) {
        console.error('Error getting space:', error);
        res.status(500).json({ error: error.message });
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
    uploadFilesToSpace,
    getSpace
};

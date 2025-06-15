const Contract = require('../models/Contract.model');
const Space = require('../models/Space.model');
const { isValidObjectId } = require('mongoose');
const path = require('path');
const fs = require('fs');

// Create a new contract (Owner or Admin)
const createContract = async (req, res) => {
    try {
        const {
            spaceId,
            tenantDni,
            contractType,
            startDate,
            endDate,
            monthlyPayment,
            initialPayment,
            contractDocument
        } = req.body;

        // Check if the space exists
        const space = await Space.findById(spaceId);
        if (!space) {
            return res.status(404).json({ error: "Space not found" });
        }

        // Only ADMIN or the space owner can create contracts
        if (req.user.role !== "ADMIN" && req.user.dni !== space.ownerDni) {
            return res.status(403).json({ error: "Unauthorized: Only the owner or admin can create contracts" });
        }

        // Prevent duplicate contracts: check if a contract already exists
        // for the same tenant and space, and is still active or upcoming
        const existingContract = await Contract.findOne({
            spaceId,
            tenantDni,
            endDate: { $gte: new Date() } // optional: only block active or future contracts
        });

        if (existingContract) {
            return res.status(400).json({ error: "This tenant already has an active contract for this space" });
        }

        // Create and save the contract
        const contract = new Contract({
            spaceId,
            ownerDni: req.user.dni,
            tenantDni,
            contractType,
            startDate,
            endDate,
            monthlyPayment,
            initialPayment,
            contractDocument
        });

        await contract.save();

        // Send notification to tenant about new contract
        const io = req.app.get('io');
        if (io) {
            try {
                const spaceIdentifier = `${space.spaceType} at ${space.address}`;
                const notificationMessage = `NEW CONTRACT - You have been assigned a new contract for the ${spaceIdentifier} (Contract ID: ${contract._id})`;
                const notificationType = 'CONTRACT_CREATED';
                const notificationTitle = 'New Contract Assigned';

                // Notify tenant
                await io.notifyUser(
                    tenantDni,
                    notificationType,
                    notificationTitle,
                    notificationMessage,
                    contract._id
                );
            } catch (notificationError) {
                console.error('Error sending new contract notification:', notificationError);
                // Continue even if notification fails
            }
        }

        res.status(201).json({ message: "Contract created successfully", contract });
    } catch (error) {
        console.error("Error creating contract:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Get contract by ID (Owner, tenant or Admin)
const getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const contract = await Contract.findById(id);
        if (!contract) return res.status(404).json({ error: "Contract not found" });

        if (req.user.role !== "ADMIN" && req.user.dni !== contract.ownerDni && req.user.dni !== contract.tenantDni) {
            return res.status(403).json({ error: "Unauthorized: Only the owner, tenant or admin can view this contract" });
        }

        res.json(contract);
    } catch (error) {
        console.error("Error getting contract:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update contract details (Owner or Admin)
const updateContract = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const contract = await Contract.findById(id);
        if (!contract) {
            return res.status(404).json({ error: "Contract not found" });
        }

        // Only owner or admin can update contract
        if (req.user.role !== "ADMIN" && req.user.dni !== contract.ownerDni) {
            return res.status(403).json({ error: "Unauthorized: Only the owner or admin can modify this contract" });
        }

        // Update contract fields
        Object.keys(updates).forEach(key => {
            if (key !== '_id' && key !== 'ownerDni' && key !== 'spaceId') {
                console.log(`Updating field ${key} from ${contract[key]} to ${updates[key]}`);
                contract[key] = updates[key];
            }
        });

        // Set validation status back to pending if the user is not an admin
        if (req.user.role !== "ADMIN") {
            contract.validationStatus = "PENDING";
        }

        // If contract status is being updated to EXPIRED or TERMINATED
        if (updates.contractStatus === 'EXPIRED' || updates.contractStatus === 'TERMINATED') {
            console.log('Contract status changing to:', updates.contractStatus);
            
            try {
                // Update the space's monthly earnings
                const space = await Space.findById(contract.spaceId);
                if (space) {
                    const activeContracts = await Contract.find({
                        spaceId: space._id,
                        contractStatus: 'ACTIVE'
                    });

                    // Calculate new monthly earnings (excluding this contract)
                    const monthlyEarnings = activeContracts
                        .filter(c => c._id.toString() !== id)
                        .reduce((sum, c) => sum + (c.monthlyPayment || 0), 0);

                    console.log('Updating space monthly earnings to:', monthlyEarnings);
                    
                    // Update space
                    await Space.findByIdAndUpdate(space._id, { monthlyEarnings });
                } else {
                    console.error('Space not found for contract:', contract.spaceId);
                }
            } catch (spaceError) {
                console.error('Error updating space monthly earnings:', spaceError);
                // Continue with contract update even if space update fails
            }
        }

        // Validate the contract before saving
        await contract.validate();

        // Save the updated contract
        await contract.save();
        console.log('Contract saved. New status:', contract.contractStatus);

        // Send notifications for contract updates
        const io = req.app.get('io');
        if (io) {
            try {
                let notificationMessage = '';
                let notificationType = '';
                let notificationTitle = '';

                // Get space details for better messages
                const space = await Space.findById(contract.spaceId);
                const spaceIdentifier = space ? 
                    `${space.spaceType} at ${space.address}` : 
                    'space';

                // If updated by owner, notify admin about required validation
                if (req.user.role !== "ADMIN") {
                    notificationMessage = `Contract [${contract._id}] for ${spaceIdentifier} has been updated and requires validation.`;
                    notificationType = 'CONTRACT_UPDATED';
                    notificationTitle = 'Contract Updated - Validation Required';

                    // Notify admins
                    await io.notifyAdmins(
                        notificationType,
                        notificationTitle,
                        notificationMessage,
                        contract._id
                    );
                } else {
                    // Create notification based on contract status
                    const statusMessages = {
                        'ACTIVE': 'ACTIVE',
                        'EXPIRED': 'EXPIRED',
                        'TERMINATED': 'TERMINATED'
                    };

                    const statusText = statusMessages[updates.contractStatus] || 'UPDATED';
                    notificationMessage = `${statusText} - Your contract for the ${spaceIdentifier} has been updated (Contract ID: ${contract._id})`;
                    notificationType = 'CONTRACT_' + (updates.contractStatus || 'UPDATED');
                    notificationTitle = `Contract ${statusText}`;

                    // Notify owner and tenant
                    await io.notifyUser(
                        contract.ownerDni,
                        notificationType,
                        notificationTitle,
                        notificationMessage,
                        contract._id
                    );

                    await io.notifyUser(
                        contract.tenantDni,
                        notificationType,
                        notificationTitle,
                        notificationMessage,
                        contract._id
                    );
                }
            } catch (notificationError) {
                console.error('Error sending contract update notification:', notificationError);
                // Continue even if notification fails
            }
        }

        const message = req.user.role !== "ADMIN" 
            ? "Contract updated successfully. Waiting for admin validation."
            : "Contract updated successfully.";

        res.json({ message, contract });
    } catch (error) {
        console.error("Error updating contract:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a contract (Owner or Admin)
const deleteContract = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const contract = await Contract.findById(id);
        if (!contract) return res.status(404).json({ error: "Contract not found" });

        if (req.user.role !== "ADMIN" && req.user.dni !== contract.ownerDni) {
            return res.status(403).json({ error: "Unauthorized: Only the owner or admin can delete this contract" });
        }

        // Get space details before deleting the contract
        const space = await Space.findById(contract.spaceId);
        const spaceIdentifier = space ? 
            `${space.spaceType} at ${space.address}` : 
            'space';

        await Contract.findByIdAndDelete(id);

        // Send notification to both owner and tenant
        const io = req.app.get('io');
        if (io) {
            try {
                const notificationMessage = `DELETED - Contract for the ${spaceIdentifier} has been deleted (Contract ID: ${contract._id})`;
                const notificationType = 'CONTRACT_DELETED';
                const notificationTitle = 'Contract Deleted';

                // Notify tenant
                await io.notifyUser(
                    contract.tenantDni,
                    notificationType,
                    notificationTitle,
                    notificationMessage,
                    contract._id
                );

                // Notify owner (if not the one who deleted it)
                if (req.user.dni !== contract.ownerDni) {
                    await io.notifyUser(
                        contract.ownerDni,
                        notificationType,
                        notificationTitle,
                        notificationMessage,
                        contract._id
                    );
                }
            } catch (notificationError) {
                console.error('Error sending delete notifications:', notificationError);
                // Continue even if notifications fail
            }
        }

        res.json({ message: "Contract deleted successfully" });
    } catch (error) {
        console.error("Error deleting contract:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all contracts by owner
const getContractsByOwner = async (req, res) => {
    try {
        const contracts = await Contract.find({ ownerDni: req.user.dni });
        res.json(contracts);
    } catch (error) {
        console.error("Error getting owner's contracts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all contracts by tenant
const getContractsByTenant = async (req, res) => {
    try {
        const contracts = await Contract.find({ tenantDni: req.user.dni });
        res.json(contracts);
    } catch (error) {
        console.error("Error getting tenant's contracts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get contracts pending validation
const getPendingContracts = async (req, res) => {
    try {
        const contracts = await Contract.find({ validationStatus: "PENDING" });
        res.json(contracts);
    } catch (error) {
        console.error("Error getting pending contracts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Approve or reject a contract
const validateContract = async (req, res) => {
    try {
        const { id } = req.params;
        const { validationStatus } = req.body;

        const contract = await Contract.findById(id);
        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        contract.validationStatus = validationStatus;
        await contract.save();

        // Send notification to both owner and tenant
        const io = req.app.get('io');
        if (io) {
            const title = validationStatus === 'APPROVED' ? 'Contract Approved!' : 'Contract Rejected';
            const message = validationStatus === 'APPROVED' 
                ? `Your contract [${contract._id}] has been approved.`
                : `Your contract [${contract._id}] has been rejected. Please review all contract terms and documents, ensure everything is correct, and try submitting again.`;
            
            // Notify owner
            await io.notifyUser(
                contract.ownerDni,
                validationStatus === 'APPROVED' ? 'CONTRACT_APPROVED' : 'CONTRACT_REJECTED',
                title,
                message,
                contract._id
            );

            // Notify tenant
            await io.notifyUser(
                contract.tenantDni,
                validationStatus === 'APPROVED' ? 'CONTRACT_APPROVED' : 'CONTRACT_REJECTED',
                title,
                message,
                contract._id
            );
        }

        res.json({ message: 'Contract validation status updated successfully', contract });
    } catch (error) {
        console.error('Error validating contract:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

 // Upload contract document images to /uploads/contracts/{contractId}
const uploadFilesToContract = async (req, res) => {
    try {
        const { contractId } = req.params;

        const contract = await Contract.findById(contractId);
        if (!contract) return res.status(404).json({ error: 'Contract not found' });

        if (req.files?.contractDocument) {
            contract.contractDocument = req.files.contractDocument.map(file => ({
                path: `/uploads/contracts/${contractId}/contractDocument/${file.filename}`,
                originalName: file.originalname
            }));
        }

        await contract.validate();
        await contract.save();

        res.json({ message: 'Contract documents uploaded successfully', contract });
    } catch (error) {
        console.error("Error uploading contract documents:", error);
        res.status(500).json({ error: 'Error saving contract with uploaded documents' });
    }
};

module.exports = {
    uploadFilesToContract,
    createContract,
    getContractById,
    updateContract,
    deleteContract,
    getContractsByOwner,
    getContractsByTenant,
    getPendingContracts,
    validateContract
};

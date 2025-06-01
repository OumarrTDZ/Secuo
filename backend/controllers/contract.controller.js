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

        // If there's a document to delete
        if (updates.documentToDelete) {
            const contract = await Contract.findById(id);
            if (!contract) {
                return res.status(404).json({ message: 'Contract not found' });
            }

            // Find the document index
            const documentIndex = contract.contractDocument.findIndex(doc => 
                doc.includes(updates.documentToDelete)
            );

            if (documentIndex === -1) {
                return res.status(404).json({ message: 'Document not found' });
            }

            // Get the document path and remove from array
            const documentPath = contract.contractDocument[documentIndex];
            contract.contractDocument.splice(documentIndex, 1);

            // Delete the physical file
            const filePath = path.join(__dirname, '..', documentPath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Save the contract
            await contract.save();
            return res.json({ message: 'Document deleted successfully' });
        }

        // Regular contract update
        const contract = await Contract.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        res.json(contract);
    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ message: 'Error updating contract' });
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

        await Contract.findByIdAndDelete(id);
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
                ? `Your contract has been approved.`
                : `Your contract has been rejected.`;
            
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

/**
 * Upload contract document images to /uploads/contracts/{contractId}
 */
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

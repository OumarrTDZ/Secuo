const Contract = require('../models/Contract.model');
const Space = require('../models/Space.model');
const { isValidObjectId } = require('mongoose');
const path = require('path');

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
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const contract = await Contract.findById(id);
        if (!contract) return res.status(404).json({ error: "Contract not found" });

        if (req.user.role !== "ADMIN" && req.user.dni !== contract.ownerDni) {
            return res.status(403).json({ error: "Unauthorized: Only the owner or admin can modify this contract" });
        }

        const { contractType, startDate, endDate, monthlyPayment, contractStatus } = req.body;

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ error: "Start date must be before end date" });
        }

        if (monthlyPayment !== undefined && monthlyPayment < 0) {
            return res.status(400).json({ error: "Monthly payment must be positive" });
        }

        const allowedStatuses = ["ACTIVE", "INACTIVE", "TERMINATED"];
        if (contractStatus && !allowedStatuses.includes(contractStatus)) {
            return res.status(400).json({ error: "Invalid contract status" });
        }

        const allowedFields = ['contractType', 'startDate', 'endDate', 'monthlyPayment', 'contractStatus'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                contract[field] = req.body[field];
            }
        });

        await contract.save();
        res.json({ message: "Contract updated successfully", contract });

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
        const contract = await Contract.findById(req.params.id);
        if (!contract) return res.status(404).json({ error: "Contract not found." });

        contract.validationStatus = req.body.validationStatus;
        await contract.save();

        res.json({
            message: `Contract ${req.body.validationStatus === "APPROVED" ? "approved" : "rejected"}`,
            contract
        });
    } catch (error) {
        console.error("Error validating contract:", error);
        res.status(500).json({ error: "Internal server error" });
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
            contract.contractDocument = req.files.contractDocument.map(file =>
                `/uploads/contracts/${contractId}/contractDocument/${file.filename}`
            );
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

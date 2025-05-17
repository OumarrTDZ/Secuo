const express = require('express');
const { authUser, authAdmin } = require('../middleware/authMiddleware');
const {
    createContract,
    getContractById,
    updateContract,
    deleteContract,
    validateContract,
    getContractsByOwner,
    getContractsByTenant,
    getPendingContracts
} = require('../controllers/contract.controller');

const router = express.Router();

// Create contract (owner or admin)
router.post('/', authUser, createContract);

// Get contracts for the logged-in owner
router.get('/owner', authUser, getContractsByOwner);

// Get contracts for the logged-in tenant
router.get('/tenant', authUser, getContractsByTenant);

// Get pending contracts (admin only)
router.get('/pending', authAdmin, getPendingContracts);

// Get contract by ID (owner, tenant or admin)
router.get('/:id', authUser, getContractById);

// Update contract by ID (owner or admin)
router.patch('/:id', authUser, updateContract);

// Validate contract (admin only)
router.patch('/:id/validate', authAdmin, validateContract);

// Delete contract by ID (owner or admin)
router.delete('/:id', authUser, deleteContract);

module.exports = router;

const express = require('express');
const {
    createBuilding,
    getBuildings,
    getBuildingById,
    updateBuilding,
    deleteBuilding,
    getSpacesByBuilding
} = require('../controllers/building.controller');

const router = express.Router();

// Create a new building
router.post('/', createBuilding);

// Get all buildings
router.get('/', getBuildings);

// Get building by ID
router.get('/:id', getBuildingById);

// Update building details
router.patch('/:id', updateBuilding);

// Delete a building
router.delete('/:id', deleteBuilding);

// Get all spaces within a specific building
router.get('/:id/spaces', getSpacesByBuilding);

module.exports = router;

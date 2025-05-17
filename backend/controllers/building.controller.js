const Building = require('../models/Building.model');
const Space = require('../models/Space.model');
const { isValidObjectId } = require('mongoose');

// Create a new building
const createBuilding = async (req, res) => {
    try {
        const building = new Building(req.body);
        await building.save();
        res.status(201).json({ message: "Building created successfully", building });
    } catch (error) {
        console.error("Error creating building:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get all buildings
const getBuildings = async (req, res) => {
    try {
        const buildings = await Building.find();
        res.json(buildings);
    } catch (error) {
        console.error("Error getting buildings:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get building by ID
const getBuildingById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format." });
        }

        const building = await Building.findById(id);
        if (!building) return res.status(404).json({ error: "Building not found." });

        res.json(building);
    } catch (error) {
        console.error("Error getting building:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Update building
const updateBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format." });
        }

        const updates = req.body;
        const building = await Building.findByIdAndUpdate(id, updates, { new: true });

        if (!building) {
            return res.status(404).json({ error: "Building not found." });
        }

        res.json({ message: "Building updated successfully", building });
    } catch (error) {
        console.error("Error updating building:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Delete building
const deleteBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format." });
        }

        const building = await Building.findByIdAndDelete(id);
        if (!building) return res.status(404).json({ error: "Building not found." });

        res.json({ message: "Building deleted successfully." });
    } catch (error) {
        console.error("Error deleting building:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get all spaces by building ID
const getSpacesByBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format." });
        }

        const building = await Building.findById(id);
        if (!building) return res.status(404).json({ error: "Building not found." });

        const spaces = await Space.find({ spaceId: id });
        res.json(spaces);
    } catch (error) {
        console.error("Error getting spaces by building:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    createBuilding,
    getBuildings,
    getBuildingById,
    updateBuilding,
    deleteBuilding,
    getSpacesByBuilding
};

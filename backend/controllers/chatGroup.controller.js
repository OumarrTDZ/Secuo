const ChatGroup = require('../models/ChatGroup.model');
const User = require('../models/User.model');
const { isValidObjectId } = require('mongoose');

// Create a new chat (private or group)
const createChatGroup = async (req, res) => {
    try {
        const { members, groupName, groupImage, description } = req.body;
        const creatorDni = req.user.dni;

        if (!members.includes(creatorDni)) members.push(creatorDni);

        const isPrivate = members.length === 2;

        const chatGroup = new ChatGroup({
            groupName: isPrivate ? null : groupName,
            members,
            admins: [creatorDni],
            groupImage,
            description
        });

        await chatGroup.save();
        res.status(201).json({ message: "Chat created successfully", chatGroup });
    } catch (error) {
        console.error("Error creating chat group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all chat groups the user participates in
const getChatGroups = async (req, res) => {
    try {
        const chatGroups = await ChatGroup.find({ members: req.user.dni });
        res.json(chatGroups);
    } catch (error) {
        console.error("Error getting chat groups:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get chat group details by ID
const getChatGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID format" });

        const chatGroup = await ChatGroup.findById(id);
        if (!chatGroup) return res.status(404).json({ error: "Chat group not found" });

        if (!chatGroup.members.includes(req.user.dni)) {
            return res.status(403).json({ error: "Unauthorized: Not a member of this chat" });
        }

        res.json(chatGroup);
    } catch (error) {
        console.error("Error getting chat group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update chat group (only admins or creator)
const updateChatGroup = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID format" });

        const chatGroup = await ChatGroup.findById(id);
        if (!chatGroup) return res.status(404).json({ error: "Chat group not found" });

        if (!chatGroup.admins.includes(req.user.dni) && req.user.dni !== chatGroup.members[0]) {
            return res.status(403).json({ error: "Unauthorized: Only creator or admins can update this chat" });
        }

        Object.assign(chatGroup, req.body);
        await chatGroup.save();

        res.json({ message: "Chat group updated successfully", chatGroup });
    } catch (error) {
        console.error("Error updating chat group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete chat group (only admins or creator)
const deleteChatGroup = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID format" });

        const chatGroup = await ChatGroup.findById(id);
        if (!chatGroup) return res.status(404).json({ error: "Chat group not found" });

        if (!chatGroup.admins.includes(req.user.dni) && req.user.dni !== chatGroup.members[0]) {
            return res.status(403).json({ error: "Unauthorized: Only creator or admins can delete this chat" });
        }

        await ChatGroup.findByIdAndDelete(id);
        res.json({ message: "Chat group deleted successfully" });
    } catch (error) {
        console.error("Error deleting chat group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    createChatGroup,
    getChatGroups,
    getChatGroupById,
    updateChatGroup,
    deleteChatGroup
};

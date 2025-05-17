const express = require('express');
const { authUser } = require('../middleware/authMiddleware');
const { createChatGroup, getChatGroups, getChatGroupById, updateChatGroup, deleteChatGroup } = require('../controllers/chatGroup.controller');

const router = express.Router();

// Any authenticated user can create private or group chats
router.post('/', authUser, createChatGroup);

// Only group members can see their chats
router.get('/', authUser, getChatGroups);

// Only group members can view chat details
router.get('/:id', authUser, getChatGroupById);

// Only admins and creator can update the group
router.patch('/:id', authUser, updateChatGroup);

// Only admins and creator can delete the group
router.delete('/:id', authUser, deleteChatGroup);

module.exports = router;

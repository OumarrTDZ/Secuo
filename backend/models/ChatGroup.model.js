const mongoose = require('mongoose');

// Schema definition for chat groups or private chats
const ChatGroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: false
        // Name of the chat group; null if it's a private chat
    },
    members: {
        type: [String],
        required: true
        // List of user IDs that are members of this chat group
    },
    admins: {
        type: [String],
        required: true
        // List of user IDs who have admin privileges in the group
    },
    groupImage: {
        type: String,
        required: false
        // URL or path to the group's image/avatar
    },
    description: {
        type: String,
        required: false
        // Description or topic of the chat group
    },
    settings: {
        type: Object,
        default: { allowNewMembers: true }
        // Group-specific settings (e.g., if new members can join)
    }
}, { timestamps: true });

module.exports = mongoose.model('ChatGroup', ChatGroupSchema);

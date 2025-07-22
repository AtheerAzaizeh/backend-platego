const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: String,
  lastMessageTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);

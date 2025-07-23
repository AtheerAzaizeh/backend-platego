const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  lastMessage: String,
  lastMessageTime: Date,
  participant: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Chat', chatSchema);

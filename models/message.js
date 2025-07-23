const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: String,
  date: Date,
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Message', messageSchema);

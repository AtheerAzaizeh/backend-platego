const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatID: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  fromUserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  carID: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  message: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

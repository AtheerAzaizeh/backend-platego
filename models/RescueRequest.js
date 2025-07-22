const mongoose = require('mongoose');

const rescueRequestSchema = new mongoose.Schema({
  location: String,
  time: String,
  reason: String,
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('RescueRequest', rescueRequestSchema);

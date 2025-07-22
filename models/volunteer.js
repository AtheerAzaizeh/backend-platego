const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  status: { type: String, default: 'available' }, // "available", "unavailable"
  notify: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);

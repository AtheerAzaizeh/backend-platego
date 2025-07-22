const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  volunteerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  requestID: { type: mongoose.Schema.Types.ObjectId, ref: 'RescueRequest' }
}, { timestamps: true });

module.exports = mongoose.model('VolunteerNotification', notificationSchema);

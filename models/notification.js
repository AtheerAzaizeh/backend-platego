const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },  
  message: { type: String, required: true },  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: 'linkedModel'
  },
  linkedModel: {
    type: String,
    required: false,
    enum: ['Report', 'RescueRequest', 'Message', 'Chat']
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);

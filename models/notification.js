const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    carPlate: { type: String },
    reason: { type: String },
    carImage: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
});

module.exports = mongoose.model('Notification', notificationSchema);

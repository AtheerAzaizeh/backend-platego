const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  plate: String,
  reason: String,
  location: String,
  date: Date,
  image: String,
  map: String,
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  carID: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

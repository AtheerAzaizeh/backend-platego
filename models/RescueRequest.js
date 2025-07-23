const mongoose = require('mongoose');

const rescueSchema = new mongoose.Schema({
  location: String,
  time: String,
  reason: String,
  status: { type: String, default: 'pending' }, // pending | accepted | done | canceled
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('RescueRequest', rescueSchema);

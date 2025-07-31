const mongoose = require('mongoose');

const rescueSchema = new mongoose.Schema({
  location: String,
  time: String,
  reason: String,
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
    coordinates: {
  lat: Number,
  lng: Number
}
}, { timestamps: true });

module.exports = mongoose.model('RescueRequest', rescueSchema);

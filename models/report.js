const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  plate: { type: String, required: true },     
  reason: { type: String, required: true },      
  reportType: { type: String, required: true },     
  location: {
    city: String,
    street: String,
    number: String
  },
  date: { type: Date, default: Date.now },
  image: String,
  status: { type: String, default: 'open' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Report', reportSchema);

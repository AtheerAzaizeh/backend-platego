const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  carCompany: String,
  model: String,
  color: String,
  year: Number,
  image: String,
  plate: { type: String, unique: true },
  numberOfReports: Number,
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);

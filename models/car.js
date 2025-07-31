const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  carCompany:      { type: String, required: true },
  model:           { type: String, required: true },
  color:           { type: String, required: true },
  year:            { type: Number, required: true },
  image:           { type: String },
  plate:           { type: String, required: true, unique: true }, 
  numberOfReports: { type: Number, default: 0 },
  owner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

carSchema.index({ plate: 1 }, { unique: true });

module.exports = mongoose.model('Car', carSchema);

const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  manufacturer: String,
  model: String,
  plateNumber: String,
  year: Number,
}, { _id: false });

const userSchema = new mongoose.Schema({
  phoneNumber: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  address: String,
  img: String,
  cars: [carSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

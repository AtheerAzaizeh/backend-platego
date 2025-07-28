const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  password: String,
  address: String,
  img: String,
  volunteerStatus: String,
  notify: Boolean,
  available: { type: Boolean, default: false }

});

module.exports = mongoose.model('User', userSchema);

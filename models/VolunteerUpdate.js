const mongoose = require('mongoose');

const volunteerUpdateSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model('VolunteerUpdate', volunteerUpdateSchema);

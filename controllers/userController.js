const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user'); // Mongoose model
const asyncHandler = require("express-async-handler")


exports.becomeVolunteer = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'volunteer';
    user.volunteerStatus === 'available';
    await user.save();

    res.status(200).json({ message: 'You are now a volunteer!' });
  } catch (err) {
    console.error('Become volunteer error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// הבאת כל המשתמשים
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};


exports.toggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.available = !user.available;
    await user.save();

    res.status(200).json({ available: user.available });
  } catch (err) {
    console.error('Toggle availability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware from authMiddleware
  const user = await User.findById(req.user.id).select("-password")

  if (user) {
    res.json({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      profilePicture: user.img,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

exports.updateUser = async (req, res) => {
  console.log("🛠️ updateUser called for ID:", req.params.id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ User not found");
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user'); // Mongoose model
const asyncHandler = require("express-async-handler")

// רישום משתמש חדש
exports.registerUser = async (req, res) => {
    const { phoneNumber, firstName, lastName, email, password, address, img, cars = [] } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            phoneNumber,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            address,
            img,
            cars
        });
        
        console.log('Registering user:', newUser);

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, 'your_secret_key');
        res.header('Authorization', `Bearer ${token}`).json({ token, message: 'Registration successful' });

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Error registering user' });
    }
};

exports.becomeVolunteer = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'volunteer';
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

// מחיקת משתמש לפי מזהה
exports.deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
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
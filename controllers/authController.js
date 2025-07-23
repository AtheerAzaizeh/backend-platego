const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Car = require('../models/car');

exports.signup = async (req, res) => {
  try {
    const {
      firstName, lastName, phoneNumber, email, password,
      role, address, img, volunteerStatus, notify,
      carCompany, model, color, year, image, plate
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName, lastName, phoneNumber, email,
      password: hashedPassword, role, address, img,
      volunteerStatus, notify
    });

    const savedUser = await newUser.save();

    const newCar = new Car({
      carCompany, model, color, year, image, plate,
      owner: savedUser._id
    });

    await newCar.save();

    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, 'your_secret_key', {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: savedUser,
      car: newCar
    });

  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const car = await Car.findOne({ owner: user._id });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user,
      car
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};
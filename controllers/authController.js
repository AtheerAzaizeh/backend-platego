const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const mongoose = require('mongoose');
const User   = require('../models/user');
const Car    = require('../models/car');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment');
}

exports.signup = async (req, res, next) => {
  try {
    const {
      firstName, lastName, phoneNumber, email, password,
      role, address, img, volunteerStatus, notify,
      carCompany, model, color, year, image, plate
    } = req.body;

    // 1. Validate required user fields
    if (!firstName)     return res.status(400).json({ error: 'First name is required' });
    if (!lastName)      return res.status(400).json({ error: 'Last name is required' });
    if (!phoneNumber)   return res.status(400).json({ error: 'Phone number is required' });
    if (!email)         return res.status(400).json({ error: 'Email is required' });
    if (!password)      return res.status(400).json({ error: 'Password is required' });
    if (password.length < 6)
                        return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // 2. Check for existing user
    const conflict = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    }).lean();
    if (conflict) {
      return res.status(409).json({ error: 'A user with that email or phone already exists' });
    }

    // 3. Hash password & save user
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName, lastName, phoneNumber, email,
      password: hashed, role, address, img,
      volunteerStatus, notify
    });
    const savedUser = await newUser.save();

    // 4. Optionally create a Car if plate info provided
    let savedCar = null;
    if (plate && carCompany && model) {
      savedCar = await new Car({
        carCompany, model, color, year, image, plate,
        owner: savedUser._id
      }).save();
    }

    // 5. Sign JWT
    const token = jwt.sign(
      { id: savedUser._id.toString(), role: savedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Sanitize user object (remove password)
    const userObj = savedUser.toObject();
    delete userObj.password;

    // 7. Respond
    return res.status(201).json({
      message: 'Signup successful',
      token,
      user: userObj,
      car:  savedCar
    });

  } catch (err) {
    console.error('signup failed:', err);
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    // 1. Validate input
    if (!emailOrPhone)  return res.status(400).json({ error: 'Email or phone is required' });
    if (!password)      return res.status(400).json({ error: 'Password is required' });

    // 2. Find user (include password for compare)
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
    }).select('+password');  // ensure password is returned

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Fetch associated car (if any)
    const car = await Car.findOne({ owner: user._id }).lean();

    // 5. Issue JWT
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Sanitize user object
    const userObj = user.toObject();
    delete userObj.password;

    // 7. Respond
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userObj,
      car
    });

  } catch (err) {
    console.error('login failed:', err);
    return next(err);
  }
};

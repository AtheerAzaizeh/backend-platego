const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Mongoose model

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

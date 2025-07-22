const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Mongoose model

// התחברות משתמש
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`Attempting to log in user with email: ${email}`);

        const user = await User.findOne({ email });
        console.log('User from DB:', user);

        if (!user) {
            console.error('Invalid email');
            return res.status(400).json({ message: 'Invalid email' });
        }

        const validPass = await bcrypt.compare(password, user.password);
        console.log('Password valid:', validPass);

        if (!validPass) {
            console.error('Invalid password');
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });

        res.json({
            token,
            message: 'Login successful',
            user: {
                userID: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                img: user.img
            },
        });

    } catch (error) {
        console.error(`Error during login: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const VolunteerUpdate = require('../models/VolunteerUpdate');

// מביא את כל העדכונים של מתנדבים
exports.getUpdates = async (req, res) => {
    try {
        const updates = await VolunteerUpdate.find().sort({ date: -1 });
        res.json(updates);
    } catch (err) {
        console.error('Error fetching volunteer updates:', err);
        res.status(500).json({ message: 'Error fetching volunteer updates' });
    }
};

const Volunteer = require('../models/volunteer');

// רישום מתנדב
exports.registerVolunteer = async (req, res) => {
    const userID = req.user.id;

    try {
        // אם קיים – עדכן, אחרת צור חדש
        await Volunteer.findOneAndUpdate(
            { userID },
            { status: 'available', notify: true },
            { upsert: true, new: true }
        );

        res.json({ message: 'Successfully registered as volunteer' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering as volunteer' });
    }
};

// סטטוס מתנדב
exports.getVolunteerStatus = async (req, res) => {
    const userID = req.user.id;

    try {
        const volunteer = await Volunteer.findOne({ userID });

        if (volunteer) {
            res.json({ isVolunteer: true, status: volunteer.status });
        } else {
            res.json({ isVolunteer: false });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching volunteer status' });
    }
};

// עדכון העדפה לגבי קבלת התראות
exports.updateNotificationPreference = async (req, res) => {
    const userID = req.user.id;
    const notify = !!req.body.notify;

    try {
        const status = notify ? 'available' : 'unavailable';

        await Volunteer.findOneAndUpdate(
            { userID },
            { status, notify },
            { new: true }
        );

        res.json({ message: 'Notification preference updated' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating notification preference' });
    }
};

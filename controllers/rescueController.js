const RescueRequest = require('../models/RescueRequest');
const Volunteer = require('../models/volunteer');
const VolunteerNotification = require('../models/VolunteerNotification');

// שליחת בקשת חילוץ
exports.submitRescueRequest = async (req, res) => {
    const userID = req.user.id;
    const { location, time, reason } = req.body;

    try {
        const newRequest = new RescueRequest({ userID, location, time, reason });
        await newRequest.save();

        // חיפוש מתנדבים זמינים
        const volunteers = await Volunteer.find({ status: 'available', notify: true });

        // יצירת התראות
        const notifications = volunteers.map(volunteer => ({
            volunteerID: volunteer._id,
            requestID: newRequest._id
        }));

        await VolunteerNotification.insertMany(notifications);

        res.json({ requestID: newRequest._id, ...newRequest.toObject() });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting rescue request' });
    }
};

// מביא את כל בקשות החילוץ
exports.getAllRescueRequests = async (req, res) => {
    try {
        const requests = await RescueRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching rescue requests' });
    }
};

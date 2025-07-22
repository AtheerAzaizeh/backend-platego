const RescueRequest = require('../models/RescueRequest');

// מביא את כל בקשות החילוץ של המשתמש המחובר בלבד
exports.getAllRescueRequests = async (req, res) => {
    const userID = req.user.id;

    try {
        const requests = await RescueRequest.find({ userID });
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching rescue requests' });
    }
};

const User = require('../models/user');
const RescueRequest = require('../models/RescueRequest');

exports.getVolunteerStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ isVolunteer: user.volunteerStatus === 'available' });
    } catch (err) {
        console.error('Error checking volunteer status:', err);
        res.status(500).json({ message: 'Error checking status' });
    }
};

exports.registerAsVolunteer = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.volunteerStatus = 'available';
        await user.save();

        res.json({ message: 'Registered as volunteer', isVolunteer: true });
    } catch (err) {
        console.error('Error registering volunteer:', err);
        res.status(500).json({ message: 'Failed to register as volunteer' });
    }
};

exports.updateVolunteer = async (req, res) => {
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Volunteer updated', user });
    } catch (err) {
        console.error('Error updating volunteer:', err);
        res.status(500).json({ message: 'Error updating volunteer' });
    }
};


exports.getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await User.find({ volunteerStatus: 'available' });
        res.json(volunteers);
    } catch (err) {
        console.error('Error fetching volunteers:', err);
        res.status(500).json({ message: 'Error fetching volunteers' });
    }
};

exports.getVolunteerUpdates = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.volunteerStatus !== 'available') {
            return res.status(403).json({ message: 'User is not a volunteer' });
        }

        const updates = await RescueRequest.find({ status: 'pending' }).sort({ createdAt: -1 });

        res.json(updates);
    } catch (err) {
        console.error('Error getting volunteer updates:', err);
        res.status(500).json({ message: 'Failed to get updates' });
    }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for availability' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { available },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Availability status updated', available: user.available });
  } catch (err) {
    console.error('Error updating availability:', err);
    res.status(500).json({ message: 'Server error while updating availability' });
  }
};

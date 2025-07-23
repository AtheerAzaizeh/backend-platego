const RescueRequest = require('../models/rescueRequest');

exports.sendRescueRequest = async (req, res) => {
  try {
    const { location, time, reason } = req.body;
    const userId = req.user.id;

    const request = new RescueRequest({
      location,
      time,
      reason,
      user: userId
    });

    await request.save();
    res.status(201).json({ message: 'Rescue request sent', request });
  } catch (err) {
    console.error('Send rescue error:', err);
    res.status(500).json({ message: 'Server error while sending rescue request' });
  }
};

exports.getMyRescueRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await RescueRequest.find({ user: userId }).sort({ time: -1 });
    res.status(200).json({ requests });
  } catch (err) {
    console.error('Get rescue error:', err);
    res.status(500).json({ message: 'Server error while fetching rescue requests' });
  }
};

exports.deleteRescueRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await RescueRequest.findOne({ _id: id, user: userId });
    if (!request) return res.status(404).json({ message: 'Request not found or unauthorized' });

    await RescueRequest.deleteOne({ _id: id });
    res.status(200).json({ message: 'Rescue request deleted' });

  } catch (err) {
    console.error('Delete rescue error:', err);
    res.status(500).json({ message: 'Server error while deleting rescue request' });
  }
};

exports.getAllRescueRequests = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'volunteer' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await RescueRequest.find()
      .populate('user', 'firstName lastName phoneNumber')
      .sort({ time: -1 });

    res.status(200).json({ requests });

  } catch (err) {
    console.error('Get all rescues error:', err);
    res.status(500).json({ message: 'Server error while fetching all rescue requests' });
  }
};
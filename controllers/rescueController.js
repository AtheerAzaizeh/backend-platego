const Notification = require('../models/notification');
const User = require('../models/user');
const RescueRequest = require('../models/RescueRequest');

exports.createRescueRequest = async (req, res) => {
    try {
        const { location, time, reason } = req.body;
        const userId = req.user.id;

        const request = new RescueRequest({
            user: userId,
            location,
            time,
            reason
        });

        await request.save();

        const volunteers = await User.find({ role: 'volunteer' });

        const submitter = await User.findById(userId);

const notifications = volunteers.map(vol => ({
  user: vol._id,
  message: `New rescue request near ${location} — submitted by ${submitter.firstName} ${submitter.lastName}`,
  sender: userId ,
  location: location,
  reason: reason,
  rescueId: request._id
}));

       

      await Promise.all(volunteers.map(vol => {
  return Notification.create({
    user: vol._id,
    message: `New rescue request near ${location} — submitted by ${submitter.firstName} ${submitter.lastName}`,
    sender: userId,
    location,
    reason,
    rescueId: request._id
  });
}));


        req.io.to('volunteers').emit('newRescueRequest', {
            message: `New rescue request: ${reason}`,
            location,
            time,
        });

        res.status(201).json({ message: 'Rescue request created and volunteers notified.' });

    } catch (err) {
        console.error("Rescue error:", err);
        res.status(500).json({ message: 'Error creating rescue request' });
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

exports.acceptRescueRequest = async (req, res) => {
  try {
    const rescueId = req.params.id;
    const volunteerId = req.user.id;

    console.log("🔧 Accept request called with:");
    console.log("→ rescueId:", rescueId);
    console.log("→ volunteerId:", volunteerId);
console.log("🚨 Notification saving rescueId:", rescue?._id);

    const rescue = await RescueRequest.findById(rescueId);
    if (!rescue) {
      console.log("❌ Rescue not found");
      return res.status(404).json({ message: 'Rescue request not found' });
    }

    if (rescue.status !== 'pending') {
      console.log("⚠️ Already accepted");
      return res.status(400).json({ message: 'This rescue request is already taken' });
    }

    rescue.status = 'accepted';
    rescue.acceptedBy = volunteerId;
    await rescue.save(); // 🔧 This line might fail if acceptedBy is not a valid ObjectId

    console.log("✅ Rescue accepted successfully");

    req.io.to(`user_${rescue.user}`).emit('rescueAccepted', {
      rescueId: rescue._id,
      acceptedBy: volunteerId
    });

    res.status(200).json({ message: 'Rescue accepted successfully', rescue });

  } catch (err) {
    console.error('❗ Accept rescue error:', err); // THIS will now show the real reason
    res.status(500).json({ message: 'Server error while accepting rescue' });
  }
};

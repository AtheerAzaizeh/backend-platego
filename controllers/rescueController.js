const Notification = require('../models/notification');
const User = require('../models/user');
const RescueRequest = require('../models/RescueRequest');

const Chat = require('../models/chat'); // Make sure you require the Chat model at the top


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

    const volunteers = await User.find({ role: 'volunteer', available: true });
    const submitter = await User.findById(userId);

    await Promise.all(volunteers.map(vol =>
      Notification.create({
        user: vol._id,
        message: `New rescue request near ${location} — submitted by ${submitter.firstName} ${submitter.lastName}`,
        sender: userId,
        location,
        reason,
        rescueId: request._id,
        status: request.status
      })
    ));

    req.io.to('volunteers').emit('newRescueRequest', {
      message: `New rescue request: ${reason}`,
      location,
      time,
    });

    res.status(201).json({ message: 'Rescue request created and volunteers notified.' });

  } catch (err) {
    console.error("❌ Rescue error:", err);
    res.status(500).json({ message: 'Error creating rescue request' });
  }
};

const mongoose = require('mongoose'); // Make sure this is required at the top

exports.acceptRescueRequest = async (req, res) => {
  try {
    const rescueId = req.params.id;
    const volunteerId = req.user.id;

    console.log("🔧 Accept request called with:");
    console.log("→ rescueId:", rescueId);
    console.log("→ volunteerId:", volunteerId);

    const rescue = await RescueRequest.findById(rescueId);
    if (!rescue) {
      console.log("❌ Rescue not found");
      return res.status(404).json({ message: 'Rescue request not found' });
    }

    if (!rescue.user) {
      console.log("❌ Rescue request has no user assigned.");
      return res.status(500).json({ message: 'Rescue request missing user.' });
    }

    if (rescue.status !== 'pending') {
      console.log("⚠️ Already accepted");
      return res.status(400).json({ message: 'This rescue request is already taken' });
    }

    rescue.status = 'accepted';
    rescue.acceptedBy = volunteerId;
    await rescue.save();

    console.log("✅ Rescue accepted successfully");

    const requesterId = new mongoose.Types.ObjectId(rescue.user);
    const volunteerObjId = new mongoose.Types.ObjectId(volunteerId);

    // ✅ Create or find a chat between requester and volunteer
    console.log("💬 Attempting to create chat with:");
console.log("→ participants:", [requesterId, volunteerObjId]);
console.log("→ rescueId:", rescue._id);

    let chat = await Chat.findOne({
      participants: { $all: [requesterId, volunteerObjId] }
    });

    if (!chat) {
      try {
        chat = await Chat.create({
          participants: [requesterId, volunteerObjId],
          rescueId: rescue._id
        });
        console.log("📦 New chat created:", chat);
      } catch (chatErr) {
        console.error("❌ Failed to create chat:", chatErr);
        return res.status(500).json({ message: 'Failed to create chat' });
      }
    }

    // ✅ Notify the original requester via socket
    const io = req.io;
    if (io && rescue.user) {
      const userRoom = `user_${rescue.user.toString()}`;
      io.to(userRoom).emit('rescueAccepted', {
        rescueId: rescue._id,
        acceptedBy: req.user.firstName,
        chatId: chat._id
      });
      console.log(`📨 Sent rescueAccepted to ${userRoom}`);
    } else {
      console.warn("⚠️ Cannot emit rescueAccepted — user is missing or Socket.IO unavailable.");
    }

    // ✅ Respond to volunteer with chat ID
    res.status(200).json({
      message: 'Rescue accepted successfully',
      chatId: chat._id
    });

  } catch (err) {
    console.error('❗ Accept rescue error:', err);
    res.status(500).json({ message: 'Server error while accepting rescue' });
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





exports.getRescueById = async (req, res) => {
  try {
    const rescue = await RescueRequest.findById(req.params.id);
    if (!rescue) return res.status(404).json({ message: 'Rescue not found' });
    res.json(rescue);
  } catch (err) {
    console.error('Error fetching rescue by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



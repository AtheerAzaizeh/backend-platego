const Notification = require('../models/notification');
const Car = require('../models/car');
const RescueRequest = require('../models/RescueRequest');

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })

    res.status(200).json({ notifications });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notif = await Notification.findOne({ _id: notificationId, user: userId });
    if (!notif) return res.status(404).json({ message: 'Notification not found or unauthorized' });

    await Notification.deleteOne({ _id: notificationId });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
};

exports.saveNotification = async (req, res) => {
  try {
    const { message, carPlate, reason, carImage, userId } = req.body; // userId = recipient
    const senderId = req.user.id; // the sender (logged in user)

    const car = await Car.findOne({ owner: senderId });
    const rescue = await RescueRequest.findOne({ user: senderId }).sort({ createdAt: -1 });

    const newNotification = new Notification({
      user: userId, // the recipient of the notification
      sender: senderId, // the one who triggered this
      message: `New rescue request: ${rescue?.reason || 'Unknown'}`,
      carPlate: car?.plate || 'Unknown',
      reason: rescue?.reason || 'N/A',
      carImage: car?.image || 'images/default-car.png'
    });

    await newNotification.save();
    res.status(201).json({ message: 'Notification saved successfully' });

  } catch (err) {
    console.error('Save notification error:', err);
    res.status(500).json({ message: 'Server error while saving notification' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName img')
      .populate('user', 'firstName lastName img');

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark notification error:', err);
    res.status(500).json({ message: 'Server error while marking notification' });
  }
};



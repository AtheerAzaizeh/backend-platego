const Notification = require('../models/notification');

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
    const { message } = req.body;
    const userId = req.user.id;

    const newNotification = new Notification({
      user: userId,
      message
    });

    await newNotification.save();
    res.status(201).json({ message: 'Notification saved successfully' });
  } catch (err) {
    console.error('Save notification error:', err);
    res.status(500).json({ message: 'Server error while saving notification' });
  }
};

// backend/controllers/reportController.js

const Report       = require('../models/report');
const Car          = require('../models/car');
const Notification = require('../models/notification');
const Chat         = require('../models/chat');
const Message      = require('../models/message');
const User          = require('../models/user');
const fetch        = (...args) => import('node-fetch').then(mod => mod.default(...args));

/**
 * Given { city, street, number }, returns { lat, lng } via Nominatim
 */
async function getCoordinates({ city, street, number }) {
  const address = encodeURIComponent(`${number} ${street}, ${city}, Israel`);
  const url     = `https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`;
  const res     = await fetch(url, { headers: { 'User-Agent': 'Plate&Go' } });
  const data    = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

exports.createReportWithCoordinates = async (req, res) => {
  try {
    const { plate, reason, reportType, location } = req.body;
    const senderId = req.user.id;
    const sender = await User.findById(senderId).select('firstName lastName');
    const senderName = sender
    ? `${sender.firstName} ${sender.lastName}`
    : 'Someone';
    // 1. Validate
    if (!plate || !reason || !reportType || !location?.city || !location?.street || !location?.number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Lookup coords
    const coords = await getCoordinates(location);

    // 3. Find car & owner
    const car = await Car.findOne({ plate });
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    const receiverId = car.owner.toString();
    const reportImage = car.image || 'images/default-car.jpg';

    // 4. Create & save the Report
    const newReport = new Report({
      plate,
      reason,
      reportType,
      image: reportImage,
      location,
      coordinates: coords || undefined,
      sender: senderId,
    });
    const savedReport = await newReport.save();

    // 5. If user reported their own car, skip notifications
    if (receiverId === senderId) {
      return res.status(201).json({
        message: 'Report submitted on your own car',
        report: savedReport
      });
    }

    // 6. Persist notification in DB
    const notify = await Notification.create({
      type:        'report',
      message:     reason,
      user:        receiverId,
      sender:      senderId,
      carPlate:    plate,
      carImage:    reportImage,
      linkedTo:    savedReport._id,
      linkedModel: 'Report',
      isRead:      false,
    });

    // 7. Emit only after you've joined the proper room on the server
    const payload = {
      reportId:   savedReport._id,
      plate,
      message:    reason,
      senderName,
      time:       savedReport.createdAt,
    };
    console.log(`📣 Emitting newReportNotification to user_${receiverId}:`, payload);
    req.io.to(`user_${receiverId}`).emit('newReportNotification', payload);

    // 8. (Optional) also fire your generic handler
    req.io.to(`user_${receiverId}`).emit('new-notification', {
      type:     'report',
      message:  reason,
      linkedId: savedReport._id,
    });

    // 9. Chat logic (mirror your message flow)
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
        car:          car._id,
        lastMessage:  'You have received a report on your car',
        lastMessageTime: new Date(),
      });
    }
    const chatMsg = await Message.create({
      chat:    chat._id,
      sender:  senderId,
      text:    `Hey, I just reported your car (${plate}) because: ${reason}`,
      date:    new Date()
    });
    chat.lastMessage     = chatMsg.text;
    chat.lastMessageTime = chatMsg.date;
    await chat.save();

    // 10. Final response
    return res.status(201).json({
      message:      'Report submitted and user notified',
      report:       savedReport,
      notification: notify,
      chatId:       chat._id
    });

  } catch (err) {
    console.error('Error creating report:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};



exports.getCarByPlate = async (req, res) => {
  try {
    const { plate } = req.params;

    const car = await Car.findOne({ plate }).populate('owner');
    if (!car) return res.status(404).json({ message: 'Car not found' });

    res.status(200).json({ car });

  } catch (err) {
    console.error('Get car error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await Report.find({ sender: userId }).sort({ date: -1 });
    res.status(200).json({ reports });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ date: -1 })
      .populate('sender', 'firstName lastName email img');

    res.status(200).json({ reports });
  } catch (err) {
    console.error('Get all reports error:', err);
    res.status(500).json({ message: 'Server error while fetching all reports' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;

    const report = await Report.findOne({ _id: reportId, sender: userId });
    if (!report) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }

    await Report.deleteOne({ _id: reportId });
    res.status(200).json({ message: 'Report deleted successfully' });

  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json({ message: 'Server error while deleting report' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

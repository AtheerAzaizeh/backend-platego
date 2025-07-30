const Report = require('../models/report');
const Car = require('../models/car');
const Notification = require('../models/notification');
const Chat = require('../models/chat');
const Message = require('../models/message');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));


async function getCoordinates({ city, street, number }) {
  const address = encodeURIComponent(`${number} ${street}, ${city}, Israel`);
  const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Plate&Go' }
  });
  const data = await res.json();

  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  }

  return null; // not found
}

exports.createReportWithCoordinates = async (req, res, io) => {
  try {
    const { plate, reason, reportType, location } = req.body;
    const senderId = req.user.id;

    if (!plate || !reason || !reportType || !location?.city || !location?.street || !location?.number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Get coordinates
    const coords = await getCoordinates(location);

    // 2. Find car and get image + owner
    const car = await Car.findOne({ plate });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const reportImage = car.image || "images/default-car.jpg";
    const receiverId = car.owner;

    // 3. Save the report
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

    // 4. If reporting own car, skip notification
    if (receiverId.toString() === senderId) {
      return res.status(201).json({ message: 'Report submitted on your own car', report: savedReport });
    }

    // 5. Save the notification
    const notify = new Notification({
      type: 'report',
      message: `New report submitted on your car: ${reason}`,
      user: receiverId,
      sender: senderId,
      carPlate: plate,
      reason,
      carImage: reportImage,
      linkedTo: savedReport._id,
      linkedModel: 'Report',
      isRead: false,
    });
    await notify.save();

    // 6. Emit real-time socket notification
    if (io) {
      io.to(receiverId.toString()).emit("new-notification", {
        type: "report",
        message: `New report submitted on your car: ${reason}`,
        reportId: savedReport._id,
        plate,
        image: reportImage,
        time: new Date(),
      });
    }

    // 7. Chat creation / messaging
    let chat = await Chat.findOne({
      participant: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = new Chat({
        participant: [senderId, receiverId],
        car: car._id,
        lastMessage: 'You have received a report on your car',
        lastMessageTime: new Date(),
      });
      await chat.save();
    }

    const message = new Message({
      message: `Hey, I just reported your car (${plate}) because: ${reason}`,
      date: new Date(),
      chat: chat._id,
      sender: senderId,
    });
    await message.save();

    chat.lastMessage = message.message;
    chat.lastMessageTime = message.date;
    await chat.save();

    // ✅ Done
    res.status(201).json({
      message: 'Report submitted and user notified',
      report: savedReport,
      notification: notify,
      chatId: chat._id,
    });

  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Server error' });
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

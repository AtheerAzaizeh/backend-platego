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

exports.createReportWithCoordinates = async (req, res ) => {
  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }
    const { plate, reason, reportType, location } = req.body;
    const senderId = req.user.id;
    const sender = await User.findById(senderId).select('firstName lastName');
    const senderName = sender
    ? `${sender.firstName} ${sender.lastName}`
    : 'Someone';
    // 1. Validate
    if (!plate)      return res.status(400).json({ error: 'Plate number is required' });
    if (!reason)     return res.status(400).json({ error: 'Reason is required' });
    if (!reportType) return res.status(400).json({ error: 'Report type is required' });
    if (!location?.city)
                      return res.status(400).json({ error: 'City in location is required' });
    if (!location?.street)
                      return res.status(400).json({ error: 'Street in location is required' });
    if (!location?.number)
                      return res.status(400).json({ error: 'Street number is required' });
    // 2. Lookup coords
    let coords;
    try {
      coords = await getCoordinates(location);
    } catch (geoErr) {
      console.error('Geocoding error:', geoErr);
      return res
        .status(502)
        .json({ error: 'Failed to lookup coordinates', details: geoErr.message });
    }

    // 3. Find car & owner
    const car = await Car.findOne({ plate });
    if (!car) {
      return res.status(404).json({ error: `No car found for plate ${plate}` });
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
    if (car.owner.equals(userId)) {
      return res.status(201).json({
        message: 'You reported your own car; no notification sent.',
        savedReport,
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

    // 8. also fire your generic handler
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
      text:    `Hey, I just reported your car (${plate}) because: ${reason}`
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
    console.error('createReportWithCoordinates failed:', err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCarByPlate = async (req, res ) => {
  try {
    const { plate } = req.params;

    // 1. Validate presence
    if (!plate) {
      return res.status(400).json({ error: 'Plate parameter is required' });
    }

    // 2. Fetch & populate only needed owner fields
    const car = await Car.findOne({ plate })
      .populate({
        path: 'owner',
        select: 'firstName lastName email'    // tailor to what the client needs
      });
    
    // 4. Not found?
    if (!car) {
      return res
        .status(404)
        .json({ error: `No car found with plate '${plate}'` });
    }

    // 5. Success
    return res.status(200).json({ car });

  } catch (err) {
    console.error('getCarByPlate failed:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;

    // 2. Parse & validate pagination query
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    if (page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ error: 'Page and limit must be positive integers' });
    }
    const skip = (page - 1) * limit;

    // 3. Count total reports for pagination metadata
    const totalReports = await Report.countDocuments({ sender: userId });

    // 4. Fetch reports
    const reports = await Report.find({ sender: userId })
      .sort({ createdAt: -1 })       // uses timestamps: true
      .skip(skip)
      .limit(limit)
      .select('plate reason reportType location createdAt') 
      .lean();                        // plain JS objects

    // 5. Build pagination info
    const totalPages = Math.ceil(totalReports / limit);

    // 6. Return
    return res.status(200).json({
      reports,
      pagination: {
        total:      totalReports,
        page,
        limit,
        totalPages
      }
    });

  } catch (err) {
    console.error('getMyReports failed:', err);
    res.status(500).json({ error: "Internal Server Error" }); 
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
    const { id } = req.params;

    // 1. Validate presence
    if (!id) {
      return res.status(400).json({ error: 'Report ID is required' });
    }

    // 2. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    // 3. Fetch report, populate sender
    const report = await Report.findById(id)
      .select('plate reason reportType location status image coordinates createdAt sender')
      .populate({
        path:   'sender',
        select: 'firstName lastName email' 
      })
      .lean();

    // 4. Not found?
    if (!report) {
      return res
        .status(404)
        .json({ error: `No report found with ID '${id}'` });
    }

    // 5. Success
    return res.status(200).json({ report });

  } catch (err) {
    console.error('getReportById failed:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

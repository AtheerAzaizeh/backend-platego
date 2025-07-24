const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');

exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participant: userId })
      .populate('participant', 'firstName lastName img')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({ chats });
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ message: 'Server error while fetching chats' });
  }
};

// POST /api/chat/create-or-get
exports.createOrGetChat = async (req, res) => {
    let { userIDs, carID } = req.body;

    if (!Array.isArray(userIDs)) {
        return res.status(400).json({ message: 'userIDs must be an array' });
    }

    userIDs = userIDs.filter(id => id && typeof id === 'string');
    const uniqueIDs = [...new Set(userIDs)];

    if (uniqueIDs.length !== 2 || !carID) {
        return res.status(400).json({ message: 'Exactly 2 valid user IDs and carID are required' });
    }

    try {
        const existingChat = await Chat.findOne({
            participants: { $all: uniqueIDs },
            car: carID
        });

        if (existingChat) {
            return res.status(200).json({ chatID: existingChat._id });
        }

        const newChat = new Chat({
            participants: uniqueIDs,
            car: carID,
            lastMessage: '',
            lastMessageTime: new Date()
        });

        await newChat.save();
        return res.status(201).json({ chatID: newChat._id });
    } catch (err) {
        console.error('Error in createOrGetChat:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

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

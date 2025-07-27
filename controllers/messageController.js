const Message = require('../models/message');
const Notification = require('../models/notification');
const Chat = require('../models/chat');

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user.id;

    const chat = await Chat.findById(chatId).populate('participants');
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const receiver = chat.participants.find(p => p._id.toString() !== senderId);
    if (!receiver) return res.status(400).json({ error: 'Receiver not found' });

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      text,
    });

    // Save notification for receiver
    await Notification.create({
      user: receiver._id,
      message: `New message from ${req.user.firstName || 'user'}: "${text.slice(0, 30)}..."`,
      chatId,
    });

    // Send real-time via socket.io
    req.io.to(chatId).emit('newMessage', await message.populate('sender'));

    res.json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName lastName img')
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

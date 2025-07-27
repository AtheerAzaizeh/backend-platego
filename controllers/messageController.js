const Message = require('../models/message');

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const sender = req.user.id;

    if (!chatId || !text) {
      return res.status(400).json({ error: 'chatId and text are required' });
    }

    const message = await Message.create({ chat: chatId, sender, text });
    const populated = await message.populate('sender', 'firstName lastName img');

    req.io.to(chatId).emit('newMessage', populated); // Broadcast to room

    res.status(201).json(populated);
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ error: 'Server error' });
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

const Message = require('../models/message');
const Chat = require('../models/chat');

exports.getMessagesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName lastName img')
      .sort({ date: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id;

    const newMessage = new Message({
      chat: chatId,
      message,
      sender: senderId,
      date: new Date()
    });

    await newMessage.save();

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message,
      lastMessageTime: new Date()
    });

    res.status(201).json({ message: 'Message sent', data: newMessage });

  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

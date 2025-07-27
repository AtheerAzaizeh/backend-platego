const Chat = require('../models/chat');
const Car = require('../models/car');
const Message = require('../models/message');
const User = require('../models/user');

exports.createOrGetChat = async (req, res) => {
  try {
    const { plate } = req.body;
    const userId = req.user.id;

const car = await Car.findOne({ plate: plate.trim() }).populate('owner');

    if (!car) return res.status(404).json({ error: 'Car not found' });

    if (car.owner.toString() === userId)
      return res.status(400).json({ error: "You can't message yourself" });

    let chat = await Chat.findOne({
      car: car._id,
      participants: { $all: [userId, car.owner], $size: 2 }
    });

    if (!chat) {
      chat = await Chat.create({
        car: car._id,
        participants: [userId, car.owner]
      });
    }

    res.json({ chatId: chat._id });
  } catch (err) {
    console.error('Error in createOrGetChat:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName lastName img')
      .sort({ date: 1 });

    res.json({ messages });
  } catch (err) {
    console.error('Error in getChatMessages:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id;

    const newMsg = await Message.create({
      message,
      chat: chatId,
      sender: senderId,
      date: new Date()
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message,
      lastMessageTime: new Date()
    });

    const populatedMsg = await newMsg.populate('sender', 'firstName lastName img');

    res.status(201).json(populatedMsg);
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

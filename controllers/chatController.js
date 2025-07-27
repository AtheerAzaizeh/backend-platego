const Chat = require("../models/chat")
const Car = require("../models/car")
const User = require("../models/user")
const Message = require("../models/message")

exports.createOrGetChat = async (req, res) => {
  try {
    const userId = req.user.id
    const { plate } = req.body

    if (!plate) return res.status(400).json({ error: "Plate is required" })

    const car = await Car.findOne({ plate }).populate("owner")
    if (!car) return res.status(404).json({ error: "Car not found" })

    if (car.owner.toString() === userId) {
      return res.status(400).json({ error: "You can't message yourself" })
    }

    let chat = await Chat.findOne({
      car: car._id,
      participants: { $all: [userId, car.owner._id], $size: 2 },
    })

    if (!chat) {
      chat = await Chat.create({
        car: car._id,
        participants: [userId, car.owner._id],
      })
    }

    res.json({ chatId: chat._id })
  } catch (err) {
    console.error("Error in createOrGetChat:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id

    const chats = await Chat.find({ participants: userId }).populate("car").populate("participants").lean()

    const chatIds = chats.map((chat) => chat._id)
    const latestMessages = await Message.aggregate([
      { $match: { chat: { $in: chatIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$chat",
          latest: { $first: "$$ROOT" },
        },
      },
    ])

    const latestMap = {}
    latestMessages.forEach((m) => (latestMap[m._id.toString()] = m.latest.timestamp))

    chats.sort((a, b) => {
      return (latestMap[b._id.toString()] || 0) - (latestMap[a._id.toString()] || 0)
    })

    res.json(chats)
  } catch (err) {
    console.error("Get chats error:", err)
    res.status(500).json({ error: "Failed to fetch chats" })
  }
}

exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId)
      .populate("participants", "firstName lastName img")
      .populate("car");

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    if (!chat.participants.some((p) => p._id.toString() === userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const viewer = chat.participants.find(p => p._id.toString() === userId);
    const otherUser = chat.participants.find(p => p._id.toString() !== userId);

    const Car = require('../models/car'); // make sure this is imported at the top
    const viewerCar = await Car.findOne({ owner: viewer._id });
    const otherCar = await Car.findOne({ owner: otherUser._id });

    res.json({
      chatId: chat._id,
      participants: chat.participants.map((p) => ({
        id: p._id.toString(),
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        img: p.img,
      })),
      car: {
        viewerCar: viewerCar ? {
          plate: viewerCar.plate,
          image: viewerCar.image
        } : null,
        otherCar: otherCar ? {
          plate: otherCar.plate,
          image: otherCar.image
        } : null
      }
    });

  } catch (err) {
    console.error("getChatById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

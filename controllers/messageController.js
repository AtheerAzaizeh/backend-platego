const Message = require("../models/message");
const Notification = require("../models/notification");
const Chat = require("../models/chat");

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text, image, audio } = req.body;
    const senderId = req.user.id;

    const chat = await Chat.findById(chatId).populate("participants");
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const receiver = chat.participants.find((p) => p._id.toString() !== senderId);
    if (!receiver) return res.status(400).json({ error: "Receiver not found" });

    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      text: text || "",
      image: image || null,
      audio: audio || null,
      timestamp: new Date()
    });

    await message.populate("sender", "firstName lastName img");

    // 👇 Save notification
    const senderName = `${message.sender.firstName} ${message.sender.lastName || ""}`.trim();
    if (text?.trim()) {
      await Notification.create({
        type:    'message',
        user:    receiver._id,
        message: `New message from ${senderName}: "${text.slice(0, 30)}..."`,
        chatId,
        sender:  senderId,
        isRead:  false,
      });
    }

    // 👇 Emit real-time message to the chat room
    req.io.to(chatId).emit("newMessage", {
        text: message.text,
        image: message.image,
        audio: message.audio,
        timestamp: message.timestamp,
        senderId: senderId
    });

    // 👇 Send notification to receiver
    req.io.to(`user_${receiver._id}`).emit("newMessageNotification", {
      chatId,
      message: text || "[Image]",
      senderName,
      senderId
    });

    res.json(message);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName img")
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

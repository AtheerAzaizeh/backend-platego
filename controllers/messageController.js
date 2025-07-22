const Message = require('../models/message');
const Chat = require('../models/chat');

// שליחת הודעה חדשה
exports.addMessage = async (req, res) => {
    const { fromUserID, toUserID, carID, message, date } = req.body;

    try {
        // בדיקה אם קיים צ'אט בין שני המשתמשים (לא תלוי ברכב)
        let chat = await Chat.findOne({
            users: { $all: [fromUserID, toUserID] },
            $expr: { $eq: [{ $size: "$users" }, 2] }
        });

        if (!chat) {
            // יצירת צ'אט חדש
            chat = new Chat({
                users: [fromUserID, toUserID],
                lastMessage: message,
                lastMessageTime: date
            });
            await chat.save();
        } else {
            // עדכון הודעה אחרונה בצ'אט קיים
            chat.lastMessage = message;
            chat.lastMessageTime = date;
            await chat.save();
        }

        // יצירת ההודעה
        const newMessage = new Message({
            chatID: chat._id,
            fromUserID,
            toUserID,
            carID,
            message,
            date
        });

        await newMessage.save();

        res.json({ ...newMessage.toObject(), chatID: chat._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding message' });
    }
};

// קבלת הודעות לפי רכב או משתמש
exports.getMessages = async (req, res) => {
    const { carID } = req.query;
    const userID = req.user.id;

    try {
        const messages = await Message.find({
            $or: [
                { carID },
                { fromUserID: userID },
                { toUserID: userID }
            ]
        });

        res.json(messages);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

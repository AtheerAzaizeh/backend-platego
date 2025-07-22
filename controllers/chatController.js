const Chat = require('../models/chat'); 
const User = require('../models/user'); 
// מביא את כל הצ'אטים של משתמש
exports.getChatsByUser = async (req, res) => {
    const userID = req.user.id;

    try {
        console.log(`Fetching chats for user ID: ${userID}`);

        const chats = await Chat.find({ users: userID })
            .populate('users', 'firstName img') // מציג את שם ותמונה של כל משתמש
            .sort({ lastMessageTime: -1 });

        console.log(`Fetched chats: ${JSON.stringify(chats)}`);
        res.json(chats);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching chats' });
    }
};

// יצירת צ'אט חדש בין שני משתמשים (או החזרת קיים)
exports.createChat = async (req, res) => {
    const userID = req.user.id;
    const { otherUserID } = req.body;

    try {
        // בדיקה אם כבר קיים צ'אט בין השניים
        let chat = await Chat.findOne({
            users: { $all: [userID, otherUserID] },
            $expr: { $eq: [{ $size: "$users" }, 2] }
        });

        if (chat) {
            console.log('Chat already exists');
            return res.json(chat);
        }

        // יצירת צ'אט חדש
        chat = new Chat({
            users: [userID, otherUserID],
            lastMessage: '',
            lastMessageTime: null
        });

        await chat.save();
        const populatedChat = await chat.populate('users', 'firstName img');
        res.status(201).json(populatedChat);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating chat' });
    }
};

// מחיקת צ'אט לפי מזהה
exports.deleteChat = async (req, res) => {
    const { chatID } = req.params;

    try {
        await Chat.findByIdAndDelete(chatID);
        res.json({ message: 'Chat deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting chat' });
    }
};

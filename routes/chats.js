const express = require('express');
const router = express.Router();
const { createOrGetChat , getUserChats , getChatById } = require('../controllers/chatController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/create-or-get', verifyToken, createOrGetChat);
router.get('/my-chats', verifyToken, getUserChats);
router.get('/:chatId', verifyToken, getChatById);

module.exports = router;

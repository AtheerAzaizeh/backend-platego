const express = require('express');
const router = express.Router();
const { createOrGetChat, getChatMessages, sendMessage } = require('../controllers/chatController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/create-or-get', verifyToken, createOrGetChat);
router.get('/:chatId/messages', verifyToken, getChatMessages);
router.post('/:chatId/send', verifyToken, sendMessage);

module.exports = router;

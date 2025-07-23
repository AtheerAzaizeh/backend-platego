const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/:chatId', verifyToken, messageController.getMessagesByChatId);
router.post('/:chatId', verifyToken, messageController.sendMessage);

module.exports = router;

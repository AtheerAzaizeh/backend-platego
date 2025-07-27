const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, messageController.sendMessage);
router.get('/:chatId', verifyToken, messageController.getMessages);

module.exports = router;

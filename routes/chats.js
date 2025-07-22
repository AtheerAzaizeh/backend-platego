const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/user', authenticateToken, chatController.getChatsByUser);

module.exports = router;

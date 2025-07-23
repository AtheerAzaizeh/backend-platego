const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/my', verifyToken, chatController.getMyChats);

module.exports = router;

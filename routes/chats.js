const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/my', verifyToken, chatController.getMyChats);
router.post('/create-or-get', verifyToken, chatController.createOrGetChat);

module.exports = router;

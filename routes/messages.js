const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, messageController.getMessages);
router.post('/', authenticateToken, messageController.addMessage);

module.exports = router;

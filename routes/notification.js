const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/my', verifyToken, notificationController.getMyNotifications);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;

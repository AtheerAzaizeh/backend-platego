const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/my', verifyToken, notificationController.getNotifications);
router.delete('/:id', verifyToken, notificationController.deleteNotification);
router.post('/my', verifyToken, notificationController.saveNotification);
router.get('/', verifyToken, notificationController.getNotifications);
router.put('/mark-read', verifyToken, notificationController.markAsRead);

module.exports = router;

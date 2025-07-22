const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', authenticateToken, volunteerController.registerVolunteer);
router.get('/status', authenticateToken, volunteerController.getVolunteerStatus);
router.put('/notify', authenticateToken, volunteerController.updateNotificationPreference);

module.exports = router;

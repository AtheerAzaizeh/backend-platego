const express = require('express');
const router = express.Router();
const rescueController = require('../controllers/rescueController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/request', authenticateToken, rescueController.submitRescueRequest);
router.get('/', authenticateToken, rescueController.getAllRescueRequests);

module.exports = router;

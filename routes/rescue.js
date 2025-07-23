const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const rescueController = require('../controllers/rescueController');

router.post('/create', verifyToken, rescueController.sendRescueRequest);
router.get('/my', verifyToken, rescueController.getMyRescueRequests);
router.delete('/:id', verifyToken, rescueController.deleteRescueRequest);
router.get('/all', verifyToken, rescueController.getAllRescueRequests);

module.exports = router;

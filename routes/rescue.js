const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const rescueController = require('../controllers/rescueController');

router.post('/create', verifyToken, rescueController.createRescueRequest);
router.get('/my', verifyToken, rescueController.getMyRescueRequests);
router.get('/all', verifyToken, rescueController.getAllRescueRequests);
router.put('/accept/:id', verifyToken, rescueController.acceptRescueRequest);
router.delete('/:id', verifyToken, rescueController.deleteRescueRequest);
router.get('/:id', verifyToken, rescueController.getRescueById); 
router.get('/:id/positions', verifyToken, rescueController.getRescuePositions);

module.exports = router;

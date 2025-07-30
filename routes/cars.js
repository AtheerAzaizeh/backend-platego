const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const authenticateToken = require('../middleware/authMiddleware');


router.get('/id/:id', authenticateToken, carController.findCarById); 
router.get('/:plate', authenticateToken, carController.findCarByPlate);
router.get('/', authenticateToken, carController.getMyCars);
router.post('/', authenticateToken, carController.addCar);
router.delete('/:id', authenticateToken, carController.deleteCar);
router.put('/:id', authenticateToken, carController.updateCar);

module.exports = router;

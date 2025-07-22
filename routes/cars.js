const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const authenticateToken = require('../middleware/authMiddleware');



router.get('/', authenticateToken, carController.getCars);
router.post('/', authenticateToken, carController.addCar);
router.delete('/:id', authenticateToken, carController.deleteCar);
router.get('/id/:id', authenticateToken, carController.findCarById); 
router.get('/count', authenticateToken, carController.countUserCars);
router.get('/:plate', authenticateToken, carController.findCarByPlate);


module.exports = router;

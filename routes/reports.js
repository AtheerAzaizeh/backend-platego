const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/car/:plate', verifyToken, reportController.getCarByPlate);
//router.post('/make', verifyToken, reportController.makeReport);
router.get('/my', verifyToken, reportController.getMyReports);
router.delete('/:id', verifyToken, reportController.deleteReport);
router.get('/all', verifyToken, reportController.getAllReports);
router.get('/:id', verifyToken, reportController.getReportById);
router.post('/create-with-coordinates', verifyToken, (req, res) => {
  const io = req.app.get('io'); // get io from app instance
  reportController.createReportWithCoordinates(req, res, io);
});


module.exports = router;

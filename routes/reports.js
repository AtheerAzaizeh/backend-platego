const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, reportController.getReports);
router.get('/:id', authenticateToken, reportController.getReportById);
router.post('/', authenticateToken, reportController.addReport);
router.delete('/:id', authenticateToken, reportController.deleteReport);


module.exports = router;

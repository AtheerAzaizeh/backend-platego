const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/status', authMiddleware, volunteerController.getVolunteerStatus);
router.post('/register', authMiddleware, volunteerController.registerAsVolunteer);
router.put('/update', authMiddleware, volunteerController.updateVolunteer);
router.get('/', authMiddleware, volunteerController.getAllVolunteers);
router.get('/updates', authMiddleware, volunteerController.getVolunteerUpdates);
router.put('/update-status', authMiddleware, volunteerController.updateAvailability);


module.exports = router;

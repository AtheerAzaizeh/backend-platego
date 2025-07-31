const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, volunteerController.getAllVolunteers);
router.get('/updates', authMiddleware, volunteerController.getVolunteerUpdates);
router.get('/status', authMiddleware, volunteerController.getVolunteerStatus);
router.post('/register', authMiddleware, volunteerController.registerAsVolunteer);


module.exports = router;

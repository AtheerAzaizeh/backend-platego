const express = require('express');
const router = express.Router();
const volunteerUpdatesController = require('../controllers/volunteerUpdatesController');

router.get('/', volunteerUpdatesController.getUpdates);

module.exports = router;

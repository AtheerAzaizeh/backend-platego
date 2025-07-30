const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', userController.getAllUsers);
router.get("/me", authMiddleware, userController.getMe);
router.put('/become-volunteer', authMiddleware, userController.becomeVolunteer);
router.put('/toggle-availability', authMiddleware, userController.toggleAvailability);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/register', userController.registerUser);
router.put('/become-volunteer', authMiddleware, userController.becomeVolunteer);
router.put('/toggle-availability', authMiddleware, userController.toggleAvailability);
router.get('/', userController.getAllUsers);
router.delete('/:id', userController.deleteUserById);

module.exports = router;

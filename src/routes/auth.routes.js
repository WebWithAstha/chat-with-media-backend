const express = require('express');
const { signup, login, getUserProfile, getAllUsers } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getUserProfile);
// Route for fetching all users
router.get('/all-users', authMiddleware, getAllUsers);

module.exports = router;

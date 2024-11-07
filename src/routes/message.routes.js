const express = require('express');
const { getChatBetweenUsers } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get chat between logged-in user and a particular user
router.get('/chats/:otherUserId', authMiddleware, getChatBetweenUsers);


module.exports = router;

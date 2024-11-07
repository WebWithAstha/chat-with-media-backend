const Message = require('../models/messageModel');

const sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body;
    const sender = req.user.userId;  // Assuming req.user is set by authMiddleware
    const message = await Message.create({ sender, recipient, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: 'Message sending failed', error: error.message });
  }
};

module.exports = { sendMessage };

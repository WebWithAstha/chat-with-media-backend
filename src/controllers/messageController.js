const Message = require('../models/messageModel');
const User = require('../models/userModel');

// Get chat messages between the logged-in user and another user
const getChatBetweenUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) return res.status(404).json({ message: 'User not found' });

    // Fetch and return chat messages
    const chatMessages = await Message.find({
      $or: [
        { sender: userId, sentTo: otherUserId },
        { sender: otherUserId, sentTo: userId },
      ],
    })
      .populate('sender sentTo', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({ chatMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getChatBetweenUsers };

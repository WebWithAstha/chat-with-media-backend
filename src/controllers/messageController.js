const Message = require('../models/messageModel');

// Get chat between logged-in user and a particular user
const getChatBetweenUsers = async (req, res) => {
  try {
    const userId = req.userId; // Extract userId from the authenticated request
    const { otherUserId } = req.params; // Get the other user's ID from the URL parameter

    // Ensure the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the chat between the logged-in user and the other user
    const chatMessages = await Message.find({
      $or: [
        { sender: userId, sentTo: otherUserId },
        { sender: otherUserId, sentTo: userId },
      ],
      'media.isDeleted': { $ne: true }, // Exclude deleted media
    })
    .populate('sender sentTo', 'username profilePicture') // Populate user info like username and profile picture
    .sort({ createdAt: -1 }); // Sort by the most recent message

    if (!chatMessages || chatMessages.length === 0) {
      return res.status(404).json({ message: 'No chat found between these users' });
    }

    res.status(200).json({ chatMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};






module.exports = { getChatBetweenUsers };

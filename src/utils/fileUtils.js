const { admin } = require("../config/firebase");
const Message = require("../models/messageModel");

// Handles media file expiry logic
const handleFileExpiry = async (mediaUrl) => {
  try {
    const msg = await Message.findOne({ 'media.url': mediaUrl });
    
    if (msg) {
      const createdAt = new Date(msg.createdAt);
      const expiryTime = createdAt.getTime() + (1 * 60 * 1000);  // 1 min expiry

      // Delete file if expired
      if (Date.now() >= expiryTime) {
        await deleteFileFromFirebase(mediaUrl);
        await Message.updateOne(
          { 'media.url': mediaUrl },
          { $set: { 'media.$.isDeleted': true } }
        );
      }
    }
  } catch (error) {
    console.error('Error handling expiry:', error);
  }
};

// Deletes file from Firebase
const deleteFileFromFirebase = async (fileUrl) => {
  try {
    const filePath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);
    await admin.storage().bucket().file(filePath).delete();
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = { handleFileExpiry };

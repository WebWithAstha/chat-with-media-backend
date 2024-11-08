const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  content: { type: String },
  media: [{
    url: { type: String },
    type: { type: String },
    name:{type: String},
    isDeleted: { type: Boolean, default: false } // New field for tracking deletion status
  }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  sentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
}, {
  timestamps: true
});


const Message = mongoose.model('message', messageSchema);
module.exports = Message;

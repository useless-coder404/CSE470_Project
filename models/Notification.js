const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'role',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'doctor'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['reminder', 'appointment', 'prescription', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);

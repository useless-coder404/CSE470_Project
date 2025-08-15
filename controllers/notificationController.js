const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'system') => {
  try {
    const notif = new Notification({ userId, title, message, type });
    await notif.save();
    return notif;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};


module.exports = {createNotification, getNotifications, markAsRead};
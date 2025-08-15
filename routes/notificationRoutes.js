const express = require('express');
const notifyRouter = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

notifyRouter.get('/', protect, getNotifications);
notifyRouter.patch('/:id/read', protect, markAsRead);

module.exports = notifyRouter;
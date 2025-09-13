const express = require('express');
const adminRouter = express.Router();
const { getPendingDoctors, verifyDoctor, getAllUsers, getAllDoctors, blockUser, unblockUser, deleteUser, auditLog, sendNotification, addHospital, getSystemSettings, updateSystemSettings, viewAIChatLogs } = require('../controllers/adminController');
const { viewAILogs } = require('../controllers/aiController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

adminRouter.use(protect, restrictTo('admin'));

// Doctor Verification
adminRouter.get('/doctors/pending', getPendingDoctors);
adminRouter.patch("/doctors/:id/verify", verifyDoctor);
adminRouter.get('/doctors', getAllDoctors);

// User Management
adminRouter.get('/users', getAllUsers);
adminRouter.patch('/users/:id/block', blockUser);
adminRouter.patch('/users/:id/unblock', unblockUser);
adminRouter.delete('/users/:id', deleteUser);

// Logs
adminRouter.get('/logs', auditLog);
adminRouter.get('/ai-logs', viewAILogs);
adminRouter.get('/ai-chat-logs', viewAIChatLogs);

// System Settings
adminRouter.get('/system-settings', getSystemSettings);
adminRouter.patch('/system-settings', updateSystemSettings);

// Notifications
adminRouter.post('/notify', sendNotification);

// Hospitals
adminRouter.post('/hospital', addHospital);

module.exports = adminRouter;
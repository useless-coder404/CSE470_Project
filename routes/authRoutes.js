const express = require('express');
const authRouter = express.Router();
const { registerUser, verifyOTP, loginUser, logout, verify2FA, resendOTP } = require('../controllers/authController');
const { updateUserProfile, getUserProfile, toggleTwoFA, deleteAccount, getHealthSummary, uploadProfilePic, changePassword, getAllDoctors } = require('../controllers/userController');
const { createReminder, getReminders, updateReminder, deleteReminder } = require('../controllers/reminderController');
const { uploadPrescriptionController, extractPrescriptionText, getPrescriptionsController } = require('../controllers/prescriptionController');
const { bookAppointment, rescheduleAppointment, cancelAppointment, getMyAppointments } = require('../controllers/appointmentController');
const { createHealthLog, getHealthLogs, updateHealthLog, deleteHealthLog } = require('../controllers/healthLogController');
const { triggerEmergency } = require('../controllers/emergencyController');
const { getPublicDoctors, getNearbyDoctors, searchDoctors } = require('../controllers/doctorController');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { chatWithAI, voiceChatWithAI } = require('../controllers/chatController');
const { diagnoseSymptoms, chatSymptoms, simplifyMedicalTerm, getVisitPrep } = require('../controllers/aiController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const twoFAEnforce = require('../middlewares/twoFAEnforce');
const { uploadPrescription, uploadVoice } = require('../middlewares/multer');
const { otpLimiter, loginLimiter, registerLimiter, searchLimiter, verify2FALimiter, emergencyLimiter, chatLimiter, aiLimiter } = require('../middlewares/rateLimiter');
const { sanitizeSearch, sanitizeProfileUpdate, sanitizeHealthLog, sanitizeReminder } = require('../middlewares/sanitizeMiddleware');
const validationHandler = require('../middlewares/validationHandler');

// Auth
authRouter.post('/register', registerLimiter, registerUser);
authRouter.post('/verify-otp', otpLimiter, verifyOTP);
authRouter.post('/resend-otp', resendOTP);
authRouter.post('/login', loginLimiter, loginUser);
authRouter.post('/verify-2fa', protect, restrictTo('user'), verify2FALimiter, verify2FA);

// Profile
authRouter.get('/profile', protect, restrictTo('user'), getUserProfile);
authRouter.patch('/update-profile', protect, restrictTo('user'), twoFAEnforce, sanitizeProfileUpdate, validationHandler, updateUserProfile);
authRouter.get('/health-summary', protect, restrictTo('user','doctor'), getHealthSummary);
authRouter.post('/upload-profile-pic', protect, restrictTo('user'), uploadProfilePic);
authRouter.post('/logout', protect, restrictTo('user'), logout);

//Profile Setting
authRouter.patch("/change-password", protect, restrictTo("user", "doctor", "admin"), changePassword);
authRouter.patch("/toggle-2fa", protect, restrictTo("user", "doctor"), toggleTwoFA);
authRouter.delete("/delete", protect, restrictTo("user", "doctor", "admin"), deleteAccount);

// Public Doctor Access
authRouter.get("/public", searchLimiter, sanitizeSearch, validationHandler, getPublicDoctors);
authRouter.get('/nearby', searchLimiter, sanitizeSearch, validationHandler, getNearbyDoctors);
authRouter.get('/search', searchLimiter, sanitizeSearch, validationHandler, searchDoctors);
authRouter.get('/all', protect, restrictTo("user"), getAllDoctors)

// Health Logs
authRouter.post('/healthlogs', protect, restrictTo('user'), sanitizeHealthLog, validationHandler, createHealthLog);
authRouter.patch('/healthlogs/:id', protect, restrictTo('user'), sanitizeHealthLog, validationHandler, updateHealthLog);
authRouter.delete('/healthlogs/:id', protect, restrictTo('user'), deleteHealthLog);
authRouter.get('/healthlogs', protect, restrictTo('user','doctor'), getHealthLogs);

// Reminders
authRouter.post('/reminders', protect, restrictTo('user'), sanitizeReminder, validationHandler, createReminder);
authRouter.get('/reminders', protect, restrictTo('user'), getReminders);
authRouter.patch('/reminders/:id', protect, restrictTo('user'), sanitizeReminder, validationHandler, updateReminder);
authRouter.delete('/reminders/:id', protect, restrictTo('user'), deleteReminder);

// Prescriptions
authRouter.post('/prescriptions', protect, restrictTo('user'), uploadPrescription.single('prescription'), uploadPrescriptionController);
authRouter.get("/prescriptions", protect, restrictTo("user"), getPrescriptionsController);
authRouter.post('/prescriptions/ocr', protect, restrictTo('user'), extractPrescriptionText);

// Appointments
authRouter.post('/appointments', protect, restrictTo('user'), bookAppointment);
authRouter.patch('/appointments/:id/reschedule', protect, restrictTo('user','doctor'), rescheduleAppointment);
authRouter.patch('/appointments/:id/cancel', protect, restrictTo('user','doctor'), cancelAppointment);
authRouter.get("/appointments/my", protect, restrictTo("user"), getMyAppointments);


// Notifications
authRouter.get('/notifications', protect, getNotifications);
authRouter.patch('/notifications/:id/read', protect, markAsRead);

// Emergency
authRouter.post('/emergency', protect, emergencyLimiter, triggerEmergency);

// Chat
authRouter.post('/chat/text', protect, twoFAEnforce, chatLimiter, chatWithAI);
authRouter.post('/chat/voice', protect, twoFAEnforce, chatLimiter, uploadVoice.single('voice'), voiceChatWithAI);

// AI Features
authRouter.post('/ai/diagnose', protect, twoFAEnforce, aiLimiter, diagnoseSymptoms);
authRouter.post('/ai/chat', protect, twoFAEnforce, aiLimiter, chatSymptoms);
authRouter.post('/ai/simplify', protect, twoFAEnforce, aiLimiter, simplifyMedicalTerm);
authRouter.get('/ai/visit-prep/:condition', protect, twoFAEnforce, aiLimiter, getVisitPrep);

module.exports = authRouter;
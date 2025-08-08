const { logout, verify2FA } = require('../controllers/authController');
const { deleteAccount, updateUserProfile, toggleTwoFA, getHealthSummary } = require('../controllers/userController');
const { createReminder, getReminders, updateReminder, deleteReminder } = require('../controllers/reminderController');
const { uploadPrescriptionController, extractPrescriptionText } = require('../controllers/prescriptionController');
const { bookAppointment, rescheduleAppointment, cancelAppointment } = require('../controllers/appointmentController');
const { createHealthLog, getHealthLogs, getHealthLog, updateHealthLog, deleteHealthLog } = require('../controllers/healthLogController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadPrescription } = require('../middlewares/multer');
const { sanitizeProfileUpdate, sanitizeHealthLog, sanitizeReminder } = require('../middlewares/sanitizeMiddleware');
const twoFAEnforce = require('../middlewares/twoFAEnforce');
const { verify2FALimiter } = require('../middlewares/rateLimiter');
const validationHandler = require('../middlewares/validationHandler');

const express = require('express');
const userRouter = express.Router();



//User
userRouter.patch('/update-profile', protect, restrictTo('user'), twoFAEnforce, sanitizeProfileUpdate, validationHandler, updateUserProfile);
userRouter.patch('/toggle-2fa', protect, restrictTo('user'), toggleTwoFA);
userRouter.post('/verify-2fa', protect, restrictTo('user'), verify2FALimiter, verify2FA);
userRouter.post('/logout', protect, restrictTo('user'), logout);
userRouter.delete('/delete', protect, restrictTo('user', 'admin'), twoFAEnforce, deleteAccount);

//Reminders
userRouter.post('/create-reminder', protect, restrictTo('user'), sanitizeReminder, validationHandler, createReminder);
userRouter.get('/get-reminder', protect, restrictTo('user'), getReminders);
userRouter.patch('/update-reminder/:id', protect, restrictTo('user'), sanitizeReminder, validationHandler, updateReminder);
userRouter.delete('/delete-reminder/:id',protect, restrictTo('user'), deleteReminder);

//Prescriptions
userRouter.post('/upload-prescription', protect, restrictTo('user'), uploadPrescription.single('prescription'), uploadPrescriptionController);
userRouter.get('/ocr', protect, restrictTo('user'), extractPrescriptionText);

//Appointment
userRouter.post('/book-appointment', protect, restrictTo('user'), bookAppointment);
userRouter.patch('/reschedule-appointment/:id', protect, restrictTo('user', 'doctor'), rescheduleAppointment);
userRouter.patch('/cancel-appointment/:id', protect, restrictTo('user', 'doctor'), cancelAppointment);

//Healthlog
userRouter.post('/create-healthlog', protect, restrictTo('user'), sanitizeHealthLog, validationHandler, createHealthLog);
userRouter.patch('/update-healthlog/:id', protect, restrictTo('user'), sanitizeHealthLog, validationHandler, updateHealthLog);
userRouter.delete('/delete-healthlog/:id', protect, restrictTo('user'), deleteHealthLog);
userRouter.get('/get-healthlogs', protect, restrictTo('user', 'doctor'), getHealthLogs);
userRouter.get('/get-healthlog/:id', protect, restrictTo('user', 'doctor'), getHealthLog);
userRouter.get('/get-health-summary', protect, restrictTo('user', 'doctor'), getHealthSummary);


module.exports = userRouter; 



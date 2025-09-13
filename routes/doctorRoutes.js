const express = require("express");
const doctorRouter = express.Router();
const { logout, verify2FA } = require('../controllers/authController');
const { uploadDocument, updateDoctorProfile, getPatientHealthSummary, searchPatients, getDashboardStats, 
    getRecentPatients, getDoctorNotifications, markDoctorNotificationAsRead } = require("../controllers/doctorController");
const { deleteAccount, toggleTwoFA, changePassword } = require('../controllers/userController');
const { getHealthLogs } = require('../controllers/healthLogController');
const { getDoctorAppointments, markComplete, cancelAppointmentByDoctor, rescheduleAppointment } = require('../controllers/appointmentController');
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { uploadDoctorDocs } = require("../middlewares/multer");
const { sanitizeProfileUpdate } = require('../middlewares/sanitizeMiddleware');
const { verify2FALimiter } = require('../middlewares/rateLimiter');
const twoFAEnforce = require("../middlewares/twoFAEnforce");
const validationHandler = require('../middlewares/validationHandler');

// Verification
doctorRouter.post('/upload-docs', protect, restrictTo('doctor'), uploadDoctorDocs, uploadDocument);

// Doctor Account
doctorRouter.patch('/update-profile', protect, restrictTo('doctor'), twoFAEnforce, sanitizeProfileUpdate, validationHandler, updateDoctorProfile);
doctorRouter.patch('/toggle-2fa', protect, restrictTo('doctor'), toggleTwoFA);
doctorRouter.post('/verify-2fa', protect, restrictTo('doctor'), verify2FALimiter, verify2FA);
doctorRouter.post('/logout', protect, restrictTo('doctor'), logout);
doctorRouter.delete('/delete', protect, restrictTo('doctor','admin'), deleteAccount);
doctorRouter.get("/search-patients", protect, restrictTo("doctor"), searchPatients);
doctorRouter.get("/dashboard-stats/:id", protect, restrictTo("doctor"), getDashboardStats);
doctorRouter.get("/recent-patients", protect, restrictTo("doctor"), getRecentPatients);
doctorRouter.get('/notifications', protect, restrictTo('doctor'), getDoctorNotifications);
doctorRouter.patch('/notifications/:id/read', protect, restrictTo('doctor'), markDoctorNotificationAsRead);
doctorRouter.patch("/doctor/change-password", protect, restrictTo("doctor"), changePassword);


// Health Logs (Doctor Access)
doctorRouter.get('/health-summary/:id', protect, restrictTo('doctor'), getPatientHealthSummary);
doctorRouter.get('/healthlogs', protect, restrictTo('user','doctor'), getHealthLogs);

// Appointments
doctorRouter.get('/appointments', protect, restrictTo('doctor','user'), getDoctorAppointments);
doctorRouter.patch('/appointments/:id/complete', protect, restrictTo('doctor'), markComplete);
doctorRouter.patch('/appointments/:id/reschedule', protect, restrictTo('doctor','user'), rescheduleAppointment);
doctorRouter.patch('/appointments/:id/cancel', protect, restrictTo('doctor'), cancelAppointmentByDoctor);

module.exports = doctorRouter;
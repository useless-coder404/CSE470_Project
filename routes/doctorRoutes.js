const { logout, verify2FA } = require('../controllers/authController');
const {uploadDocument, updateDoctorProfile} = require("../controllers/doctorController");
const { deleteAccount, toggleTwoFA, getHealthSummary } = require('../controllers/userController');
const { getHealthLogs, getHealthLog } = require('../controllers/healthLogController');
const { getDoctorAppointments, markComplete, cancelAppointmentByDoctor, rescheduleAppointment } = require('../controllers/appointmentController');
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {uploadDoctorDocs} = require("../middlewares/multer");
const { sanitizeProfileUpdate } = require('../middlewares/sanitizeMiddleware');
const { verify2FALimiter } = require('../middlewares/rateLimiter');
const twoFAEnforce = require("../middlewares/twoFAEnforce");
const validationHandler = require('../middlewares/validationHandler');

const express = require("express");
const doctorRouter = express.Router();


//Verification
doctorRouter.post('/upload-docs', protect, restrictTo('doctor'), uploadDoctorDocs.single("document"), uploadDocument);
//Doctor
doctorRouter.patch('/update-profile', protect, restrictTo('doctor'), twoFAEnforce, sanitizeProfileUpdate, validationHandler, updateDoctorProfile);
doctorRouter.patch('/toggle-2fa', protect, restrictTo('doctor'), toggleTwoFA);
doctorRouter.post('/verify-2fa', protect, restrictTo('doctor'), twoFAEnforce, verify2FALimiter, verify2FA);
doctorRouter.post('/logout', protect, restrictTo('doctor'), logout);
doctorRouter.delete('/delete', protect, restrictTo('doctor', "admin"), twoFAEnforce, deleteAccount);

//Healthlog
doctorRouter.get('/get-health-summary', protect, restrictTo('user', 'doctor'), getHealthSummary);
doctorRouter.get('/get-healthlogs', protect, restrictTo('user', 'doctor'), getHealthLogs);
doctorRouter.get('/get-healthlog/:id', protect, restrictTo('user', 'doctor'), getHealthLog);


//Appointment
doctorRouter.get('/get-appointments', protect, restrictTo('doctor'), getDoctorAppointments);
doctorRouter.patch('/appointments/:id/complete', protect, restrictTo('doctor'), markComplete);
doctorRouter.patch('/reschedule-appointment/:id', protect, restrictTo('user', 'doctor'), rescheduleAppointment);
doctorRouter.patch('/appointments/:id/cancel', protect, restrictTo('doctor'), cancelAppointmentByDoctor);


module.exports = doctorRouter;




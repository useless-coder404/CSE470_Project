const express = require('express');
const authRouter = express.Router();
const { registerUser, verifyOTP, loginUser } = require('../controllers/authController');
const { getPublicDoctors, getNearbyDoctors, searchDoctors } = require('../controllers/doctorController');
const { otpLimiter, loginLimiter, registerLimiter, searchLimiter } = require('../middlewares/rateLimiter');
const { sanitizeSearch } = require('../middlewares/sanitizeMiddleware');
const validationHandler = require('../middlewares/validationHandler');

//Normal 
authRouter.post('/register', registerLimiter, registerUser);
authRouter.post('/verify-otp', otpLimiter, verifyOTP);
authRouter.post('/login', loginLimiter, loginUser);

//Public Access
authRouter.get("/public", searchLimiter, sanitizeSearch, validationHandler, getPublicDoctors);
authRouter.get('/nearby', searchLimiter, sanitizeSearch, validationHandler, getNearbyDoctors);
authRouter.get('/search', searchLimiter, sanitizeSearch, validationHandler, searchDoctors);

module.exports = authRouter; 
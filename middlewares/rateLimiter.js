const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    handler: async (req, res) => {
        await AuditLog.create({
            userId: req.user ? req.user._id : null,
            action: 'Rate Limit Exceeded',
            metadata: { route: req.originalUrl, ip: req.ip, timestamp: new Date() }
        });
        res.status(429).json({ message: 'Too many requests, please try later.' });
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many registration attempts from this IP, please try again after an hour.',
    standardHeaders: true,
    legacyHeaders: false,
});

const searchLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 60,
    message: 'Too many requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
});

const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many OTP requests from this IP, please try again after an hour',
});

const verify2FALimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 requests
    message: 'Too many OTP verification attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,               // max 5 requests per minute
  message: 'Too many AI requests. Please try again later.'
});

const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: 'Too many emergency requests. Please try again later.'
});

const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10, // max 10 requests per user per minute
    message: 'Too many chat requests, please try again later'
});

module.exports = { loginLimiter, otpLimiter, verify2FALimiter, registerLimiter, searchLimiter, aiLimiter, emergencyLimiter, chatLimiter };
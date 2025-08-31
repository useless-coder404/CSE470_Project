const express = require('express');
const aiRouter = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const twoFAEnforce = require('../middlewares/twoFAEnforce');
const { aiLimiter } = require('../middlewares/rateLimiter');
const { diagnoseSymptoms, chatSymptoms, simplifyMedicalTerm, getVisitPrep, viewAILogs } = require('../controllers/aiController');

// User AI Endpoints
aiRouter.post('/diagnose-symptoms', protect, twoFAEnforce, aiLimiter, diagnoseSymptoms);
aiRouter.post('/chat-symptoms', protect, twoFAEnforce, aiLimiter, chatSymptoms);
aiRouter.post('/simplify-term', protect, twoFAEnforce, aiLimiter, simplifyMedicalTerm);
aiRouter.get('/visit-prep/:condition', protect, twoFAEnforce, aiLimiter, getVisitPrep);

// Admin AI Logs
aiRouter.get('/ai-logs', protect, restrictTo('admin'), viewAILogs);

module.exports = aiRouter;
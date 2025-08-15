const asyncHandler = require('express-async-handler');
const User = require("../models/User");
const HealthLog = require('../models/HealthLog');
const AuditLog = require('../models/AuditLog');
const sanitizeInput = require('../utils/sanitizeInput');
const generateOTP = require('../utils/generateOTP');
const generateRecoveryCodes = require('../utils/recoveryCode');
const sendEmail = require('../utils/sendEmail');


const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const Prescription = require('../models/Prescription');


const toggleTwoFA = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    // Disable 2FA
    if (user.isTwoFAEnabled) {
      user.isTwoFAEnabled = false;
      user.twoFAToken = null;
      user.twoFATokenExpires = null;
      user.twoFASetupPending = false;
      user.recoveryCodes = [];
      await user.save();

      await AuditLog.create({
        action: 'Disabled 2FA',
        performedBy: user._id,
        details: { email: user.email }
      });

      return res.status(200).json({ message: '2FA has been disabled.' });

    } else {
      // Enable 2FA
      const otp = generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      const recoveryCodesRawAndHashed = await generateRecoveryCodes();

      user.twoFAToken = otp;
      user.twoFATokenExpires = expires;
      user.twoFASetupPending = true;
      user.recoveryCodes = recoveryCodesRawAndHashed.map(rc => ({
        code: rc.hashedCode,
        used: false
      }));

      await user.save();

      await AuditLog.create({
        action: 'Enabled 2FA (pending verification)',
        performedBy: user._id,
        details: { email: user.email }
      });

      await sendEmail({
        to: user.email,
        subject: 'Your 2FA Setup OTP',
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
      });

      return res.status(200).json({
        message: '2FA enabled (pending verification). Please check your email for the OTP.',
        expiresAt: expires,
        recoveryCodes: recoveryCodesRawAndHashed.map(rc => rc.rawCode),
      });
    }

  } catch (err) {
    console.error('2FA toggle error:', err);
    return res.status(500).json({ message: 'Error toggling 2FA.' });
  }
};

const updateUserProfile = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'username', 'age', 'gender', 'contact'];
    const updates = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = sanitizeInput(req.body[field]);
        }
    });

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    // Audit Log entry
    await AuditLog.create({
        performedBy: req.user._id,
        action: 'update_profile',
        details: { updatedFields: Object.keys(updates) }
    });

    res.status(200).json({
        status: 'success',
        message: 'Profile updated',
        user: updatedUser
    });
});

const deleteAccount = async (req, res) => {
    try {
      const userId = req.user._id;
        
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      await User.updateOne(
        { _id: req.user._id },
        {
          $set: {
            contact: null,
            verificationStatus: null,
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );

      
      await AuditLog.create({
        action: 'User Account Deleted',
        performedBy: req.user._id,
        details: { userId: req.user._id }

      });
      
      res.status(200).json({ message: 'Account deleted successfully.' });
    
    } catch (error) {
      console.error("Delete Account Error:", error);
      res.status(500).json({ error: 'Server error during account deletion.' });
    }
};

const getHealthSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all health logs of the user
    const logs = await HealthLog.find({ userId }).sort({ date: -1 });

    if (!logs.length) {
      return res.status(200).json({
        success: true,
        summary: {
          latestLog: null,
          averages: {
            weight: null,
            bloodPressure: null,
            heartRate: null,
            temperature: null
          },
          totalLogs: 0
        }
      });
    }

    const latestLog = logs[0];

    // Compute averages
    const avgWeight = logs.reduce((sum, l) => sum + (l.weight || 0), 0) / logs.length;
    const avgBP = logs.reduce((sum, l) => {
      if (l.vitals?.bloodPressure) {
        const [sys] = l.vitals.bloodPressure.split('/').map(Number);
        return sum + (sys || 0);
      }
      return sum;
    }, 0) / logs.length;
    const avgHR = logs.reduce((sum, l) => sum + (l.vitals?.heartRate || 0), 0) / logs.length;
    const avgTemp = logs.reduce((sum, l) => sum + (l.vitals?.temperature || 0), 0) / logs.length;

    res.status(200).json({
      success: true,
      summary: {
        latestLog,
        averages: {
          weight: avgWeight,
          bloodPressure: avgBP,
          heartRate: avgHR,
          temperature: avgTemp
        },
        totalLogs: logs.length
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get health summary' });
  }
};

module.exports = { updateUserProfile, toggleTwoFA, deleteAccount, getHealthSummary };
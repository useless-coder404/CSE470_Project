const asyncHandler = require('express-async-handler');
const User = require("../models/User");
const sanitizeInput = require('../utils/sanitizeInput');
const AuditLog = require('../models/AuditLog');
const generateOTP = require('../utils/generateOTP');
const generateRecoveryCodes = require('../utils/recoveryCode');
const sendEmail = require('../utils/sendEmail');

const HealthLog = require('../models/HealthLog');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const Prescription = require('../models/Prescription');


const toggleTwoFA = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.isTwoFAEnabled) {
      // Disable 2FA
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
      // Enable 2FA - generate OTP and recovery codes
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
        performedBy: req.user._id,          // <-- changed here
        action: 'update_profile',
        details: { updatedFields: Object.keys(updates) }  // renamed metadata to details (to match schema)
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
        performedBy: req.user._id,  // << This is REQUIRED
        details: { userId: req.user._id }

      });
      
      res.status(200).json({ message: 'Account deleted successfully.' });
    
    } catch (error) {
      console.error("Delete Account Error:", error); // this line
      res.status(500).json({ error: 'Server error during account deletion.' });
    }
};

const getHealthSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch latest health log
    const latestLog = await HealthLog.findOne({ user: userId }).sort({ date: -1 });

    // Aggregate health log data (e.g., averages)
    const logs = await HealthLog.find({ user: userId });
    const avgWeight = logs.length ? (logs.reduce((sum, log) => sum + (log.weight || 0), 0) / logs.length) : null;
    const avgBP = logs.length ? (
      logs.reduce((sum, log) => sum + ((log.bloodPressure && log.bloodPressure.systolic) || 0), 0) / logs.length
    ) : null;

    // Appointments: upcoming & past
    const upcomingAppointments = await Appointment.find({ user: userId, date: { $gte: new Date() } }).sort({ date: 1 });
    const pastAppointments = await Appointment.find({ user: userId, date: { $lt: new Date() } }).sort({ date: -1 });

    // Reminders
    const activeReminders = await Reminder.find({ user: userId, completed: false });
    const completedReminders = await Reminder.find({ user: userId, completed: true });

    // Prescriptions
    const prescriptions = await Prescription.find({ user: userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      summary: {
        latestLog,
        averages: {
          weight: avgWeight,
          bloodPressure: avgBP
        },
        appointments: {
          upcoming: upcomingAppointments,
          past: pastAppointments
        },
        reminders: {
          active: activeReminders,
          completed: completedReminders
        },
        prescriptions: {
          total: prescriptions.length,
          recent: prescriptions.slice(0, 5)
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get health summary' });
  }
};

module.exports = { updateUserProfile, toggleTwoFA, deleteAccount, getHealthSummary };




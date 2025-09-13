const asyncHandler = require('express-async-handler');
const User = require("../models/User");
const HealthLog = require('../models/HealthLog');
const Doctor = require("../models/DoctorProfile");
const { uploadProfilePicture } = require("../middlewares/multer")

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -otp -twoFAToken -twoFATokenExpires");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const profileData = {
    ...user.toJSON(),
    completion: user.completion || 0
  };

  res.status(200).json({ success: true, user: profileData });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name','username','age','gender','contact','birthday','address','bloodGroup','intro'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: "Profile updated", user: updatedUser });
});

const getHealthSummary = asyncHandler(async (req, res) => {
  const logs = await HealthLog.find({ userId: req.user._id }).sort({ date: -1 });

  if (!logs.length) return res.status(200).json({
    success: true,
    summary: {
      latestLog: null,
      averages: { weight: null, bloodPressure: null, heartRate: null, temperature: null },
      current: { weight: null, bloodPressure: null, heartRate: null, temperature: null },
      totalLogs: 0
    }
  });

  const latestLog = logs[0];
  const avgWeight = logs.reduce((sum, l) => sum + (l.weight || 0), 0) / logs.length;
  const avgHR = logs.reduce((sum, l) => sum + (l.vitals?.heartRate || 0), 0) / logs.length;
  const avgTemp = logs.reduce((sum, l) => sum + (l.vitals?.temperature || 0), 0) / logs.length;
  const avgBP = logs.reduce((sum, l) => {
    if (l.vitals?.bloodPressure) {
      const [sys] = l.vitals.bloodPressure.split('/').map(Number);
      return sum + (sys || 0);
    }
    return sum;
  }, 0) / logs.length;

  res.status(200).json({
    success: true,
    summary: {
      latestLog,
      averages: { weight: avgWeight, bloodPressure: avgBP, heartRate: avgHR, temperature: avgTemp },
      current: {
        weight: latestLog.weight || null,
        bloodPressure: latestLog.vitals?.bloodPressure || null,
        heartRate: latestLog.vitals?.heartRate || null,
        temperature: latestLog.vitals?.temperature || null
      },
      totalLogs: logs.length
    }
  });
});

const uploadProfilePic = [
  uploadProfilePicture.single('profilePic'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: `/uploads/profile-pics/${req.file.filename}` },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      user
    });
  })
];

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password" });
  }
};


const toggleTwoFA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isTwoFAEnabled = !user.isTwoFAEnabled;
    await user.save();

    res.status(200).json({
      message: `2FA ${user.isTwoFAEnabled ? "enabled" : "disabled"} successfully`,
      isTwoFAEnabled: user.isTwoFAEnabled
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle 2FA" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isDoctorVerified: true }).select("name specialty");
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

module.exports = { updateUserProfile, getUserProfile, toggleTwoFA, deleteAccount, getHealthSummary, uploadProfilePic, changePassword, getAllDoctors };
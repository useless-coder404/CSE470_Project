const User = require('../models/User');
const DoctorProfile = require("../models/DoctorProfile");
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');
const Hospital = require('../models/Hospital');
const SystemSettings = require('../models/SystemSetting');
const ChatLog = require('../models/ChatLog');


const getPendingDoctors = async (req, res) => {
  try {
    const { exact } = req.query;
    
    let query = { role: "doctor", verificationStatus: "Pending" };

    if (exact) {
      query.$or = [
        { name: exact },
        { email: exact }
      ];
    }

    const doctors = await User.find(query).select("-password").populate("doctorProfile");
    res.status(200).json({
      status: "success",
      results: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const { search, exact } = req.query;
    let query = { role: "user" };

    if (exact) {
      query.$or = [
        { name: exact },   
        { email: exact }  
      ];
    } else if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).select("-password");

    res.status(200).json({
      status: "success",
      results: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const { search, exact, verified } = req.query; 
    let query = { role: "doctor" };

    if (verified === "true") query.isVerified = true;

    if (exact) {
      query.$or = [
        { name: exact },   
        { email: exact }   
      ];
    } else if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const doctors = await User.find(query)
      .select("-password")
      .populate("doctorProfile");

    res.status(200).json({
      status: "success",
      results: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const profile = await DoctorProfile.findOne({ userId: id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    if (action === 'approve') {
      doctor.verificationStatus = 'Verified';
      doctor.docsUploaded = true; 
      profile.credentials.status = 'Verified';
      profile.isDoctorVerified = true;
      profile.documents.forEach(doc => (doc.status = 'Verified'));
    } else {
      doctor.verificationStatus = 'Rejected';
      doctor.docsUploaded = false; 
      profile.credentials.status = 'Rejected';
      profile.documents.forEach(doc => (doc.status = 'Rejected'));
    }
    
    await doctor.save();
    await profile.save();

    await AuditLog.create({
      action: `Doctor Verification ${action === "approve" ? "Approved" : "Rejected"}`,
      performedBy: req.user._id,
      details: { doctorId: doctor._id, doctorEmail: doctor.email },
    });

    const emailSubject = action === 'approve' ? 'Doctor Verification Approved' : 'Doctor Verification Rejected';
    const emailBody = `Hello ${doctor.name}, your verification status has been updated to: ${doctor.verificationStatus}.`;
    const html = `<p>Hello <strong>${doctor.name}</strong>, your verification status has been updated to: <strong>${doctor.verificationStatus}</strong>.</p>`;
    
    await sendEmail({
      to: doctor.email,
      subject: emailSubject,
      text: emailBody,
      html: html,
    });
    
    res.status(200).json({ status: 'success', message: `Doctor verification ${action}d.` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ status: "success", message: "User blocked successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


const unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: false },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ status: "success", message: "User unblocked successfully" });
    
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { deletedAt: new Date() },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ status: "success", message: "User soft-deleted successfully" });
    
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const auditLog = async (req, res) => {
    try {
        const logs = await AuditLog.find().populate("performedBy", "email role").sort({ createdAt: -1 });
        res.status(200).json({ status: "success", results: logs.length, logs });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const sendNotification = async (req, res) => {
    try {
        const { userId, message, title, type } = req.body;
        if (!userId || !message || !title || !type) {
            return res.status(400).json({ message: "userId and message are required." });
        }
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        await sendEmail({
            to: user.email,
            subject: "Admin Notification",
            text: message,
            html: `<p>${message}<p>`,
        });
        
        res.status(200).json({ status: "success", message: "Notification sent (stub)" });
    } catch (error) {
        console.error("Notification error:", error);
        res.status(500).json({ message: "Failed to send notification" });
    }
};

const addHospital = async (req, res) => {
  try {
    const { name, address, phone, email, lat, lng } = req.body;

    if (!name || !lat || !lng) {
      return res.status(400).json({ message: 'Hospital name and coordinates are required' });
    }

    const hospital = await Hospital.create({
      name,
      address,
      phone,
      email,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }
    });

    res.status(201).json({ status: 'success', hospital });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add hospital' });
  }
};


const getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }
        res.status(200).json(settings);
    } catch (err) {
        console.error('Error getting system settings:', err.message);
        res.status(500).json({ error: 'Failed to get system settings' });
    }
};

const updateSystemSettings = async (req, res) => {
    try {
        const { voiceInputEnabled, aiChatLogsEnabled } = req.body;
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }

        if (voiceInputEnabled !== undefined) settings.voiceInputEnabled = voiceInputEnabled;
        if (aiChatLogsEnabled !== undefined) settings.aiChatLogsEnabled = aiChatLogsEnabled;

        await settings.save();
        res.status(200).json(settings);
    } catch (err) {
        console.error('Error updating system settings:', err.message);
        res.status(500).json({ error: 'Failed to update system settings' });
    }
};

const viewAIChatLogs = async (req, res) => {
    try {
        const logs = await ChatLog.find().sort({ createdAt: -1 }).limit(100); // last 100 entries
        res.status(200).json(logs);
    } catch (err) {
        console.error('Error fetching AI chat logs:', err.message);
        res.status(500).json({ error: 'Failed to fetch AI chat logs' });
    }
};


module.exports = { getPendingDoctors, verifyDoctor, getAllUsers, getAllDoctors, 
    blockUser, unblockUser, deleteUser, auditLog, sendNotification, addHospital, getSystemSettings, updateSystemSettings, viewAIChatLogs };
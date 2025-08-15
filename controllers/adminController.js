const User = require('../models/User');
const DoctorProfile = require("../models/DoctorProfile");
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');

const getPendingDoctors = async (req, res) => {
    try {
        const pendingDoctors = await User.find({
            role: 'doctor',
            verificationStatus: 'Pending'
        }).populate('doctorProfile').select('-password -otp -otpExpiresAt');

        res.status(200).json({
            status: 'success',
            results: pendingDoctors.length,
            doctors: pendingDoctors
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
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
            profile.credentials.status = 'Verified';
            profile.documents.forEach(doc => (doc.status = 'Verified'));
        } else {
            doctor.verificationStatus = 'Rejected';
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

        //Send Email
        const emailSubject = action === 'approve' ? 'Doctor Verification Approved' : 'Doctor Verification Rejected';
        const emailBody = `Hello ${doctor.name}, your verification status has been updated to: ${doctor.verificationStatus}.`;
        const html = `<p>Hello <strong>${doctor.name}<strong>, your verification status has been updated to: <strong>${doctor.verificationStatus}<strong>.`;
        
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

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
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
        const doctors = await User.find({ role: "doctor" }).select("-password").populate("doctorProfile");
        res.status(200).json({
            status: "success",
            results: doctors.length,
            doctors,
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
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

module.exports = { getPendingDoctors, verifyDoctor, getAllUsers, getAllDoctors, 
    blockUser, unblockUser, deleteUser, auditLog, sendNotification };
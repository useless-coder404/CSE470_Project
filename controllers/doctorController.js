const asyncHandler = require('express-async-handler');
const dayjs = require('dayjs');
const mongoose = require('mongoose');
const sanitizeInput = require('../utils/sanitizeInput');
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const AuditLog = require('../models/AuditLog');
const HealthLog = require('../models/HealthLog');
const Appointment = require("../models/Appointment")
const Notification = require('../models/Notification');


const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;

    const files = [];
    if (req.files.idCard) files.push(req.files.idCard[0]);
    if (req.files.certificate) files.push(req.files.certificate[0]);

    console.log("Received files:", files);

    if (!files.length) {
      return res.status(400).json({ message: "No documents uploaded" });
    }

    let profile = await DoctorProfile.findOne({ userId });
    if (!profile) {
      profile = new DoctorProfile({
        userId,
        documents: [],
        clinicLocation: { type: "Point", coordinates: [0, 0] },
      });
    }

    files.forEach((file) => {
      profile.documents.push({
        filename: file.filename,
        filetype: file.mimetype,
        status: "Pending",
      });
    });

    await profile.save();

    await User.findByIdAndUpdate(userId, {
      verificationStatus: "Pending",
      docsUploaded: true,
      doctorProfile: profile._id,
    });

    await Notification.create({
      recipientId: userId,
      title: "Doctor Verification",  
      role: "doctor",                            
      message: "New doctor uploaded documents. Pending verification.",                        
      type: "system",
    });


    res.status(200).json({
      message: "Documents uploaded successfully!",
      verificationStatus: "Pending",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getPublicDoctors = asyncHandler(async (req, res) => {
    try {
        const { name, specialty } = req.query;

        const userQuery = {
            role: 'doctor',
            verificationStatus: 'Verified',
            isBlocked: false,
        };

        if (name) {
            userQuery.name = { $regex: name, $options: 'i' };
        }

        let doctors = await User.find(userQuery)
            .select('-password -otpToken -twoFASecret -recoveryCodes ')
            .populate({
                path: 'doctorProfile',
                select: 'specialty bio clinicLocation phone rating experience availability fees',
                match: specialty ? { specialty: { $regex: specialty, $options: 'i' } } : {},
            });

        doctors = doctors.filter(doc => doc.doctorProfile);

        res.status(200).json({
            status: 'success',
            results: doctors.length,
            doctors,
        });
    } catch (error) {
        console.error('Public doctors fetch error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch public doctors' });
    }
});

const updateDoctorProfile = asyncHandler(async (req, res) => { 
  const doctorId = req.user._id;

  if ('email' in req.body || 'role' in req.body) { 
    return res.status(400).json({ 
      status: 'fail', 
      errors: [{ msg: "Email and role cannot be updated" }] 
    }); 
  } 
  
  const allowedFields = [ 
    'specialty', 'bio', 'phone', 'clinicLocation', 
    'experience', 'fees', 'availability' 
  ]; 
  
  const updates = {}; 
  
  for (let field of allowedFields) { 
    const value = req.body[field];
    if (!value) continue;

    if (field === 'clinicLocation') {
      if (
        typeof value !== 'object' || value.type !== 'Point' ||
        !Array.isArray(value.coordinates) || value.coordinates.length !== 2 ||
        typeof value.coordinates[0] !== 'number' || typeof value.coordinates[1] !== 'number'
      ) {
        return res.status(400).json({ status: 'fail', errors: [{ msg: "Invalid clinicLocation format" }] });
      }
      updates['clinicLocation'] = value; 
    }

    else if (field === 'availability') {
      if (!Array.isArray(value)) {
        return res.status(400).json({ status: 'fail', errors: [{ msg: "Availability must be an array" }] });
      }

      for (let slot of value) {
        if (
          !slot.day || !slot.startTime || !slot.endTime ||
          typeof slot.day !== 'string' || typeof slot.startTime !== 'string' || typeof slot.endTime !== 'string'
        ) {
          return res.status(400).json({ status: 'fail', errors: [{ msg: "Invalid availability slot format" }] });
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(slot.day)) {
          return res.status(400).json({ status: 'fail', errors: [{ msg: "Invalid day in availability" }] });
        }

        if (dayjs(slot.startTime, 'HH:mm').isAfter(dayjs(slot.endTime, 'HH:mm'))) {
          return res.status(400).json({ status: 'fail', errors: [{ msg: "Start time must be before end time" }] });
        }
      }

      updates['availability'] = value; 
    }

    else if (typeof value === 'string' || typeof value === 'number') {
      updates[field] = sanitizeInput(value);
    }
  }

  const updatedDoctor = await DoctorProfile.findOneAndUpdate(
    { userId: doctorId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedDoctor) {
    return res.status(404).json({ status: 'fail', message: 'Doctor profile not found' });
  }

  await AuditLog.create({
    action: 'Doctor Profile Updated',
    performedBy: doctorId,
    details: updates,
  });

  res.status(200).json({ status: 'success', message: "Profile updated", doctor: updatedDoctor });
});

const getNearbyDoctors = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ status: 'fail', message: 'Latitude and Longitude are required.' });
        }

        const distanceInMeters = radius * 1000; // km to meters

        const doctors = await DoctorProfile.find({
            clinicLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: distanceInMeters,
                },
            },
        }).populate({
            path: 'userId',
            match: { verificationStatus: 'Verified', isBlocked: false, role: 'doctor' },
            select: 'name email username',
        });

        const filteredDoctors = doctors.filter(doc => doc.userId);

        res.status(200).json({
            status: 'success',
            results: filteredDoctors.length,
            doctors: filteredDoctors,
        });
    } catch (error) {
        console.error('Geo search error:', error);
        res.status(500).json({ status: 'fail', message: 'Geo search failed' });
    }
};

const searchDoctors = asyncHandler(async (req, res) => {
    try {
        const { specialty, clinicLocation, name } = req.query;

        const userQuery = {
            role: 'doctor',
            verificationStatus: 'Verified',
            isBlocked: false,
        };

        if (name) userQuery.name = { $regex: name, $options: 'i' };

        let doctors = await User.find(userQuery)
            .select('-password -otpToken -recoveryCodes')
            .populate({
                path: 'doctorProfile',
                select: 'specialty bio clinicLocation phone rating experience availability fees',
            });

        if (specialty) {
            doctors = doctors.filter(doc =>
                doc.doctorProfile?.specialty?.toLowerCase().includes(specialty.toLowerCase())
            );
        }

        if (clinicLocation) {
            doctors = doctors.filter(doc =>
                doc.doctorProfile?.clinicLocation &&
                doc.doctorProfile.clinicLocation.type === 'Point' &&
                doc.doctorProfile.clinicLocation.coordinates.join(',').includes(clinicLocation)
            );
        }

        res.status(200).json({
            status: 'success',
            results: doctors.length,
            doctors,
        });

    } catch (error) {
        console.error('Doctor search error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const getPatientHealthSummary = async (req, res) => {
  try {
    const patientId = await User.findOne({ _id: req.params.id, role: 'user' });

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const logs = await HealthLog.find({ userId: patientId }).sort({ date: -1 });
    const latestLog = logs[0] || null;

    const totalLogs = logs.length;
    const avgWeight = totalLogs ? logs.reduce((sum, log) => sum + (log.weight || 0), 0) / totalLogs : null;
    const avgHeartRate = totalLogs ? logs.reduce((sum, log) => sum + ((log.vitals?.heartRate) || 0), 0) / totalLogs : null;
    const avgTemp = totalLogs ? logs.reduce((sum, log) => sum + ((log.vitals?.temperature) || 0), 0) / totalLogs : null;

    let avgBP = null;
    if (totalLogs) {
      const bpValues = logs
        .filter(log => log.vitals?.bloodPressure)
        .map(log => {
          const [systolic, diastolic] = log.vitals.bloodPressure.split('/').map(Number);
          return { systolic, diastolic };
        });
      if (bpValues.length) {
        avgBP = {
          systolic: bpValues.reduce((sum, bp) => sum + bp.systolic, 0) / bpValues.length,
          diastolic: bpValues.reduce((sum, bp) => sum + bp.diastolic, 0) / bpValues.length,
        };
      }
    }

    res.status(200).json({
      success: true,
      patient: { _id: patient._id, name: patient.name, email: patient.email },
      summary: {
        latestLog,
        averages: {
          weight: avgWeight,
          heartRate: avgHeartRate,
          temperature: avgTemp,
          bloodPressure: avgBP
        },
        totalLogs
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get patient health summary' });
  }
};

const searchPatients = async (req, res) => {
  try {
    const { name } = req.query;
    const regex = new RegExp(name, "i");
    const patients = await User.find({ name: regex }).select("_id name email");
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const totalPatients = await Appointment.distinct("patient", { doctor: doctorId }).count();
    const upcomingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "scheduled",
      date: { $gte: new Date() },
    });
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "completed",
    });
    const pendingVerifications = await Appointment.countDocuments({
      doctor: doctorId,
      status: "pending_verification",
    });

    res.json({
      totalPatients,
      upcomingAppointments,
      completedAppointments,
      pendingVerifications,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

const getRecentPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const appointments = await Appointment.find({ doctor: doctorId })
      .sort({ date: -1 })
      .limit(5)
      .populate("patient", "_id name");

    const patients = appointments.map((appt) => ({
      _id: appt.patient._id,
      name: appt.patient.name,
      lastAppointment: appt.date,
      healthSummary: appt.patient.healthSummary || {},
    }));

    res.json({ patients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent patients" });
  }
};

const getDoctorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }) // req.user is doctor
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

const markDoctorNotificationAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

module.exports = { uploadDocument, getPublicDoctors, updateDoctorProfile, getNearbyDoctors, searchDoctors, 
  getPatientHealthSummary, searchPatients, getDashboardStats, getRecentPatients, getDoctorNotifications, markDoctorNotificationAsRead };